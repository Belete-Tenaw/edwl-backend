const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const auth = require('../middleware/auth');
const checkLimits = require('../middleware/checkLimits');

router.get('/', auth, jobController.getAllJobs);
router.get('/:id', auth, checkLimits, jobController.getJobById);
router.post('/', auth, jobController.createJobPost);

module.exports = router;
