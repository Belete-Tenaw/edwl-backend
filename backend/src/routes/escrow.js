const express = require('express');
const router = express.Router();
const escrowController = require('../controllers/escrowController');
const auth = require('../middleware/auth');

router.post('/initiate', auth, escrowController.initiateEscrow);
router.post('/verify', auth, escrowController.verifyEscrow);
router.get('/', auth, escrowController.getEscrows);
router.put('/:escrowId/release', auth, escrowController.releaseEscrow);

module.exports = router;
