const prisma = require('../utils/prisma');

// Fetch all available training modules
exports.getModules = async (req, res) => {
    try {
        const modules = await prisma.trainingModule.findMany({
            orderBy: { createdAt: 'desc' }
        });
        
        // If the user is logged in, attach their completion status
        if (req.user && req.user.role === 'JOB_SEEKER') {
            const completed = await prisma.userTraining.findMany({
                where: { jobSeekerId: req.user.id },
                select: { moduleId: true }
            });
            
            const completedIds = new Set(completed.map(c => c.moduleId));
            
            const modulesWithStatus = modules.map(m => ({
                ...m,
                isCompleted: completedIds.has(m.id)
            }));
            
            return res.json(modulesWithStatus);
        }

        res.json(modules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mark a module as completed for a worker
exports.completeModule = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const jobSeekerId = req.user.id;

        if (req.user.role !== 'JOB_SEEKER') {
            return res.status(403).json({ error: 'Only job seekers can complete training modules.' });
        }

        const existingCompletion = await prisma.userTraining.findUnique({
            where: {
                jobSeekerId_moduleId: {
                    jobSeekerId,
                    moduleId
                }
            }
        });

        if (existingCompletion) {
            return res.status(400).json({ error: 'Module already completed.' });
        }

        const completion = await prisma.userTraining.create({
            data: {
                jobSeekerId,
                moduleId
            }
        });

        // Check if they have reached the threshold to become 'CERTIFIED'
        const totalCompleted = await prisma.userTraining.count({
            where: { jobSeekerId }
        });

        // For example, completing 3 modules = CERTIFIED badge
        if (totalCompleted >= 3) {
            const seeker = await prisma.jobSeeker.findUnique({ where: { id: jobSeekerId } });
            if (seeker.badge !== 'CERTIFIED') {
                await prisma.jobSeeker.update({
                    where: { id: jobSeekerId },
                    data: { badge: 'CERTIFIED' }
                });
            }
        }

        res.status(201).json({ message: 'Module completed successfully', completion });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin: Create a new training module
exports.createModule = async (req, res) => {
    try {
        const { title, description, videoUrl, category } = req.body;

        if (req.user.role !== 'SUPERADMIN' && req.user.role !== 'MODERATOR') {
            return res.status(403).json({ error: 'Only admins can create modules.' });
        }

        const newModule = await prisma.trainingModule.create({
            data: { title, description, videoUrl, category }
        });

        res.status(201).json(newModule);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
