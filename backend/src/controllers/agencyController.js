const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Register a new B2B Agency
 */
exports.registerAgency = async (req, res) => {
    try {
        const { name, registrationNo, contactPhone, password, address } = req.body;

        const existing = await prisma.agency.findUnique({
            where: { registrationNo }
        });

        if (existing) {
            return res.status(400).json({ error: 'Agency with this registration number already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const agency = await prisma.agency.create({
            data: {
                name,
                registrationNo,
                contactPhone,
                password: hashedPassword,
                address
            }
        });

        res.status(201).json({ message: 'Agency registered successfully.', agency });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Login Agency
 */
exports.loginAgency = async (req, res) => {
    try {
        const { registrationNo, password } = req.body;

        const agency = await prisma.agency.findUnique({
            where: { registrationNo }
        });

        if (!agency) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!agency.isActive) {
            return res.status(403).json({ error: 'Agency account is suspended.' });
        }

        const isMatch = await bcrypt.compare(password, agency.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: agency.id, role: 'AGENCY' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            token,
            user: { id: agency.id, name: agency.name, role: 'AGENCY' }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Get Agency Fleet (Workers managed by this agency)
 */
exports.getAgencyFleet = async (req, res) => {
    try {
        const agencyId = req.user.id; // From auth middleware

        const workers = await prisma.jobSeeker.findMany({
            where: { agencyId },
            include: { escrowContracts: true }
        });

        res.status(200).json({ workers });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
