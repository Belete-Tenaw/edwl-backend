const rateLimit = require('express-rate-limit');

// General rate limiter for authentication routes
const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: {
        error: "Too many attempts. Please try again after 15 minutes."
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter limiter for registration
const registerRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 registration attempts per hour
    message: {
        error: "Too many registration attempts. Please try again after an hour."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    authRateLimiter,
    registerRateLimiter
};
