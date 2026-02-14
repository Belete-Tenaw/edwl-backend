const prisma = require('../utils/prisma');

module.exports = async (req, res, next) => {
    const { id, role } = req.user;

    // Find user tier
    let user;
    if (role === 'JOB_SEEKER') {
        user = await prisma.jobSeeker.findUnique({ where: { id } });
    } else if (role === 'EMPLOYER') {
        user = await prisma.employer.findUnique({ where: { id } });
    }

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Self-views do not count toward limits
    if ((role === 'JOB_SEEKER' && id === req.params.id) || (role === 'EMPLOYER' && id === req.params.id)) {
        return next();
    }

    // Active subscribers have unlimited access
    if (user.tier !== 'FREEMIUM') {
        const now = new Date();
        if (user.subscriptionExpiry && new Date(user.subscriptionExpiry) > now) {
            return next();
        }
    }

    // Freemium: 5 profiles per day
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const viewCount = await prisma.viewLog.count({
        where: {
            AND: [
                role === 'JOB_SEEKER' ? { jobSeekerId: id } : { employerId: id },
                { createdAt: { gte: startOfToday } },
                // Only count views of OTHER users/jobs
                req.params.id ? { targetJobSeekerId: req.params.id } : { targetJobPostId: req.params.id }
            ]
        }
    });

    if (viewCount >= 5) {
        return res.status(403).json({
            error: 'Daily limit reached',
            message: 'Freemium users are limited to 5 views per day. Upgrade to Premium for unlimited access.',
            upgradeUrl: '/pricing'
        });
    }

    next();
};
