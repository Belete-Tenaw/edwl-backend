const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const { authorize, Roles } = require('../middleware/rbac');

router.get('/users', auth, authorize([Roles.ADMIN]), adminController.getAllUsers);
router.post('/verify', auth, authorize([Roles.ADMIN]), adminController.verifyUser);
router.post('/status', auth, authorize([Roles.ADMIN]), adminController.updateAccountStatus);
router.post('/generate-code', auth, authorize([Roles.ADMIN]), adminController.generateCode);
router.post('/activate-subscription', auth, authorize([Roles.ADMIN]), adminController.activateSubscription);
router.delete('/user/:type/:id', auth, authorize([Roles.ADMIN]), adminController.deleteUser);

module.exports = router;
