const cron = require('node-cron');
const prisma = require('../utils/prisma');
const telegramService = require('../services/telegramService');
const aiTrustEngine = require('../services/aiTrustEngine');
const { runChurnPreventionAlg } = require('./predictiveRetention');
const { escalateStalemates } = require('../controllers/escrowController');
const { runOwnerAutopilotDigest } = require('../services/ownerAutopilotService');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://ethiodomesticworkers.web.app';

// JOB 1: Daily "Teaser" Matches (Runs every day at 09:00 AM)
if (process.env.NODE_ENV !== 'test') {
    cron.schedule('0 9 * * *', async () => {
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
                        if (topMatch.match_score > 70 && topMatch.tier === 'PLATINUM') {
                            const message = `🎯 <b>Great News!</b>\n\nWe found a strong reviewed match for your "${job.title}" post today.\n\n🔒 Upgrade your Trust Access to review profile details and hire securely.\n\nVisit: ${FRONTEND_URL}`;

                            // Send Telegram Message if linked
                            if (employer.telegramChatId) {
                                await telegramService.sendMessage(employer.telegramChatId, message);
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
                const message = `⚠️ <b>Subscription Alert</b>\n\nYour EDWL Time Access expires in exactly <b>3 days</b>. \n\nPlease renew your subscription to maintain access to worker profiles and messaging.\n\nVisit: ${FRONTEND_URL}`;

                if (employer.telegramChatId) {
                    await telegramService.sendMessage(employer.telegramChatId, message);
                }
            }
        } catch (error) {
            console.error('[CRON Error] Expiry Alerts:', error);
        }
    });

    // JOB 3: Nightly AI Trust Engine Vetting (Runs every day at 02:00 AM)
    cron.schedule('0 2 * * *', async () => {
        try {
            await aiTrustEngine.runNightlyBatchVetting();
        } catch (error) {
            console.error('[CRON Error] AI Trust Engine Nightly Batch:', error);
        }
    });

    // JOB 4: Automated LTV Re-engagement & Marketing Engine (Runs every day at 11:00 AM)
    cron.schedule('0 11 * * *', async () => {
        try {
            const today = new Date();
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 7);

            // 1. Identify 'Stalled' Freemium Employers (inactive for exactly 7 days)
            // Using a date range to avoid spamming the same employer every day
            const stalledEmployers = await prisma.employer.findMany({
                where: {
                    tier: 'FREE',
                    updatedAt: {
                        lte: sevenDaysAgo,
                        gte: new Date(sevenDaysAgo.getTime() - 24 * 60 * 60 * 1000)
                    }
                }
            });

            for (const employer of stalledEmployers) {
                // Generate a one-time dynamic re-engagement discount code (simulated logic)
                const promoCode = `COMEBACK-${Math.floor(Math.random() * 90000) + 10000}`;
                
                await prisma.subscriptionCode.create({
                    data: {
                        code: promoCode,
                        status: 'UNUSED',
                        durationDays: 30,
                        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Expires in 3 days
                        codeType: 'TRUST_UPGRADE',
                        tierUpgrade: 'SILVER_ACCESS'
                    }
                });

                // Blast the localized, urgency-driven marketing message
                const message = `✨ <b>EDWL Trust Upgrade</b>\n\nHi ${employer.contactName}, we noticed you have not completed a hire yet.\n\nUse code <b>${promoCode}</b> within the next 72 hours to review available worker profiles with a 30-day Silver Trust Upgrade.\n\nClaim here: ${FRONTEND_URL}`;

                if (employer.telegramChatId) {
                    await telegramService.sendMessage(employer.telegramChatId, message);
                }
                
                // Track the marketing touchpoint
                await prisma.auditLog.create({
                    data: {
                        action: 'MARKETING_REENGAGEMENT_SENT',
                        userType: 'EMPLOYER',
                        employerId: employer.id,
                        details: { promoCode, trigger: '7_day_inactivity' }
                    }
                });
            }
        } catch (error) {
            console.error('[CRON Error] LTV Re-engagement Marketing Engine:', error);
        }
    });

    // JOB 5: Phase 3 Predictive Analytics & Churn Prevention (Runs every day at 12:00 PM)
    cron.schedule('0 12 * * *', async () => {
        try {
            await runChurnPreventionAlg();
        } catch (error) {
            console.error('[CRON Error] Phase 3 Churn Prevention:', error);
        }
    });

    // JOB 6: 🤝 Smart-Contract Escrow Stalemate Auto-Escalation (Runs every day at 03:00 AM)
    // If only one party confirmed completion after 7 days → auto-open AI mediation dispute
    cron.schedule('0 3 * * *', async () => {
        try {
            await escalateStalemates();
        } catch (error) {
            console.error('[CRON Error] Escrow Stalemate Escalation:', error);
        }
    });

    // JOB 7: Owner Autopilot Morning Brief (Runs every day at 06:30 AM)
    // Sends revenue, trust, retention, and action queue intelligence to the owner.
    cron.schedule('30 6 * * *', async () => {
        try {
            await runOwnerAutopilotDigest({ notify: true });
        } catch (error) {
            console.error('[CRON Error] Owner Autopilot Digest:', error);
        }
    });
}
