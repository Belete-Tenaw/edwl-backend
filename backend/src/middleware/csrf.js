/**
 * ========================================
 * CSRF Protection Middleware
 * ========================================
 * Implements CSRF token generation, validation,
 * and protection for state-changing operations
 */

const { generateCSRFToken, validateCSRFToken } = require('../config/security');

if (process.env.NODE_ENV === 'test') {
  const noop = (req, res, next) => next();
  module.exports = {
    csrfTokenGenerator: noop,
    csrfTokenValidator: noop,
  };
} else {
  /**
   * Generate and attach CSRF token to response
   */
  const csrfTokenGenerator = (req, res, next) => {
    // Generate token if not already in session
    if (!req.session || !req.session.csrfToken) {
      if (!req.session) req.session = {};
      req.session.csrfToken = generateCSRFToken();
    }

    // Attach to response for client use
    res.locals.csrfToken = req.session.csrfToken;

    // Also attach as a response header for SPA/API clients
    res.setHeader('X-CSRF-Token', req.session.csrfToken);

    next();
  };

  /**
   * Validate CSRF token for state-changing operations
   * Only validates POST, PUT, DELETE, PATCH requests
   */
  const csrfTokenValidator = (req, res, next) => {
    // Don't validate GET or OPTIONS requests
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
      return next();
    }

    // Don't validate if route is marked as exempt
    if (req.route && req.route.csrfExempt === true) {
      return next();
    }

    // Check for token in multiple locations (order matters)
    const token = 
      req.body?._csrf ||
      req.body?.csrfToken ||
      req.headers['x-csrf-token'] ||
      req.headers['x-xsrf-token'] ||
      req.query?.csrf;

    if (!token) {
      return res.status(403).json({
        error: 'CSRF token missing',
        code: 'CSRF_TOKEN_MISSING',
      });
    }

    if (!req.session || !req.session.csrfToken) {
      return res.status(403).json({
        error: 'Session expired',
        code: 'SESSION_EXPIRED',
      });
    }

    try {
      if (!validateCSRFToken(token, req.session.csrfToken)) {
        return res.status(403).json({
          error: 'Invalid CSRF token',
          code: 'CSRF_TOKEN_INVALID',
        });
      }
    } catch (error) {
      return res.status(403).json({
        error: 'CSRF validation failed',
        code: 'CSRF_VALIDATION_FAILED',
      });
    }

    next();
  };

  module.exports = {
    csrfTokenGenerator,
    csrfTokenValidator,
  };
}
