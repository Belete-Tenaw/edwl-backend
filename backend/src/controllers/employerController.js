const prisma = require('../utils/prisma');

exports.updateProfile = async (req, res) => {
    try {
        const id = req.user.id;
        if (req.user.role !== 'EMPLOYER') return res.status(403).json({ error: 'Forbidden' });

        const updated = await prisma.employer.update({
            where: { id },
            data: req.body
        });

        res.json(updated);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getEmployerProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const employer = await prisma.employer.findUnique({
            where: { id },
            select: {
                id: true,
                contactName: true,
                employerType: true,
                address: true,
                createdAt: true,
                tier: true
            }
        });
        res.json(employer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
