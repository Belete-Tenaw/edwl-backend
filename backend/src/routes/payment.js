const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * /api/payments/tiers:
 *   get:
 *     summary: Get available subscription tiers
 *     tags: [Payments]
 */
router.get('/tiers', paymentController.getTiers);

/**
 * @swagger
 * /api/payments/initiate:
 *   post:
 *     summary: Initiate a payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.post('/initiate', auth, paymentController.initiate);

/**
 * @swagger
 * /api/payments/complete:
 *   post:
 *     summary: Complete a payment (callback/manual)
 *     tags: [Payments]
 */
router.post('/complete', paymentController.complete);

/**
 * @swagger
 * /api/payments/activate-code:
 *   post:
 *     summary: Activate subscription via manual code
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.post('/activate-code', auth, paymentController.activateCode);

/**
 * @swagger
 * /api/payments/verify-code/{code}:
 *   get:
 *     summary: Verify if a premium code is valid and unused
 *     tags: [Payments]
 */
router.get('/verify-code/:code', paymentController.verifyCode);

module.exports = router;
