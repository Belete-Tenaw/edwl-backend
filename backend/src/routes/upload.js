const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');

// Upload certificate (skill-related document)
router.post('/certificate', auth, upload.single('certificate'), uploadController.uploadCertificate);

// Request verification (upload National ID or Fayda)
router.post('/verification', auth, upload.single('idDocument'), uploadController.requestVerification);

// Upload Live Selfie (Trust & Safety Betterment)
router.post('/live-selfie', auth, upload.single('selfie'), uploadController.uploadLiveSelfie);

module.exports = router;
