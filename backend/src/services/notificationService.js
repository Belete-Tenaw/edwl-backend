const TelegramBot = require('node-telegram-bot-api');

// Initialize Telegram Bot
const token = process.env.TELEGRAM_BOT_TOKEN;
let bot = null;

if (token) {
    bot = new TelegramBot(token);
    console.log('[NotificationService] Telegram Bot initialized.');
} else {
    console.warn('[NotificationService] TELEGRAM_BOT_TOKEN missing in .env. Telegram alerts will be skipped.');
}

/**
 * Sends an alert message to a user via Telegram.
 * High Thinking: Non-blocking and silent failure to ensure core transactions are not affected.
 * @param {string} telegramChatId - The user's Telegram chat ID.
 * @param {string} message - The content of the alert.
 */
exports.sendTelegramAlert = async (telegramChatId, message) => {
    if (!bot || !telegramChatId) return;

    try {
        await bot.sendMessage(telegramChatId, message, { parse_mode: 'HTML' });
        console.log(`[Telegram] Alert sent to ${telegramChatId}`);
    } catch (error) {
        console.error(`[Telegram] Failed to send alert to ${telegramChatId}:`, error.message);
        // We do not re-throw here to keep the parent transaction safe.
    }
};

/**
 * Sends an alert message via SMS.
 * PLACEHOLDER: Ready for Africa's Talking or local gateway integration.
 * @param {string} phoneNumber - The user's phone number.
 * @param {string} message - The content of the alert.
 */
exports.sendSMSAlert = async (phoneNumber, message) => {
    if (!phoneNumber) return;

    try {
        console.log(`[SMS Placeholder] Sending to ${phoneNumber}: "${message}"`);
        
        // Example implementation with Africa's Talking (uncomment when credentials added)
        /*
        const options = {
            apiKey: process.env.AT_API_KEY,
            username: process.env.AT_USERNAME,
        };
        const AfricasTalking = require('africastalking')(options);
        const sms = AfricasTalking.SMS;
        await sms.send({ to: [phoneNumber], message });
        */
        
    } catch (error) {
        console.error(`[SMS] Failed to send alert to ${phoneNumber}:`, error.message);
    }
};
