const prisma = require('../utils/prisma');
const crypto = require('crypto');

exports.getAllUsers = async (req, res) => {
    try {
        const seekers = await prisma.jobSeeker.findMany();
        const employers = await prisma.employer.findMany();
        res.json({ seekers, employers });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.generateCode = async (req, res) => {
    try {
        const { days } = req.body;
        const code = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 char code

        // expiry of the code itself
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Code expires in 7 days if not used

        const newCode = await prisma.subscriptionCode.create({
            data: {
                code,
                expiresAt,
                durationDays: days ? parseInt(days) : 30
            }
        });

        res.status(201).json(newCode);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.activateSubscription = async (req, res) => {
    try {
        const { code, userId, userType, days } = req.body;

        const subCode = await prisma.subscriptionCode.findUnique({
            where: { code }
        });

        if (!subCode || subCode.status === 'USED' || subCode.expiresAt < new Date()) {
            return res.status(400).json({ error: 'Invalid or expired code' });
        }

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + parseInt(days));

        if (userType === 'JOB_SEEKER') {
            await prisma.jobSeeker.update({
                where: { id: userId },
                data: { tier: 'SUBSCRIBER', subscriptionExpiry: expiryDate }
            });
        } else {
            await prisma.employer.update({
                where: { id: userId },
                data: { tier: 'SUBSCRIBER', subscriptionExpiry: expiryDate }
            });
        }

        await prisma.subscriptionCode.update({
            where: { code },
            data: { status: 'USED', assignedTo: userId, userType }
        });

        res.json({ message: 'Subscription activated successfully', expiryDate });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id, type } = req.params;
        if (type === 'seeker') {
            await prisma.jobSeeker.delete({ where: { id } });
        } else {
            await prisma.employer.delete({ where: { id } });
        }
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
