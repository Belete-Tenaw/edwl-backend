const express = require('express');
const router = express.Router();
const escrowController = require('../controllers/escrowController');
const auth = require('../middleware/auth');
const { authorize, Roles } = require('../middleware/rbac');

// Core escrow lifecycle
router.post('/initiate',  auth, escrowController.initiateEscrow);
router.post('/verify',    auth, escrowController.verifyEscrow);
router.get('/',           auth, escrowController.getEscrows);

// 🤝 Smart-contract: dual-party confirmation (employer OR seeker)
router.post('/:escrowId/confirm', auth, escrowController.confirmCompletion);

// Legacy single-party release (employer only)
router.put('/:escrowId/release', auth, escrowController.releaseEscrow);

// 🛡️ Admin override release
router.post('/:escrowId/admin-release', auth, authorize([Roles.ADMIN]), escrowController.adminReleaseEscrow);

module.exports = router;
