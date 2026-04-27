const TelegramBot = require('node-telegram-bot-api');
const prisma = require('../utils/prisma');

// Initialize Telegram Bot
const token = process.env.TELEGRAM_BOT_TOKEN;
let bot = null;

if (token) {
    bot = new TelegramBot(token);
} else {
    console.warn('[NotificationService] TELEGRAM_BOT_TOKEN missing in .env. Telegram alerts will be skipped.');
}

/**
 * Creates a persistent notification in the database and emits via Socket.io.
 * @param {string} userId - Target user ID.
 * @param {string} userType - 'JOB_SEEKER' or 'EMPLOYER'.
 * @param {string} title - Title of the notification.
 * @param {string} message - Content of the notification.
 * @param {string} type - 'MATCH', 'MESSAGE', 'PAYMENT', 'SYSTEM'.
 * @param {object} io - Socket.io instance.
 */
exports.createInAppNotification = async (userId, userType, title, message, type = 'SYSTEM', io = null) => {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                userType,
                title,
                message,
                type
            }
        });

        if (io) {
            // Emit to the specific user's room
            io.to(userId).emit('new_notification', notification);
        }

        return notification;
    } catch (error) {
        console.error('[NotificationService] Failed to create in-app notification:', error.message);
    }
};

/**
 * Sends an alert message to a user via Telegram.
 * @param {string} telegramChatId - The user's Telegram chat ID.
 * @param {string} message - The content of the alert.
 */
exports.sendTelegramAlert = async (telegramChatId, message) => {
    if (!bot || !telegramChatId) return;

    try {
        await bot.sendMessage(telegramChatId, message, { parse_mode: 'HTML' });
    } catch (error) {
        console.error(`[Telegram] Failed to send alert to ${telegramChatId}:`, error.message);
    }
};

/**
 * Sends an alert message via SMS.
 */
exports.sendSMSAlert = async (phoneNumber, message) => {
    if (!phoneNumber) return;
    try {
        // Africa's Talking or local gateway integration logic here
    } catch (error) {
        console.error(`[SMS] Failed to send alert to ${phoneNumber}:`, error.message);
    }
};

