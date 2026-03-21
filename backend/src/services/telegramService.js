const axios = require('axios');

class TelegramService {
    constructor() {
        this.botToken = process.env.TELEGRAM_BOT_TOKEN;
        this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
    }

    /**
     * Send a direct message to a user via Telegram Bot API
     * @param {string} chatId - The Telegram internal user chat ID (must have started the bot)
     * @param {string} text - The message to send
     */
    async sendMessage(chatId, text) {
        if (!this.botToken) {
            console.warn('[TelegramService] Telegram Bot Token is not configured. Mocking send...');
            console.log(`[MOCK TELEGRAM to ${chatId}]: ${text}`);
            return true;
        }

        if (!chatId) {
            console.error('[TelegramService] Cannot send message without a chatId');
            return false;
        }

        try {
            const endpoint = `${this.baseUrl}/sendMessage`;
            const response = await axios.post(endpoint, {
                chat_id: chatId,
                text: text,
                parse_mode: 'HTML' // Allow basic formatting like bold (<b>) / italic (<i>)
            });

            if (response.data.ok) {
                console.log(`[TelegramService] Successfully sent message to ${chatId}`);
                return true;
            } else {
                console.error(`[TelegramService] Failed to send to ${chatId}:`, response.data);
                return false;
            }
        } catch (error) {
            console.error(`[TelegramService] Axios error sending to ${chatId}:`, error.message);
            // Don't crash the server if telegram fails
            return false;
        }
    }

    /**
     * Send revenue/payment alerts to the platform admin
     */
    async notifyAdmin(text) {
        const adminChatId = process.env.ADMIN_TELEGRAM_CHAT_ID;
        if (!adminChatId) {
            console.warn('[TelegramService] Admin Telegram Chat ID not configured.');
            return false;
        }
        return await this.sendMessage(adminChatId, `💰 <b>Revenue Alert</b>\n\n${text}`);
    }
}

module.exports = new TelegramService();
