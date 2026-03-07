const prisma = require('../utils/prisma');

module.exports = async (req, res, next) => {
    const { id, role } = req.user;

    // Find user tier
    let user;
    if (role === 'JOB_SEEKER') {
        user = await prisma.jobSeeker.findUnique({
            where: { id },
            select: { tier: true, subscriptionExpiry: true }
        });
    } else if (role === 'EMPLOYER') {
        user = await prisma.employer.findUnique({
            where: { id },
            select: { tier: true, subscriptionExpiry: true }
        });
    }

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Self-views do not count toward limits
    if ((role === 'JOB_SEEKER' && id === req.params.id) || (role === 'EMPLOYER' && id === req.params.id)) {
        return next();
    }

    // Active subscribers have unlimited access
    // FIX: Match Prisma enum values
    const isPremium = role === 'JOB_SEEKER'
        ? ['SILVER', 'GOLD', 'PLATINUM'].includes(user.tier)
        : ['SILVER_ACCESS', 'GOLD_ACCESS', 'PLATINUM_ACCESS'].includes(user.tier);

    if (isPremium) {
        const now = new Date();
        if (user.subscriptionExpiry && new Date(user.subscriptionExpiry) > now) {
            return next();
        }
    }

    // Free Tier: 5 profiles per day
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const viewCount = await prisma.viewLog.count({
        where: {
            AND: [
                role === 'JOB_SEEKER' ? { jobSeekerId: id } : { employerId: id },
                { createdAt: { gte: startOfToday } }
            ]
        }
    });

    if (viewCount >= 5) {
        return res.status(403).json({
            error: 'Daily limit reached',
            message: 'Free users are limited to 5 views per day. Upgrade to a Premium plan for unlimited access.',
            upgradeUrl: '/pricing'
        });
    }

    next();
};
