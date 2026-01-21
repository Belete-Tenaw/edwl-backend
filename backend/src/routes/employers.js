const express = require('express');
const router = express.Router();
const employerController = require('../controllers/employerController');
const auth = require('../middleware/auth');

router.get('/:id', auth, employerController.getEmployerProfile);
router.put('/profile', auth, employerController.updateProfile);

module.exports = router;
