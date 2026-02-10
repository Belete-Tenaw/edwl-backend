const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../middleware/upload');

/**
 * @swagger
 * /api/auth/seeker/register:
 *   post:
 *     summary: Register a new Job Seeker
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *               - phone
 *               - profilePhoto
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
 *               profilePhoto:
 *                 type: string
 *                 format: binary
 *               idDocument:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
router.post('/seeker/register', upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'idDocument', maxCount: 1 }
]), authController.registerJobSeeker);

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
router.post('/employer/register', upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'idDocument', maxCount: 1 }
]), authController.registerEmployer);

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
router.post('/firebase-login', authController.firebaseLogin);

module.exports = router;
