const express = require('express');
const router = express.Router();
const seekerController = require('../controllers/seekerController');
const auth = require('../middleware/auth');
const checkLimits = require('../middleware/checkLimits');

router.get('/', auth, seekerController.getAllSeekers);
router.get('/:id', auth, checkLimits, seekerController.getSeekerProfile);
router.put('/profile', auth, seekerController.updateProfile);

module.exports = router;
