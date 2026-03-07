const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../middleware/upload');

// Job Seeker Routes
router.post('/seeker/register', upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'idDocument', maxCount: 1 },
    { name: 'nationalIdUrl', maxCount: 1 },
    { name: 'guarantorIdUrl', maxCount: 1 },
    { name: 'policeClearanceUrl', maxCount: 1 },
    { name: 'healthCertificateUrl', maxCount: 1 },
    { name: 'videoBio', maxCount: 1 }
]), authController.registerJobSeeker);

router.post('/seeker/login', authController.loginJobSeeker);

// Employer Routes
router.post('/employer/register', upload.none(), authController.registerEmployer);
router.post('/employer/login', authController.loginEmployer);

// Admin Routes
router.post('/admin/login', authController.loginAdmin);

// Firebase integration
router.post('/firebase-login', authController.firebaseLogin);

module.exports = router;