const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { logAction } = require('../services/auditService');

// =============================
// JOB SEEKER REGISTER
// =============================
exports.registerJobSeeker = async (req, res) => {
    try {
        const {
            fullName, email, password, phone, gender,
            age, maritalStatus, expectedSalary,
            preferredLocation, preferredArrangement,
            experienceYears, skills, bio
        } = req.body;

        const idDoc = req.files && req.files['idDocument']
            ? req.files['idDocument'][0].path.replace(/\\/g, '/')
            : null;

        const photo = req.files && req.files['profilePhoto']
            ? req.files['profilePhoto'][0].path.replace(/\\/g, '/')
            : null;

        const existingSeeker = await prisma.jobSeeker.findUnique({
            where: { email: email || '' }
        });
        if (existingSeeker) {
            return res.status(409).json({ message: "Job Seeker with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newSeeker = await prisma.jobSeeker.create({
            data: {
                fullName,
                email,
                phone,
                password: hashedPassword,
                gender: gender || 'FEMALE',
                age: parseInt(age) || 20,
                maritalStatus: maritalStatus || 'SINGLE',
                expectedSalary: parseInt(expectedSalary) || 0,
                preferredLocation: preferredLocation || 'Addis Ababa',
                preferredArrangement: preferredArrangement || 'LIVE_IN',
                experienceYears: parseInt(experienceYears) || 0,
                skills: skills ? (Array.isArray(skills) ? skills : [skills]) : [],
                bio: bio || '',
                profilePhoto: photo || '', // Required field
                idDocument: idDoc
            }
        });

        res.status(201).json({ message: "Job Seeker registered successfully", userId: newSeeker.id });

        // Audit Log
        await logAction('REGISTER_SEEKER', newSeeker.id, 'JOB_SEEKER', { fullName: newSeeker.fullName });

    } catch (error) {
        console.error("Seeker Registration error:", error);
        res.status(500).json({ error: error.message || "Registration failed" });
    }
};

// =============================
// JOB SEEKER LOGIN
// =============================
exports.loginJobSeeker = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        const seeker = await prisma.jobSeeker.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { phone: identifier }
                ]
            }
        });

        if (!seeker) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, seeker.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: seeker.id, role: 'JOB_SEEKER' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            token,
            user: { id: seeker.id, name: seeker.fullName, role: 'JOB_SEEKER' }
        });

        // Audit Log
        await logAction('LOGIN_SEEKER', seeker.id, 'JOB_SEEKER');

    } catch (error) {
        console.error("Seeker Login error:", error);
        res.status(500).json({ error: "Login failed" });
    }
};

// =============================
// EMPLOYER REGISTER
// =============================
exports.registerEmployer = async (req, res) => {
    try {
        const { contactName, email, password, phone, employerType, address } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const existingEmployer = await prisma.employer.findUnique({ where: { email } });
        if (existingEmployer) {
            return res.status(409).json({ message: "Employer already exists" });
        }

        const newEmployer = await prisma.employer.create({
            data: {
                contactName,
                email,
                phone,
                password: hashedPassword,
                employerType: employerType || 'HOUSEHOLD',
                address: address || 'Addis Ababa'
            }
        });

        res.status(201).json({
            message: "Employer registered successfully",
            userId: newEmployer.id
        });

        // Audit Log
        await logAction('REGISTER_EMPLOYER', newEmployer.id, 'EMPLOYER', { contactName: newEmployer.contactName });

    } catch (error) {
        console.error("Employer Registration error:", error);
        res.status(500).json({ error: error.message || "Registration failed" });
    }
};

// =============================
// EMPLOYER LOGIN
// =============================
exports.loginEmployer = async (req, res) => {
    try {
        const { email, password } = req.body;

        const employer = await prisma.employer.findUnique({ where: { email } });

        if (!employer) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, employer.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: employer.id, role: 'EMPLOYER' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            token,
            user: { id: employer.id, name: employer.contactName, role: 'EMPLOYER' }
        });

        // Audit Log
        await logAction('LOGIN_EMPLOYER', employer.id, 'EMPLOYER');

    } catch (error) {
        console.error("Employer Login error:", error);
        res.status(500).json({ error: "Login failed" });
    }
};

// =============================
// ADMIN LOGIN
// =============================
exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body; // Actually uses username probably

        const admin = await prisma.admin.findFirst({
            where: {
                OR: [
                    { username: email },
                    { username: 'admin' } // Fallback for testing initial seed
                ]
            }
        });

        if (!admin) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: admin.id, role: 'ADMIN' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            token,
            user: { id: admin.id, name: admin.username, role: 'ADMIN' }
        });

        // Audit Log
        await logAction('LOGIN_ADMIN', admin.id, 'ADMIN');

    } catch (error) {
        console.error("Admin Login error:", error);
        res.status(500).json({ error: "Login failed" });
    }
};

// =============================
// FIREBASE LOGIN
// =============================
exports.firebaseLogin = async (req, res) => {
    res.status(200).json({ message: "Firebase login endpoint active" });
};
