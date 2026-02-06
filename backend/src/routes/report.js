const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');
const { authorize, Roles } = require('../middleware/rbac');

router.post('/', auth, reportController.reportUser);
router.get('/', auth, authorize([Roles.ADMIN]), reportController.getAllReports);

module.exports = router;
