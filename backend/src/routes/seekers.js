const express = require('express');
const router = express.Router();
const seekerController = require('../controllers/seekerController');
const auth = require('../middleware/auth');
const checkLimits = require('../middleware/checkLimits');
const { authorize, Roles } = require('../middleware/rbac');

router.get('/', auth, seekerController.getAllSeekers);
router.get('/:id', auth, checkLimits, seekerController.getSeekerProfile);
router.put('/profile', auth, authorize([Roles.SEEKER]), seekerController.updateProfile);

module.exports = router;
