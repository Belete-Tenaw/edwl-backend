const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Job Seeker

/**
 * @swagger
 * /api/auth/seeker/register:
 *   post:
 *     summary: Register a new Job Seeker
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *               - phone
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               gender:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
router.post('/seeker/register', authController.registerJobSeeker);

/**
 * @swagger
 * /api/auth/seeker/login:
 *   post:
 *     summary: Login Job Seeker
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email or Phone
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/seeker/login', authController.loginJobSeeker);

// Employer

/**
 * @swagger
 * /api/auth/employer/register:
 *   post:
 *     summary: Register a new Employer
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contactName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post('/employer/register', authController.registerEmployer);

/**
 * @swagger
 * /api/auth/employer/login:
 *   post:
 *     summary: Login Employer
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/employer/login', authController.loginEmployer);

// Admin
router.post('/admin/login', authController.loginAdmin);

module.exports = router;
