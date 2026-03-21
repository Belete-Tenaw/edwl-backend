const prisma = require('../utils/prisma');
const telegramService = require('../services/telegramService');

/**
 * Trigger a panic alert for a user
 */
exports.triggerPanicAlert = async (req, res) => {
    try {
        const userId = req.user.userId;
        const userRole = req.user.role;
        const { location, contractId } = req.body;

        // Fetch user details for the alert
        let user;
        if (userRole === 'seeker') {
            user = await prisma.jobSeeker.findUnique({ where: { id: userId } });
        } else {
            user = await prisma.employer.findUnique({ where: { id: userId } });
        }

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Construct alert message
        const message = `
🚨 **PANIC ALERT TRIGGERED** 🚨
---------------------------
**User:** ${user.fullName || user.contactName} (${userRole})
**Phone:** ${user.phone}
**Location (reported):** ${location || 'Not provided'}
**Contract ID:** ${contractId || 'N/A'}
**Time:** ${new Date().toLocaleString()}

Please contact the user or emergency services immediately if necessary.
        `;

        // Send to Telegram Admins
        await telegramService.notifyAdmin(message);

        // Log the alert in AuditLogs
        await prisma.auditLog.create({
            data: {
                action: 'PANIC_ALERT_TRIGGERED',
                userId,
                userType: userRole,
                details: { location, contractId }
            }
        });

        res.json({ message: "Panic alert sent to administration. Help is on the way." });
    } catch (error) {
        console.error("Panic Alert Error:", error);
        res.status(500).json({ error: "Failed to trigger panic alert" });
    }
};
