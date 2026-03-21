const applyPremiumAccessCheck = (req, res, next) => {
    try {
        const user = req.user; // Set by auth middleware

        // Admins bypass this check and always have premium access
        if (user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
            req.hasPremiumAccess = true;
            return next();
        }

        // Check if user has an active subscription expiry date
        if (user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date()) {
            req.hasPremiumAccess = true;
        } else {
            req.hasPremiumAccess = false;
        }

        next();
    } catch (error) {
        console.error("Premium Access Check Error:", error);
        // Default to false on error to be safe
        req.hasPremiumAccess = false;
        next();
    }
};

module.exports = applyPremiumAccessCheck;
