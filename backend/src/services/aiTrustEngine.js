const prisma = require('../utils/prisma');
const notificationService = require('./notificationService');
const telegramService = require('./telegramService');

/**
 * AI-Powered Vetting (The Trust Engine)
 * This service runs asynchronously to evaluate a JobSeeker's profile,
 * simulate digital footprint/NLP background checks, and automate tier progression.
 */

class AITrustEngine {
    
    /**
     * Evaluates a worker's Trust Matrix and automatically updates their Tier & Behavior Score.
     * @param {string} workerId 
     */
    async evaluateWorker(workerId) {
        try {
            const worker = await prisma.jobSeeker.findUnique({
                where: { id: workerId },
                include: { reviewsReceived: true }
            });

            if (!worker) return null;

            let behaviorScore = worker.behaviorScore || 50;

            // 1. Digital Footprint Scan (Simulated)
            // In a real LangChain/Vertex integration, this would call out to identity APIs.
            // Here, we evaluate profile completeness and document uploads.
            let footprintScore = 0;
            if (worker.isFaydaVerified) footprintScore += 20;
            if (worker.nationalIdUrl) footprintScore += 10;
            if (worker.policeClearanceUrl) footprintScore += 15;
            if (worker.healthCertificateUrl) footprintScore += 5;
            if (worker.profilePhoto) footprintScore += 5;

            // 2. Peer-Review NLP Score (Simulated)
            // Average rating provides a baseline, but "Reliability Velocity" looks at review volume.
            let reviewScore = 0;
            if (worker.reviewsReceived && worker.reviewsReceived.length > 0) {
                const totalRating = worker.reviewsReceived.reduce((acc, rev) => acc + rev.rating, 0);
                const avgRating = totalRating / worker.reviewsReceived.length;
                
                // NLP sentiment simulation: if they maintain >4.5 over multiple reviews
                if (avgRating >= 4.5 && worker.reviewsReceived.length >= 3) {
                    reviewScore = 30; // High positive sentiment momentum
                } else if (avgRating >= 4.0) {
                    reviewScore = 15;
                }
            }

            // Calculate final behavior score (Max 100)
            const finalBehaviorScore = Math.min(footprintScore + reviewScore + (worker.completedJobs * 2), 100);

            // 3. Automated Tiering Pipeline
            let newTier = worker.tier;
            let upgraded = false;

            // Bronze (Default) -> Silver (Automated)
            // Requires verified ID + basic digital footprint
            if (worker.tier === 'BRONZE' && worker.isFaydaVerified && worker.nationalIdUrl && finalBehaviorScore >= 40) {
                newTier = 'SILVER';
                upgraded = true;
            }
            
            // Silver -> Gold (AI Pre-approval)
            // Requires high behavior score, police clearance, and proven platform track record
            else if (worker.tier === 'SILVER' && worker.policeClearanceUrl && worker.completedJobs >= 3 && finalBehaviorScore >= 75) {
                newTier = 'GOLD';
                upgraded = true;
            }

            // Update Database
            await prisma.jobSeeker.update({
                where: { id: workerId },
                data: {
                    behaviorScore: finalBehaviorScore,
                    tier: newTier
                }
            });

            // 4. Fire Notifications
            if (upgraded) {
                const msg = `🎉 <b>Tier Upgrade!</b>\n\nCongratulations, ${worker.fullName}! Your profile has been automatically vetted by our Trust Engine and upgraded to <b>${newTier} Tier</b>.\n\nYour profile will now be prioritized by the AI Matching Algorithm!`;
                
                if (worker.telegramChatId) {
                    await telegramService.sendMessage(worker.telegramChatId, msg);
                }
                
                // If IO is passed via global app or we use notificationService:
                // Notification service might need IO, so we just log to DB
                await notificationService.createInAppNotification(
                    worker.id,
                    'JOB_SEEKER',
                    'Profile Upgraded!',
                    `Your Trust Matrix score increased. You are now ${newTier} Tier.`,
                    'SYSTEM',
                    null
                );
            }

            return { finalBehaviorScore, newTier, upgraded };

        } catch (error) {
            console.error('[AI Trust Engine Error]', error);
            return null;
        }
    }

    /**
     * Batch job to run nightly over active workers
     */
    async runNightlyBatchVetting() {
        console.log('[AI Trust Engine] Starting Nightly Vetting Batch...');
        try {
            // Find active workers who have uploaded docs or completed jobs recently
            const workersToEvaluate = await prisma.jobSeeker.findMany({
                where: { 
                    isActive: true,
                    OR: [
                        { tier: 'BRONZE', nationalIdUrl: { not: null } },
                        { tier: 'SILVER', completedJobs: { gte: 1 } }
                    ]
                },
                select: { id: true }
            });

            let upgrades = 0;
            for (const w of workersToEvaluate) {
                const result = await this.evaluateWorker(w.id);
                if (result && result.upgraded) upgrades++;
            }

            console.log(`[AI Trust Engine] Batch Complete. Upgraded ${upgrades} workers.`);
        } catch (err) {
            console.error('[AI Trust Engine] Batch Failed', err);
        }
    }
}

module.exports = new AITrustEngine();
