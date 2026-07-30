const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');

/**
 * TEMPORARY, ONE-TIME-USE route to reset an admin password remotely,
 * since Render can reach the database but some local networks cannot.
 * Protected by a shared secret. DELETE THIS FILE after use.
 *
 * Usage: POST /api/temp-admin-reset
 * Headers: x-reset-secret: <TEMP_RESET_SECRET>
 * Body (JSON): { "username": "...", "newPassword": "..." }
 */
router.post('/', async (req, res) => {
    const providedSecret = req.headers['x-reset-secret'];
    if (!process.env.TEMP_RESET_SECRET || providedSecret !== process.env.TEMP_RESET_SECRET) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    const { username, newPassword } = req.body;
    if (!username || !newPassword) {
        return res.status(400).json({ error: 'username and newPassword are required' });
    }

    try {
        const existingAdmin = await prisma.admin.findUnique({ where: { username } });
        if (!existingAdmin) {
            return res.status(404).json({ error: `Admin "${username}" not found` });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatedAdmin = await prisma.admin.update({
            where: { username },
            data: { password: hashedPassword }
        });

        res.json({
            success: true,
            message: 'Password reset successfully',
            id: updatedAdmin.id,
            username: updatedAdmin.username
        });
    } catch (error) {
        console.error('Temp admin reset error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;