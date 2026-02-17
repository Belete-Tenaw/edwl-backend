const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// =============================
// JOB SEEKER REGISTER
// =============================
exports.registerJobSeeker = async (req, res) => {
    try {
        const { fullName, email, password, phone, gender } = req.body;

        const idDoc = req.files && req.files['idDocument']
            ? req.files['idDocument'][0].path.replace(/\\/g, '/')
            : null;

        const photo = req.files && req.files['profilePhoto']
            ? req.files['profilePhoto'][0].path.replace(/\\/g, '/')
            : null;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name: fullName,
                email,
                password: hashedPassword,
                phone,
                gender,
                role: 'SEEKER',
                idDocument: idDoc,
                profilePhoto: photo
            }
        });

        res.status(201).json({ message: "Job Seeker registered successfully", userId: newUser.id });

    } catch (error) {
        console.error("Seeker Registration error:", error);
        res.status(500).json({ error: "Registration failed" });
    }
};

// =============================
// JOB SEEKER LOGIN
// =============================
exports.loginJobSeeker = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { phone: identifier }
                ],
                role: 'SEEKER'
            }
        });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            token,
            user: { id: user.id, name: user.name, role: user.role }
        });

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
        const { contactName, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: "Employer already exists" });
        }

        const newEmployer = await prisma.user.create({
            data: {
                name: contactName,
                email,
                password: hashedPassword,
                role: 'EMPLOYER'
            }
        });

        res.status(201).json({
            message: "Employer registered successfully",
            userId: newEmployer.id
        });

    } catch (error) {
        console.error("Employer Registration error:", error);
        res.status(500).json({ error: "Registration failed" });
    }
};

// =============================
// EMPLOYER LOGIN
// =============================
exports.loginEmployer = async (req, res) => {
    try {
        const { email, password } = req.body;

        const employer = await prisma.user.findUnique({ where: { email } });

        if (!employer || employer.role !== 'EMPLOYER') {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, employer.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: employer.id, role: employer.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            token,
            user: { id: employer.id, name: employer.name, role: employer.role }
        });

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
        const { email, password } = req.body;

        const admin = await prisma.user.findUnique({ where: { email } });

        if (!admin || admin.role !== 'ADMIN') {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: admin.id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            token,
            user: { id: admin.id, name: admin.name, role: admin.role }
        });

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
