const express = require('express');
const router = express.Router();
const aiMediationController = require('../controllers/aiMediationController');
const auth = require('../middleware/auth');

// Admin or employer can trigger AI mediation
router.post('/mediate', auth, aiMediationController.autoMediateDispute);

module.exports = router;
