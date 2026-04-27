const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getModules = async (req, res) => {
    try {
        const modules = await prisma.trainingModule.findMany();
        res.json(modules);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getCertifications = async (req, res) => {
    try {
        const certs = await prisma.userCertification.findMany({
            where: { userId: req.user.id },
            include: { module: true }
        });
        res.json(certs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.completeModule = async (req, res) => {
    const { moduleId, score } = req.body;
    try {
        const cert = await prisma.userCertification.create({
            data: {
                userId: req.user.id,
                moduleId,
                score
            }
        });
        
        // Award points
        const module = await prisma.trainingModule.findUnique({ where: { id: moduleId } });
        await prisma.jobSeeker.update({
            where: { id: req.user.id },
            data: { rewardPoints: { increment: module?.points || 50 } }
        });

        res.status(201).json(cert);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
