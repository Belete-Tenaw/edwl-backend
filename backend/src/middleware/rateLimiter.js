/**
 * ========================================
 * Advanced Rate Limiting Middleware (v2.0)
 * ========================================
 * Implements tiered rate limiting with multiple strategies
 */

const rateLimit = require('express-rate-limit');

// During tests we avoid installing complex rate-limiters that may perform
// runtime validations (like IPv6 key generation). Export no-op middlewares
// so tests can import routes/controllers without triggering express-rate-limit internals.
if (process.env.NODE_ENV === 'test') {
  const noop = (req, res, next) => next();
  module.exports = {
    authLimiter: noop,
    authRateLimiter: noop,
    registerRateLimiter: noop,
    apiLimiter: noop,
    uploadLimiter: noop,
    messageLimiter: noop,
    searchLimiter: noop,
    passwordResetLimiter: noop,
    contactLimiter: noop,
    userKeyGenerator: (req) => req.user?.id || req.ip,
  };
} else {

/**
 * User/Auth key generator
 * Uses user ID if authenticated, falls back to IP
 */
const userKeyGenerator = (req) => {
  return req.user?.id || req.ip;
};

/**
 * Auth endpoints - stricter limits
 * 10 attempts per hour
 */
const authRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 10,
  keyGenerator: userKeyGenerator,
  message: {
    error: "Too many login attempts. Please try again after 1 hour.",
    code: 'RATE_LIMIT_AUTH',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.user !== undefined,  // Don't rate limit authenticated users
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many login attempts',
      code: 'RATE_LIMIT_AUTH',
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

/**
 * Registration - stricter limiter
 * 5 attempts per hour
 */
const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 5,
  keyGenerator: (req) => req.body?.email || req.ip,
  message: {
    error: "Too many registration attempts. Please try again after an hour.",
    code: 'RATE_LIMIT_REGISTER',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many registration attempts',
      code: 'RATE_LIMIT_REGISTER',
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

/**
 * General API endpoints
 * 100 requests per 15 minutes
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: (req) => {
    if (req.user && req.user.tier === 'SUBSCRIBER') return 300;
    if (req.user) return 150;
    return 100;
  },
  keyGenerator: userKeyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Rate limit exceeded',
      code: 'RATE_LIMIT_API',
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

/**
 * File upload endpoints
 * 20 uploads per hour
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: (req) => {
    if (!req.user) return 0;
    if (req.user.tier === 'SUBSCRIBER') return 50;
    return 20;
  },
  keyGenerator: userKeyGenerator,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Upload limit exceeded',
      code: 'RATE_LIMIT_UPLOAD',
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

/**
 * Messaging endpoints
 * 5 messages per hour
 */
const messageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: (req) => {
    if (!req.user) return 2;
    if (req.user.tier === 'SUBSCRIBER') return 100;
    return 5;
  },
  keyGenerator: userKeyGenerator,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Message limit exceeded. Please wait before sending another message.',
      code: 'RATE_LIMIT_MESSAGE',
    });
  },
});

/**
 * Public search endpoints
 * 30 searches per minute
 */
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: (req) => {
    if (req.user && req.user.tier === 'SUBSCRIBER') return 300;
    if (req.user) return 150;
    return 30;
  },
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Search limit exceeded',
      code: 'RATE_LIMIT_SEARCH',
    });
  },
});

/**
 * Password reset
 * 3 attempts per hour
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 3,
  keyGenerator: (req) => req.body?.email || req.ip,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many password reset attempts',
      code: 'RATE_LIMIT_PASSWORD_RESET',
    });
  },
});

/**
 * Contact form submissions
 * 3 per hour
 */
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 3,
  keyGenerator: (req) => req.body?.email || req.ip,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many contact submissions',
      code: 'RATE_LIMIT_CONTACT',
    });
  },
});

  module.exports = {
    authLimiter: authRateLimiter,
    authRateLimiter: authRateLimiter,
    registerRateLimiter,
    apiLimiter,
    uploadLimiter,
    messageLimiter,
    searchLimiter,
    passwordResetLimiter,
    contactLimiter,
    userKeyGenerator,
  };
}
