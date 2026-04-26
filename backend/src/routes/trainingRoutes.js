const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const protect = require('../middleware/auth');

// Public or Protected GET
// Could be public so anyone can see what modules EDWL offers, 
// using 'protect' here so we identify the JobSeeker for status tracking.
router.get('/', protect, trainingController.getModules);

// Job Seeker completes a module
router.post('/:moduleId/complete', protect, trainingController.completeModule);

// Admins creates a module
router.post('/', protect, trainingController.createModule);

module.exports = router;
