const express = require('express');
const router = express.Router();
const employerController = require('../controllers/employerController');
const auth = require('../middleware/auth');
const { authorize, Roles } = require('../middleware/rbac');

router.get('/:id', auth, employerController.getEmployerProfile);
router.put('/profile', auth, authorize([Roles.EMPLOYER]), employerController.updateProfile);

module.exports = router;
