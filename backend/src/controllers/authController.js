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
        const required = ['fullName', 'gender', 'age', 'phone', 'email', 'password', 'experienceYears', 'expectedSalary', 'preferredLocation', 'preferredArrangement'];
        const missing = hasRequiredFields(req.body, required);

        if (missing.length > 0) {
            return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
        }

        const {
            fullName, gender, age, religion, maritalStatus, phone, email,
            password, bio, skills, experienceYears, expectedSalary,
            preferredLocation, preferredArrangement
        } = req.body;

        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check existing
        const existing = await prisma.jobSeeker.findFirst({
            where: { OR: [{ email }, { phone }] }
        });

        if (existing) {
            return res.status(409).json({ error: 'User with this email or phone already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const seeker = await prisma.jobSeeker.create({
            data: {
                fullName, gender, age, religion, maritalStatus, phone, email,
                password: hashedPassword, bio, skills, experienceYears,
                expectedSalary: parseInt(expectedSalary),
                preferredLocation, preferredArrangement
            }
        });

        const token = generateToken({ id: seeker.id, role: 'JOB_SEEKER' });
        res.status(201).json({ token, user: { id: seeker.id, fullName: seeker.fullName, role: 'JOB_SEEKER' } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.loginJobSeeker = async (req, res) => {
    try {
        const { identifier, password } = req.body; // Can be email or phone

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

        // Audit Log
        await logAction('LOGIN_SUCCESS', seeker.id, 'JOB_SEEKER', { method: identifier.includes('@') ? 'email' : 'phone' });

        res.json({ token, user: { id: seeker.id, fullName: seeker.fullName, role: 'JOB_SEEKER', tier: seeker.tier } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.registerEmployer = async (req, res) => {
    try {
        const required = ['employerType', 'contactName', 'phone', 'email', 'password', 'address'];
        const missing = hasRequiredFields(req.body, required);

        if (missing.length > 0) {
            return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
        }

        const {
            employerType, contactName, phone, email, password, address, familySize
        } = req.body;

        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check existing
        const existing = await prisma.employer.findFirst({
            where: { OR: [{ email }, { phone }] }
        });

        if (existing) {
            return res.status(409).json({ error: 'User with this email or phone already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const employer = await prisma.employer.create({
            data: {
                employerType, contactName, phone, email,
                password: hashedPassword, address,
                familySize: familySize ? parseInt(familySize) : null
            }
        });

        const token = generateToken({ id: employer.id, role: 'EMPLOYER' });
        res.status(201).json({ token, user: { id: employer.id, contactName: employer.contactName, role: 'EMPLOYER' } });
    } catch (error) {
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

        // Audit Log
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

