const express = require('express');
const router = express.Router();
const academyController = require('../controllers/academyController');
const auth = require('../middleware/auth'); // Assuming auth middleware exists

router.get('/training-modules', auth, academyController.getModules);
router.get('/certifications', auth, academyController.getCertifications);
router.post('/module-complete', auth, academyController.completeModule);

module.exports = router;
