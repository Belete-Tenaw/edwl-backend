const prisma = require('../utils/prisma');

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
        if (req.user.role !== 'JOB_SEEKER') return res.status(403).json({ message: "Only job seekers have certifications." });

        const certs = await prisma.userTraining.findMany({
            where: { jobSeekerId: req.user.id },
            include: { trainingModule: true }
        });
        res.json(certs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.completeModule = async (req, res) => {
    const { moduleId, score } = req.body;
    try {
        if (req.user.role !== 'JOB_SEEKER') return res.status(403).json({ message: "Only job seekers can complete modules." });

        const module = await prisma.trainingModule.findUnique({ where: { id: moduleId } });
        if (!module) return res.status(404).json({ message: "Module not found" });

        // Upsert UserTraining to handle retries safely
        const cert = await prisma.userTraining.upsert({
            where: {
                jobSeekerId_moduleId: {
                    jobSeekerId: req.user.id,
                    moduleId: moduleId
                }
            },
            update: { score, completedAt: new Date() },
            create: {
                jobSeekerId: req.user.id,
                moduleId,
                score
            }
        });
        
        // Award points and add badge/certificate
        const certificateName = `${module.title} Certified`;
        
        const jobSeeker = await prisma.jobSeeker.findUnique({ 
            where: { id: req.user.id }, 
            select: { certificates: true, badges: true } 
        });
        
        const newCertificates = [...(jobSeeker.certificates || [])];
        if (!newCertificates.includes(certificateName)) {
            newCertificates.push(certificateName);
        }

        const updatedSeeker = await prisma.jobSeeker.update({
            where: { id: req.user.id },
            data: { 
                rewardPoints: { increment: module.points || 50 },
                certificates: newCertificates,
                // Add to multi-badge array if not already present
                badges: {
                    set: Array.from(new Set([...(jobSeeker.badges || []), '🎓 Academy Certified']))
                },
                // Upgrade status badge based on certificate count
                ...(newCertificates.length === 1 ? { badge: 'SILVER' } : {}),
                ...(newCertificates.length >= 3 ? { badge: 'GOLD' } : {}),
                ...(newCertificates.length >= 6 ? { badge: 'PLATINUM' } : {})
            }
        });

        // 🔔 Fire real-time badge notification
        const notificationService = require('../services/notificationService');
        await notificationService.notify(req.user.id, 'JOB_SEEKER', {
            title: `🎓 Certificate Earned: ${module.title}`,
            message: `Congratulations! You earned the "${certificateName}" badge and ${module.points || 50} Academy Points. ${newCertificates.length >= 3 ? 'You\'ve been upgraded to GOLD badge!' : newCertificates.length === 1 ? 'You\'ve been upgraded to SILVER badge!' : 'Keep learning to unlock more achievements.'}`,
            type: 'SYSTEM'
        });

        res.status(201).json({ message: "Module completed successfully", cert, badge: updatedSeeker.badge });
    } catch (err) {
        console.error('[Academy Error]', err);
        res.status(500).json({ message: err.message });
    }
};
