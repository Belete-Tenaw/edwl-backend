const express = require('express');
const router = express.Router();
const safetyController = require('../controllers/safetyController');
const auth = require('../middleware/auth');

// Trigger panic alert (Emergency)
router.post('/panic', auth, safetyController.triggerPanicAlert);

module.exports = router;
