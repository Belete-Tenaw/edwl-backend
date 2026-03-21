const express = require('express');
const router = express.Router();
const employerController = require('../controllers/employerController');
const codeController = require('../controllers/codeController');
const auth = require('../middleware/auth');
const { authorize, Roles } = require('../middleware/rbac');
const checkPremiumAccess = require('../middleware/checkPremiumAccess');
const upload = require('../middleware/upload');

router.get('/me/jobs', auth, authorize([Roles.EMPLOYER]), employerController.getMyJobPosts);
router.get('/:id', auth, checkPremiumAccess, employerController.getEmployerProfile);
router.put('/profile', auth, authorize([Roles.EMPLOYER]), upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'idDocument', maxCount: 1 }
]), employerController.updateProfile);

router.post('/redeem-code', auth, authorize([Roles.EMPLOYER]), codeController.redeemCode);

module.exports = router;
