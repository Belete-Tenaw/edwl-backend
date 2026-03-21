const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const documentController = require('../controllers/documentController');

// Secure route to view/decrypt documents
router.get('/view/:type/:filename', auth, documentController.viewDocument);

module.exports = router;
