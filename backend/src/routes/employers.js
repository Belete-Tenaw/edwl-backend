const express = require('express');
const router = express.Router();
const employerController = require('../controllers/employerController');
const auth = require('../middleware/auth');
const { authorize, Roles } = require('../middleware/rbac');

const upload = require('../middleware/upload');

router.get('/:id', auth, employerController.getEmployerProfile);
router.put('/profile', auth, authorize([Roles.EMPLOYER]), upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'idDocument', maxCount: 1 }
]), employerController.updateProfile);

module.exports = router;
