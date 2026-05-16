const express = require('express');
const router = express.Router();
const voiceController = require('../controllers/voiceController');
const aiController = require('../controllers/aiController');
const aiMediationController = require('../controllers/aiMediationController');
const auth = require('../middleware/auth');

// --- EDWL Voice Routes ---
router.post('/voice/process', auth, voiceController.processVoiceBio);

// --- Predictive Analytics ---
router.get('/churn/:employerId', auth, aiController.predictChurn);
router.get('/match/insights', auth, aiController.getMatchInsights);
router.get('/market/trends', auth, aiController.getMarketTrends);

// --- AI Mediation Routes (Centralized here or in mediationRoutes) ---
router.post('/mediate/dispute', auth, aiMediationController.autoMediateDispute);

module.exports = router;
