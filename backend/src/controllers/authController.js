const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { isValidEmail, hasRequiredFields } = require('../utils/validation');
const { logAction } = require('../services/auditService');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET must be defined');
}

const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

exports.registerJobSeeker = async (req, res) => {
    try {
        console.log("Registration attempt - Body:", req.body);
        console.log("Registration attempt - Files:", req.files);

        // Include maritalStatus in required fields as it is mandatory in Prisma schema
        const required = ['fullName', 'gender', 'age', 'maritalStatus', 'password', 'experienceYears', 'expectedSalary', 'preferredLocation', 'preferredArrangement'];
        const missing = hasRequiredFields(req.body, required);

        if (missing.length > 0) {
            console.warn("Registration failed - Missing fields:", missing);
            return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
        }

        const {
            fullName, gender, age, religion, maritalStatus, phone, email,
            password, bio, skills, languages, experienceYears, expectedSalary,
            preferredLocation, preferredArrangement
        } = req.body;

        if (!phone && !email) {
            return res.status(400).json({ error: 'At least one contact method (email or phone) is required' });
        }

        if (email && !isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Validate Enums to prevent Prisma crashes
        const validGenders = ['MALE', 'FEMALE', 'OTHER'];
        if (!validGenders.includes(gender)) {
            return res.status(400).json({ error: `Invalid gender. Must be one of: ${validGenders.join(', ')}` });
        }

        const validMaritalStatus = ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'];
        if (!validMaritalStatus.includes(maritalStatus)) {
            return res.status(400).json({ error: `Invalid marital status. Must be one of: ${validMaritalStatus.join(', ')}` });
        }

        // Check for required identity documents
        if (!req.files || !req.files.profilePhoto || !req.files.idDocument) {
            console.warn("Registration failed - Missing documents. Files received:", req.files);
            return res.status(400).json({
                error: 'Baseline identity requirements not met. Both Profile Photo and ID Document (Kebele ID/Passport) are required.'
            });
        }

        // Check existing
        const existingConditions = [];
        if (email) existingConditions.push({ email });
        if (phone) existingConditions.push({ phone });

        const existing = await prisma.jobSeeker.findFirst({
            where: { OR: existingConditions }
        });

        if (existing) {
            const field = existing.email === email ? 'Email' : 'Phone number';
            return res.status(409).json({ error: `${field} already exists. Please use a different one or login.` });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Extract file paths
        const profilePhotoPath = `/uploads/profilePhoto/${req.files.profilePhoto[0].filename}`;
        const idDocumentPath = req.files.idDocument ? `/uploads/idDocument/${req.files.idDocument[0].filename}` : null;

        // Parse skills
        let formattedSkills = skills;
        if (typeof skills === 'string') {
            try {
                formattedSkills = JSON.parse(skills);
            } catch (e) {
                formattedSkills = skills.split(',').map(s => s.trim()).filter(s => s);
            }
        }

        // Parse languages
        let formattedLanguages = languages || [];
        if (typeof languages === 'string') {
            try {
                formattedLanguages = JSON.parse(languages);
            } catch (e) {
                formattedLanguages = languages.split(',').map(l => l.trim()).filter(l => l);
            }
        }

        const seekerData = {
            fullName,
            gender,
            age: parseInt(age) || 18,
            religion,
            maritalStatus,
            phone,
            email,
            password: hashedPassword,
            bio,
            skills: Array.isArray(formattedSkills) ? formattedSkills : [],
            languages: Array.isArray(formattedLanguages) ? formattedLanguages : [],
            experienceYears: parseInt(experienceYears) || 0,
            expectedSalary: parseInt(expectedSalary) || 0,
            preferredLocation,
            preferredArrangement,
            profilePhoto: profilePhotoPath,
            idDocument: idDocumentPath
        };

        const seeker = await prisma.jobSeeker.create({
            data: seekerData
        });

        const token = generateToken({ id: seeker.id, role: 'JOB_SEEKER' });
        res.status(201).json({ token, user: { id: seeker.id, fullName: seeker.fullName, role: 'JOB_SEEKER' } });
    } catch (error) {
        console.error("Registration error:", error);

        // Specific error handling for Prisma
        if (error.code === 'P2002') {
            return res.status(409).json({ error: `A unique constraint was violated: ${error.meta?.target || 'Unknown field'}` });
        }

        res.status(500).json({ error: error.message || 'An unexpected error occurred during registration.' });
    }
};

exports.loginJobSeeker = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ error: 'Identifier and password are required' });
        }

        const seeker = await prisma.jobSeeker.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { phone: identifier }
                ]
            }
        });

        if (!seeker || !(await bcrypt.compare(password, seeker.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken({ id: seeker.id, role: 'JOB_SEEKER' });

        await logAction('LOGIN_SUCCESS', seeker.id, 'JOB_SEEKER', { method: identifier.includes('@') ? 'email' : 'phone' });

        res.json({ token, user: { id: seeker.id, fullName: seeker.fullName, role: 'JOB_SEEKER', tier: seeker.tier } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.registerEmployer = async (req, res) => {
    try {
        const required = ['employerType', 'contactName', 'password', 'address'];
        const missing = hasRequiredFields(req.body, required);

        if (missing.length > 0) {
            return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
        }

        const {
            employerType, contactName, phone, email, password, address, familySize
        } = req.body;

        if (!phone && !email) {
            return res.status(400).json({ error: 'At least one contact method (email or phone) is required' });
        }

        if (email && !isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const existingConditions = [];
        if (email) existingConditions.push({ email });
        if (phone) existingConditions.push({ phone });

        const existing = await prisma.employer.findFirst({
            where: { OR: existingConditions }
        });

        if (existing) {
            return res.status(409).json({ error: 'User with this email or phone already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const profilePhotoPath = req.files?.profilePhoto ? `/uploads/profilePhoto/${req.files.profilePhoto[0].filename}` : null;
        const idDocumentPath = req.files?.idDocument ? `/uploads/idDocument/${req.files.idDocument[0].filename}` : null;

        const employer = await prisma.employer.create({
            data: {
                employerType,
                contactName,
                phone,
                email,
                password: hashedPassword,
                address,
                familySize: familySize ? parseInt(familySize) : null,
                profilePhoto: profilePhotoPath,
                idDocument: idDocumentPath,
                verificationStatus: (profilePhotoPath || idDocumentPath) ? 'PENDING' : 'NOT_STARTED'
            }
        });

        const token = generateToken({ id: employer.id, role: 'EMPLOYER' });
        res.status(201).json({ token, user: { id: employer.id, contactName: employer.contactName, role: 'EMPLOYER' } });
    } catch (error) {
        console.error("Employer Registration error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.loginEmployer = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ error: 'Identifier and password are required' });
        }

        const employer = await prisma.employer.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { phone: identifier }
                ]
            }
        });

        if (!employer || !(await bcrypt.compare(password, employer.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken({ id: employer.id, role: 'EMPLOYER' });

        await logAction('LOGIN_SUCCESS', employer.id, 'EMPLOYER', { method: identifier.includes('@') ? 'email' : 'phone' });

        res.json({ token, user: { id: employer.id, contactName: employer.contactName, role: 'EMPLOYER', tier: employer.tier } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const admin = await prisma.admin.findUnique({ where: { username } });

        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken({ id: admin.id, role: 'ADMIN', adminRole: admin.role });
        res.json({ token, user: { id: admin.id, username: admin.username, role: 'ADMIN', adminRole: admin.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.firebaseLogin = async (req, res) => {
    try {
        const { idToken, role } = req.body;
        const { auth: firebaseAuth } = require('../utils/firebaseAdmin');

        const decodedToken = await firebaseAuth.verifyIdToken(idToken);
        const phoneNumber = decodedToken.phone_number;

        if (!phoneNumber) {
            return res.status(400).json({ error: 'Phone number missing in Firebase token' });
        }

        let user;
        if (role === 'seeker') {
            user = await prisma.jobSeeker.findFirst({ where: { phone: phoneNumber } });
        } else if (role === 'employer') {
            user = await prisma.employer.findFirst({ where: { phone: phoneNumber } });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found with this phone number. Please register first.' });
        }

        const token = generateToken({ id: user.id, role: role.toUpperCase() });

        await logAction('FIREBASE_LOGIN_SUCCESS', user.id, role.toUpperCase(), { phone: phoneNumber });

        res.json({
            token,
            user: {
                id: user.id,
                fullName: user.fullName || user.contactName,
                role: role.toUpperCase(),
                tier: user.tier
            }
        });
    } catch (error) {
        console.error('Firebase login error:', error);
        res.status(401).json({ error: 'Invalid Firebase token' });
    }
};
