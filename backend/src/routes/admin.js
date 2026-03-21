const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const codeController = require('../controllers/codeController');
const auth = require('../middleware/auth');
const { authorize, Roles } = require('../middleware/rbac');

const analyticsController = require('../controllers/analyticsController');

router.get('/users', auth, authorize([Roles.ADMIN]), adminController.getAllUsers);
router.get('/verifications/pending', auth, authorize([Roles.ADMIN]), adminController.getPendingVerifications);
router.post('/verifications/approve', auth, authorize([Roles.ADMIN]), adminController.verifyUser);
router.post('/status', auth, authorize([Roles.ADMIN]), adminController.updateAccountStatus);
router.get('/codes', auth, authorize([Roles.ADMIN]), codeController.getAllCodes);
router.post('/codes/generate', auth, authorize([Roles.ADMIN]), codeController.bulkGenerateCodes);
router.post('/generate-code', auth, authorize([Roles.ADMIN]), codeController.bulkGenerateCodes); 
router.post('/activate-premium', auth, authorize([Roles.ADMIN]), codeController.adminActivateCode);
router.delete('/user/:type/:id', auth, authorize([Roles.ADMIN]), adminController.deleteUser);
router.post('/grant-superadmin', auth, authorize([Roles.ADMIN]), adminController.grantSuperAdminRole);
router.get('/stats', auth, authorize([Roles.ADMIN]), adminController.getAdminStats);
router.get('/analytics', auth, authorize([Roles.ADMIN]), analyticsController.getPlatformStats);
router.get('/insights', auth, authorize([Roles.ADMIN]), analyticsController.getMarketInsights);

module.exports = router;
