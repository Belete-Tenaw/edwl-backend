/**
 * ========================================
 * Structured Logger (Winston)
 * ========================================
 * Implements structured logging for security,
 * performance, and debugging
 */

const winston = require('winston');
const path = require('path');

// Log levels with numeric values
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

/**
 * Create logger instance
 */
const logger = winston.createLogger({
  levels: LOG_LEVELS,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.metadata(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const log = {
        timestamp,
        level,
        message,
        ...meta,
        requestId: meta.requestId || 'N/A',
        userId: meta.userId || 'anonymous',
      };
      return JSON.stringify(log);
    })
  ),
  defaultMeta: { service: 'edwl-backend' },
  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join(process.env.LOG_DIR || 'logs', 'error.log'),
      level: 'error',
      maxsize: 10485760,  // 10MB
      maxFiles: 5,
    }),

    // All logs
    new winston.transports.File({
      filename: path.join(process.env.LOG_DIR || 'logs', 'combined.log'),
      maxsize: 10485760,
      maxFiles: 10,
    }),

    // HTTP logs
    new winston.transports.File({
      filename: path.join(process.env.LOG_DIR || 'logs', 'http.log'),
      level: 'http',
      maxsize: 10485760,
      maxFiles: 5,
    }),

    // Security audit logs
    new winston.transports.File({
      filename: path.join(process.env.LOG_DIR || 'logs', 'security.log'),
      maxsize: 10485760,
      maxFiles: 30,
    }),
  ],
});

// Console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        return `${timestamp} ${level}: ${message}\n${metaStr}`;
      })
    ),
  }));
}

/**
 * Log authentication event
 */
function logAuth(action, userId, status, meta = {}) {
  const logData = {
    requestId: meta.requestId,
    userId,
    action,  // login, logout, failed_login, token_refresh, password_change
    status,  // success, failed
    ip: meta.ip,
    userAgent: meta.userAgent,
    ...meta,
  };

  if (status === 'failed') {
    logger.warn('Authentication failed', logData);
  } else {
    logger.info('Authentication successful', logData);
  }

  // Also log to security audit log
  logger.info('SECURITY_AUDIT', logData);
}

/**
 * Log data access event
 */
function logDataAccess(userId, resource, action, meta = {}) {
  logger.info('Data access', {
    requestId: meta.requestId,
    userId,
    resource,
    action,  // read, create, update, delete
    timestamp: new Date(),
    ...meta,
  });
}

/**
 * Log API request
 */
function logRequest(req, res, responseTime) {
  const logData = {
    requestId: req.id,
    method: req.method,
    path: req.path,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userId: req.user?.id || 'anonymous',
    ip: req.ip,
    userAgent: req.get('user-agent'),
  };

  if (responseTime > 5000) {
    logger.warn('Slow request detected', logData);
  } else {
    logger.http('API request', logData);
  }
}

/**
 * Log database operation
 */
function logDatabaseOp(operation, model, status, duration, meta = {}) {
  logger.debug('Database operation', {
    operation,  // create, read, update, delete, transaction
    model,
    status,     // success, failed
    duration: `${duration}ms`,
    ...meta,
  });
}

/**
 * Log error with context
 */
function logError(error, context = {}) {
  logger.error('Application error', {
    message: error.message,
    stack: error.stack,
    code: error.code,
    ...context,
  });
}

/**
 * Log security violation
 */
function logSecurityViolation(type, details, meta = {}) {
  logger.warn('Security violation', {
    type,  // rate_limit_exceeded, csrf_token_invalid, xss_attempt, sql_injection, etc.
    details,
    ip: meta.ip,
    userId: meta.userId,
    requestId: meta.requestId,
    timestamp: new Date(),
  });

  // Also log to security audit
  logger.info('SECURITY_AUDIT', {
    type: 'SECURITY_VIOLATION',
    violationType: type,
    details,
    meta,
  });
}

/**
 * Log payment transaction
 */
function logPayment(transactionId, userId, amount, status, provider, meta = {}) {
  logger.info('Payment transaction', {
    transactionId,
    userId,
    amount,
    status,     // initiated, success, failed, refunded
    provider,   // stripe, telebirr, chapa, cbe
    ...meta,
  });
}

/**
 * Create request logger middleware
 */
function createRequestLogger() {
  return (req, res, next) => {
    // Generate unique request ID
    req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Record start time
    const startTime = Date.now();

    // Override res.json to log responses
    const originalJson = res.json;
    res.json = function(data) {
      const duration = Date.now() - startTime;
      logRequest(req, res, duration);
      return originalJson.call(this, data);
    };

    next();
  };
}

module.exports = {
  logger,
  logAuth,
  logDataAccess,
  logRequest,
  logDatabaseOp,
  logError,
  logSecurityViolation,
  logPayment,
  createRequestLogger,
};
