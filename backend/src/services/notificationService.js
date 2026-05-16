const prisma = require('../utils/prisma');
const telegramService = require('./telegramService');

/**
 * Notification Service
 * Handles real-time alerts via Socket.IO and persists them for the user.
 */
class NotificationService {
    constructor() {
        this.io = null;
    }

    /**
     * Initialize the service with the Socket.IO instance
     * @param {Object} io - Socket.IO server instance
     */
    init(io) {
        this.io = io;
        console.log('[NotificationService] Socket.IO initialized');
    }

    /**
     * Send a notification to a specific user
     * @param {string} userId - Target user ID
     * @param {string} userType - 'JOB_SEEKER' or 'EMPLOYER'
     * @param {Object} data - { title, message, type }
     */
    async notify(userId, userType, { title, message, type = 'SYSTEM' }) {
        try {
            // 1. Persist to Database
            const notification = await prisma.notification.create({
                data: {
                    userId,
                    userType,
                    title,
                    message,
                    type
                }
            });

            // 2. Emit via Socket.IO
            if (this.io) {
                // Users join a room with their ID upon connection (handled in server.js)
                this.io.to(userId).emit('notification', notification);
                console.log(`[NotificationService] Real-time emit to ${userId}: ${title}`);
            }

            // 3. Optional: Telegram Integration
            // Fetch user's telegramChatId
            let user;
            if (userType === 'JOB_SEEKER') {
                user = await prisma.jobSeeker.findUnique({ where: { id: userId }, select: { telegramChatId: true } });
            } else {
                user = await prisma.employer.findUnique({ where: { id: userId }, select: { telegramChatId: true } });
            }

            if (user?.telegramChatId) {
                const telegramText = `🔔 <b>${title}</b>\n\n${message}`;
                await telegramService.sendMessage(user.telegramChatId, telegramText).catch(err => {
                    console.error('[NotificationService] Telegram fail:', err.message);
                });
            }

            return notification;
        } catch (error) {
            console.error('[NotificationService] Error:', error);
        }
    }

    /**
     * Broadcast to all users
     */
    async broadcast({ title, message, type = 'ANNOUNCEMENT' }) {
        if (this.io) {
            this.io.emit('broadcast_notification', { title, message, type, createdAt: new Date() });
        }
    }

    /**
     * Specialized SOS/Emergency Alert
     */
    async emergencyAlert(userId, userType, { latitude, longitude, message }) {
        const title = '🚨 CRITICAL SOS ALERT';
        const fullMessage = `Emergency detected! Location: ${latitude},${longitude}. Message: ${message}`;
        
        // 1. Notify Admins immediately via Telegram
        const adminText = `🚨 <b>CRITICAL SOS</b>\n\nUser: ${userId} (${userType})\nCoords: <code>${latitude},${longitude}</code>\nMsg: ${message}\n\n<a href="https://www.google.com/maps?q=${latitude},${longitude}">View on Maps</a>`;
        await telegramService.notifyAdmin(adminText);

        // 2. Persist as high-priority notification
        return await this.notify(userId, userType, {
            title,
            message: 'Emergency responders have been notified of your location.',
            type: 'EMERGENCY'
        });
    }
}

module.exports = new NotificationService();

