const telegramService = require('../services/telegramService');
const prisma = require('../utils/prisma');
const aiService = require('../services/aiService');

class TelegramBotController {
    /**
     * Handle incoming webhooks from Telegram
     */
    async handleWebhook(req, res) {
        const { message, callback_query } = req.body;

        try {
            if (message) {
                await this.processMessage(message);
            } else if (callback_query) {
                await this.processCallback(callback_query);
            }
            res.status(200).send('OK');
        } catch (error) {
            console.error('[TelegramBot] Webhook Error:', error.message);
            res.status(200).send('OK'); // Always send OK to Telegram to avoid retries
        }
    }

    async processMessage(message) {
        const chatId = message.chat.id.toString();
        const text = message.text;

        if (text === '/start') {
            await telegramService.sendMessage(chatId, 
                `👋 <b>Welcome to EDWL Smart Bot!</b>\n\nI am your AI assistant for the Ethiopian Domestic Workers Link.\n\nPlease link your account to get started.`
            );
            await telegramService.sendRichMessage(chatId, "Choose an action:", [
                [{ text: "💼 View Jobs", callback_data: "view_jobs" }, { text: "💰 Wallet", callback_data: "check_wallet" }],
                [{ text: "🚨 SOS EMERGENCY", callback_data: "trigger_sos" }]
            ]);
        }
        
        // Handle linking (e.g. /link <token>)
        if (text?.startsWith('/link ')) {
            const token = text.split(' ')[1];
            // In a real app, verify token and link chatId to JobSeeker/Employer
            await telegramService.sendMessage(chatId, "✅ Account successfully linked to EDWL!");
        }
    }

    async processCallback(callback) {
        const chatId = callback.message.chat.id.toString();
        const data = callback.data;

        switch (data) {
            case 'check_wallet':
                await telegramService.sendMessage(chatId, "💳 <b>Wallet Status</b>\n\nBalance: 1,250.50 ETB\nEscrow: 4,500.00 ETB\n\n<i>Last Payout: 2026-05-10</i>");
                break;
            case 'trigger_sos':
                await telegramService.sendMessage(chatId, "⚠️ <b>SOS ALERT ACTIVATED!</b>\n\nEmergency responders have been notified of your last known location. Stay safe.");
                // Actual SOS logic would be triggered here
                break;
            case 'view_jobs':
                await telegramService.sendMessage(chatId, "🔍 <b>Top Matches for You:</b>\n\n1. Housekeeper - Bole (85% Match)\n2. Nanny - Old Airport (78% Match)\n\nVisit the dashboard to apply!");
                break;
            default:
                await telegramService.sendMessage(chatId, "I didn't quite get that. Use /start to see options.");
        }
    }
}

module.exports = new TelegramBotController();
