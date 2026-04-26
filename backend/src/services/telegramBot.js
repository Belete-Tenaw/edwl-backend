const TelegramBot = require('node-telegram-bot-api');
const prisma = require('../utils/prisma');

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    console.error('[TelegramBot] TELEGRAM_BOT_TOKEN missing in .env. Bot listener failed to start.');
} else if (process.env.NODE_ENV !== 'test') {
    const bot = new TelegramBot(token, { polling: true });

    /**
     * Listener for the /start command.
     * Expected format: /start [userId]
     * This allows users to link their EDWL account with their Telegram chat.
     */
    bot.onText(/\/start (.+)/, async (msg, match) => {
        const chatId = msg.chat.id.toString();
        const userId = match[1]; // The part after /start

        try {
            // Attempt to find user in either JobSeeker or Employer
            const seeker = await prisma.jobSeeker.findUnique({ where: { id: userId } });
            const employer = await prisma.employer.findUnique({ where: { id: userId } });

            if (seeker) {
                await prisma.jobSeeker.update({
                    where: { id: userId },
                    data: { telegramChatId: chatId }
                });
                bot.sendMessage(chatId, `🎉 <b>Welcome ${seeker.fullName}!</b>\n\nYour EDWL account is now linked to Telegram. You will receive real-time alerts for tier upgrades and subscriptions.`, { parse_mode: 'HTML' });
            } else if (employer) {
                await prisma.employer.update({
                    where: { id: userId },
                    data: { telegramChatId: chatId }
                });
                bot.sendMessage(chatId, `🎉 <b>Welcome ${employer.contactName}!</b>\n\nYour EDWL account is now linked to Telegram. You will receive real-role alerts.`, { parse_mode: 'HTML' });
            } else {
                bot.sendMessage(chatId, '❌ User not found. Please ensure you clicked the link from the EDWL platform.');
            }

        } catch (error) {
            console.error('[TelegramBot] Error linking account:', error.message);
            bot.sendMessage(chatId, '❌ An error occurred while linking your account.');
        }
    });

    // Generic welcome if no user ID provided
    bot.onText(/\/start$/, (msg) => {
        bot.sendMessage(msg.chat.id, "👋 Welcome to <b>Ethio Domestic Workers Link (EDWL)</b>.\n\nPlease link your account from the dashboard to receive notifications.", { parse_mode: 'HTML' });
    });

    module.exports = bot;
}

