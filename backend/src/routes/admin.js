const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
    next();
};

router.get('/users', auth, isAdmin, adminController.getAllUsers);
router.post('/generate-code', auth, isAdmin, adminController.generateCode);
router.post('/activate-subscription', auth, isAdmin, adminController.activateSubscription);
router.delete('/user/:type/:id', auth, isAdmin, adminController.deleteUser);

module.exports = router;
