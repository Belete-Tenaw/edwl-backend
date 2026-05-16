const express = require('express');
const router = express.Router();
const agencyController = require('../controllers/agencyController');
const auth = require('../middleware/auth');

// Public: Register a new B2B Agency
router.post('/register', agencyController.registerAgency);

// Public: Login B2B Agency
router.post('/login', agencyController.loginAgency);

// Protected: Agency fleet management
router.get('/fleet', auth, agencyController.getAgencyFleet);

module.exports = router;
