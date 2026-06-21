const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

// Hard fail on startup if JWT_SECRET is missing — do NOT fall back to a
// known string like 'test_secret', which anyone could use to forge tokens.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('[FATAL] JWT_SECRET environment variable is not set. The server cannot start securely.');
}

// Simple in-memory cache for user deactivation/tier status (60s TTL)
// Key: userId, Value: { data, expiry }
const statusCache = new Map();
const CACHE_TTL = 60 * 1000; 

module.exports = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { ...decoded, userId: decoded.id };

        // Check cache with userId fallback mapped
        const cached = process.env.NODE_ENV === 'test' ? null : statusCache.get(decoded.id);
        const now = Date.now();

        if (cached && cached.expiry > now) {
            req.user = { ...decoded, ...cached.data, userId: decoded.id };
        } else {
            let user;
            const selectFields = { isActive: true, tier: true, subscriptionExpiry: true };
            
            if (decoded.role === 'JOB_SEEKER') {
                user = await prisma.jobSeeker.findUnique({ where: { id: decoded.id }, select: selectFields });
            } else if (decoded.role === 'EMPLOYER') {
                user = await prisma.employer.findUnique({ where: { id: decoded.id }, select: selectFields });
            } else if (decoded.role === 'AGENCY') {
                user = await prisma.agency.findUnique({ where: { id: decoded.id }, select: { isActive: true } });
            }

            if (user) {
                // Update Cache
                statusCache.set(decoded.id, { data: user, expiry: now + CACHE_TTL });
                
                if (!user.isActive) {
                    return res.status(403).json({ error: 'Account is deactivated. Please contact support.' });
                }
                // Attach latest status to request
                req.user = { ...decoded, ...user, userId: decoded.id };
            }
        }

        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
