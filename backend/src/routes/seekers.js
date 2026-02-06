const express = require('express');
const router = express.Router();
const seekerController = require('../controllers/seekerController');
const auth = require('../middleware/auth');
const checkLimits = require('../middleware/checkLimits');
const { authorize, Roles } = require('../middleware/rbac');

const upload = require('../middleware/upload');

router.get('/', auth, seekerController.getAllSeekers);
router.get('/:id', auth, checkLimits, seekerController.getSeekerProfile);
router.put('/profile', auth, authorize([Roles.SEEKER]), upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'idDocument', maxCount: 1 }
]), seekerController.updateProfile);

module.exports = router;
