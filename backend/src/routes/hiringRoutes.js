const express = require('express');
const router = express.Router();
const hiringController = require('../controllers/hiringController');

// This matches the endpoint: POST /api/hiring/save
router.post('/save', hiringController.createHiringRequirement);

module.exports = router;