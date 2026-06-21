const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../middleware/upload');
const { authRateLimiter, registerRateLimiter } = require('../middleware/rateLimiter');
const verifyToken = require('../middleware/auth');
const {
    seekerLoginValidator,
    employerLoginValidator,
    adminLoginValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
    refreshTokenValidator
} = require('../middleware/validators');

// =========================================
// JOB SEEKER ROUTES
// =========================================
router.post('/seeker/register', registerRateLimiter, upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'idDocument', maxCount: 1 },
    { name: 'nationalIdUrl', maxCount: 1 },
    { name: 'guarantorIdUrl', maxCount: 1 },
    { name: 'policeClearanceUrl', maxCount: 1 },
    { name: 'healthCertificateUrl', maxCount: 1 },
    { name: 'videoBio', maxCount: 1 }
]), upload.enforceImageSizeLimit, authController.registerJobSeeker);

// GAP 2: Login now validates input before hitting DB
router.post('/seeker/login', authRateLimiter, seekerLoginValidator, authController.loginJobSeeker);

// =========================================
// EMPLOYER ROUTES
// =========================================
router.post('/employer/register', registerRateLimiter, upload.none(), authController.registerEmployer);

// GAP 2: Login now validates input before hitting DB
router.post('/employer/login', authRateLimiter, employerLoginValidator, authController.loginEmployer);

// =========================================
// ADMIN ROUTES
// =========================================
// Admin login — protected by rate limiter + input validator
router.post('/admin/login', authRateLimiter, adminLoginValidator, authController.loginAdmin);

// =========================================
// FIREBASE
// =========================================
router.post('/firebase-login', authController.firebaseLogin);

// =========================================
// PASSWORD RESET (GAP 2: Validated)
// =========================================
router.post('/forgot-password', authRateLimiter, forgotPasswordValidator, authController.forgotPassword);
router.post('/reset-password', authRateLimiter, resetPasswordValidator, authController.resetPassword);

// =========================================
// GAP 3: JWT REFRESH TOKEN ENDPOINT
// Allows the frontend to get a new access token without forcing re-login.
// =========================================
router.post('/refresh', refreshTokenValidator, authController.refreshToken);

// =========================================
// PRE-FLIGHT DUPLICATE CHECK
// =========================================
router.get('/check-duplicate', authController.checkDuplicate);

// =========================================
// NOTIFICATION ROUTES (Authenticated)
// =========================================
router.get('/notifications', verifyToken, authController.getNotifications);
router.put('/notifications/:id/read', verifyToken, authController.markNotificationRead);
router.put('/notifications/read-all', verifyToken, authController.markAllNotificationsRead);

module.exports = router;