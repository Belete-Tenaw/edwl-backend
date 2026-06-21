// src/routes/didRoutes.js
const express = require('express');
const router = express.Router();
const { registerDid, getDidDocument } = require('../controllers/didController');

// Register a new DID
router.post('/register', registerDid);

// Resolve a DID
router.get('/:did', getDidDocument);

module.exports = router;
