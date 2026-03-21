const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const telegramService = require('../services/telegramService');

const prisma = new PrismaClient();

// JOB 1: Daily "Teaser" Matches (Runs every day at 09:00 AM)
cron.schedule('0 9 * * *', async () => {
    console.log('[CRON] Running Daily Teaser Matches Job...');
    try {
        // 1. Find all FREE tier employers
        const freeEmployers = await prisma.employer.findMany({
            where: { tier: 'FREE', isActive: true }
        });

        for (const employer of freeEmployers) {
            // Find active jobs for this employer
            const jobs = await prisma.jobPost.findMany({
                where: { employerId: employer.id }
            });

            for (const job of jobs) {
                // Get AI matches
                const matches = await prisma.$queryRawUnsafe(`SELECT * FROM match_seekers_for_job($1::uuid) LIMIT 3`, job.id);

                if (matches && matches.length > 0) {
                    const topMatch = matches[0];
                    if (topMatch.s_score > 70 && topMatch.s_tier === 'PLATINUM') {
                        const message = `🎯 <b>Great News!</b>\n\nWe found a highly-rated <b>${topMatch.s_score}% Match</b> for your "${job.title}" post today. This worker is <b>PLATINUM Verified</b> (Police & Medically Cleared).\n\n🔒 Upgrade your Trust Access to view their contact info and hire them securely!\n\nVisit: https://edwl-ethio-domesticworkerslink.web.app`;

                        // Send Telegram Message if linked, otherwise log
                        if (employer.telegramChatId) {
                            await telegramService.sendMessage(employer.telegramChatId, message);
                        } else {
                            console.log(`[TEASER REQUIRED for ${employer.phone}]: ${message}`);
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('[CRON Error] Daily Teaser Matches:', error);
    }
});

// JOB 2: 3-Day Subscription Expiry Alerts (Runs every day at 10:00 AM)
cron.schedule('0 10 * * *', async () => {
    console.log('[CRON] Running 3-Day Expiry Alerts Job...');
    try {
        // Calculate date 3 days from now
        const today = new Date();
        const threeDaysFromNowStart = new Date(today);
        threeDaysFromNowStart.setDate(today.getDate() + 3);
        threeDaysFromNowStart.setHours(0, 0, 0, 0);

        const threeDaysFromNowEnd = new Date(today);
        threeDaysFromNowEnd.setDate(today.getDate() + 3);
        threeDaysFromNowEnd.setHours(23, 59, 59, 999);

        // Find employers expiring in exactly 3 days
        const expiringEmployers = await prisma.employer.findMany({
            where: {
                subscriptionExpiry: {
                    gte: threeDaysFromNowStart,
                    lte: threeDaysFromNowEnd
                }
            }
        });

        for (const employer of expiringEmployers) {
            const message = `⚠️ <b>Subscription Alert</b>\n\nYour EDWL Time Access expires in exactly <b>3 days</b>. \n\nPlease renew your subscription to maintain access to worker profiles and messaging.\n\nVisit: https://edwl-ethio-domesticworkerslink.web.app`;

            if (employer.telegramChatId) {
                await telegramService.sendMessage(employer.telegramChatId, message);
            } else {
                console.log(`[EXPIRY ALERT for ${employer.phone}]: ${message}`);
            }
        }
    } catch (error) {
        console.error('[CRON Error] Expiry Alerts:', error);
    }
});

console.log('[CRON] Automation Jobs initialized.');
