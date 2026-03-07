const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { auth } = require('../middleware/auth');

// Protected routes
router.post('/', auth, reviewController.createReview);
router.get('/:userType/:userId', reviewController.getUserReviews);

module.exports = router;
