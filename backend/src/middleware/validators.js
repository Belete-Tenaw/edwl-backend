/**
 * Input Validation Middleware (GAP 2 Fix)
 * Uses express-validator to enforce strict schema validation on all API inputs.
 * Centralizes all validation rules to prevent injection, malformed data, and missing fields.
 */
const { body, query, param, validationResult } = require('express-validator');

/**
 * Middleware to run after validators and return errors if any.
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation Failed',
            details: errors.array().map(e => ({ field: e.path, message: e.msg }))
        });
    }
    next();
};

// =============================================
// AUTH VALIDATORS
// =============================================

const seekerLoginValidator = [
    body('identifier')
        .trim()
        .notEmpty().withMessage('Phone or email is required')
        .isLength({ max: 100 }).withMessage('Identifier too long'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6, max: 128 }).withMessage('Password must be 6-128 characters'),
    validate
];

const employerLoginValidator = [
    body('identifier')
        .trim()
        .notEmpty().withMessage('Phone or email is required')
        .isLength({ max: 100 }).withMessage('Identifier too long'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6, max: 128 }).withMessage('Password must be 6-128 characters'),
    validate
];

const forgotPasswordValidator = [
    body('identifier')
        .trim()
        .notEmpty().withMessage('Email or phone is required')
        .isLength({ max: 100 }).withMessage('Identifier too long'),
    validate
];

const resetPasswordValidator = [
    body('identifier')
        .trim()
        .notEmpty().withMessage('Identifier is required'),
    body('securityAnswer')
        .trim()
        .notEmpty().withMessage('Security answer is required')
        .isLength({ max: 200 }).withMessage('Answer too long'),
    body('newPassword')
        .notEmpty().withMessage('New password is required')
        .isLength({ min: 6, max: 128 }).withMessage('Password must be 6-128 characters'),
    validate
];

const refreshTokenValidator = [
    body('refreshToken')
        .notEmpty().withMessage('Refresh token is required')
        .isString().withMessage('Refresh token must be a string'),
    validate
];

// =============================================
// PAYMENT VALIDATORS
// =============================================

const initiatePaymentValidator = [
    body('tierId')
        .trim()
        .notEmpty().withMessage('Tier ID is required')
        .isUUID().withMessage('Invalid Tier ID format'),
    body('provider')
        .notEmpty().withMessage('Payment provider is required')
        .isIn(['CHAPA', 'TELEBIRR', 'CBE', 'MANUAL', 'STRIPE'])
        .withMessage('Invalid payment provider. Must be CHAPA, TELEBIRR, CBE, MANUAL, or STRIPE'),
    validate
];

const activateCodeValidator = [
    body('code')
        .trim()
        .notEmpty().withMessage('Subscription code is required')
        .isLength({ min: 4, max: 50 }).withMessage('Invalid code length')
        .matches(/^[A-Z0-9-]+$/).withMessage('Code must contain only uppercase letters, numbers, and hyphens'),
    validate
];

// =============================================
// JOB POST VALIDATORS
// =============================================

const jobPostValidator = [
    body('title')
        .trim()
        .notEmpty().withMessage('Job title is required')
        .isLength({ max: 200 }).withMessage('Title too long'),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 5000 }).withMessage('Description too long'),
    body('salaryOffered')
        .notEmpty().withMessage('Salary is required')
        .isInt({ min: 0, max: 1000000 }).withMessage('Salary must be a positive number'),
    body('preferredArrangement')
        .notEmpty().withMessage('Work arrangement is required')
        .isIn(['LIVE_IN', 'LIVE_OUT', 'PART_TIME']).withMessage('Invalid work arrangement'),
    validate
];

// =============================================
// REVIEW VALIDATORS
// =============================================

const reviewValidator = [
    body('rating')
        .notEmpty().withMessage('Rating is required')
        .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Comment too long'),
    validate
];

// =============================================
// MESSAGE VALIDATORS
// =============================================

const messageValidator = [
    body('content')
        .trim()
        .notEmpty().withMessage('Message cannot be empty')
        .isLength({ max: 2000 }).withMessage('Message too long (max 2000 chars)'),
    body('receiverId')
        .notEmpty().withMessage('Receiver ID is required')
        .isUUID().withMessage('Invalid receiver ID'),
    validate
];

module.exports = {
    validate,
    seekerLoginValidator,
    employerLoginValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
    refreshTokenValidator,
    initiatePaymentValidator,
    activateCodeValidator,
    jobPostValidator,
    reviewValidator,
    messageValidator,
};
