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

    // Active subscribers have unlimited access
    if (user.tier === 'SUBSCRIBER') {
        // Check if subscription is still valid
        if (user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date()) {
            return next(); // Unlimited access during active subscription
        }
        // Subscription expired, downgrade to freemium limits
    }

    // Freemium: 5 profiles per day with limited information
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const viewCount = await prisma.viewLog.count({
        where: {
            AND: [
                role === 'JOB_SEEKER' ? { jobSeekerId: id } : { employerId: id },
                { createdAt: { gte: today } }
            ]
        }
    });

    if (viewCount >= 5) {
        return res.status(403).json({
            error: 'Daily limit reached',
            message: 'Freemium users are limited to 5 profile views per day. Upgrade to Premium for unlimited access.',
            upgradeUrl: '/pricing'
        });
    }

    next();
};
