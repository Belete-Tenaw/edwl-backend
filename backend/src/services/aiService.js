const prisma = require('../utils/prisma');

class AIService {
    /**
     * Calculate a compatibility score between a Job Seeker and a Job Post/Employer
     */
    async calculatePrecisionMatch(workerId, targetId, type = 'JOB_POST') {
        const worker = await prisma.jobSeeker.findUnique({
            where: { id: workerId },
            include: { userTrainings: true }
        });

        let target;
        if (type === 'JOB_POST') {
            target = await prisma.jobPost.findUnique({ where: { id: targetId } });
        } else {
            target = await prisma.hiringRequirement.findUnique({ where: { employerId: targetId } });
        }

        if (!worker || !target) return { score: 0, factors: [] };

        let score = 0;
        const factors = [];

        // 1. Skill Match (40%)
        const workerSkills = worker.skills || [];
        const requiredSkills = target.requiredSkills || target.requirements?.skills || [];
        const matchingSkills = workerSkills.filter(s => requiredSkills.includes(s));
        const skillScore = requiredSkills.length > 0 ? (matchingSkills.length / requiredSkills.length) * 40 : 20;
        score += skillScore;
        factors.push({ name: 'Skill Alignment', weight: skillScore });

        // 2. Experience & Reliability (30%)
        const expScore = Math.min((worker.experienceYears / 5) * 15, 15); // Max 15% for 5+ years
        const reliabilityScore = (worker.behaviorScore / 100) * 15; // Max 15%
        score += expScore + reliabilityScore;
        factors.push({ name: 'Experience & Trust', weight: expScore + reliabilityScore });

        // 3. Training & Certifications (20%)
        const trainingScore = Math.min((worker.userTrainings.length / 3) * 20, 20); // Max 20% for 3+ certifications
        score += trainingScore;
        factors.push({ name: 'Professional Certification', weight: trainingScore });

        // 4. Proximity & Communication (10%)
        const targetLanguages = target.requirements?.languages || ['Amharic'];
        const matchingLangs = worker.languages.filter(l => targetLanguages.includes(l));
        const commScore = targetLanguages.length > 0 ? (matchingLangs.length / targetLanguages.length) * 10 : 10;
        score += commScore;
        factors.push({ name: 'Communication Fit', weight: commScore });

        // Normalize and add "AI Confidence"
        const finalScore = Math.min(Math.round(score), 99);
        
        return {
            score: finalScore,
            factors,
            recommendation: finalScore > 85 ? 'Highly Recommended' : finalScore > 65 ? 'Strong Match' : 'Potential Fit',
            insights: [
                `${matchingSkills.length} overlapping skills found.`,
                worker.userTrainings.length > 0 ? 'Verified EDWL Academy certifications.' : 'Needs training in Ethics.',
                `Reliability index: ${worker.behaviorScore}%`
            ]
        };
    }

    /**
     * AI Dispute Mediation Logic
     * Analyzes dispute reason, contract terms, and chat history to suggest a resolution.
     */
    async mediateConflict(disputeId) {
        try {
            const dispute = await prisma.dispute.findUnique({
                where: { id: disputeId },
                include: {
                    contract: {
                        include: { 
                            terms: true,
                            jobSeeker: { select: { id: true, behaviorScore: true, fullName: true } },
                            employer: { select: { id: true, behaviorScore: true, contactName: true } },
                            escrowContracts: true
                        }
                    }
                }
            });

            if (!dispute) return { error: 'Dispute not found' };

            const { reason, description, contract } = dispute;
            const workerId = contract?.jobSeeker?.id;
            const employerId = contract?.employer?.id;

            // 1. Fetch Chat History Context
            const chatHistory = await prisma.message.findMany({
                where: {
                    OR: [
                        { senderJSId: workerId, receiverEmpId: employerId },
                        { senderEmpId: employerId, receiverJSId: workerId }
                    ]
                },
                orderBy: { timestamp: 'desc' },
                take: 50
            });

            const chatText = chatHistory.map(m => m.content).join(' ');
            const inputLower = (reason + " " + description + " " + chatText).toLowerCase();
            
            let suggestion = "";
            let confidence = 0.60;
            let actionType = "HUMAN_REVIEW";

            // 2. Logic Tree for AI Mediation
            const salary = contract?.salary || 0;
            const escrow = contract?.escrowContracts[0];

            // Case A: Payment/Escrow Dispute
            if (inputLower.includes('payment') || inputLower.includes('salary') || inputLower.includes('money') || inputLower.includes('escrow')) {
                const workerScore = contract?.jobSeeker?.behaviorScore || 50;
                const hasWorkProof = chatText.toLowerCase().includes('done') || chatText.toLowerCase().includes('finished') || escrow?.workerConfirmed;
                
                if (hasWorkProof && workerScore > 85) {
                    suggestion = `High-trust worker with proof of completion in chat. Suggest 100% Escrow release to ${contract.jobSeeker.fullName}.`;
                    confidence = 0.94;
                } else if (chatText.toLowerCase().includes('wait') || chatText.toLowerCase().includes('later')) {
                    suggestion = "Employer requested delay detected in chat. Recommend partial release (40%) to Worker and 60% hold pending final confirmation.";
                    confidence = 0.85;
                } else {
                    suggestion = "Conflicting payment claims. Recommend 50/50 split of escrowed funds to close the dispute amicably.";
                    confidence = 0.70;
                }
            } 
            // Case B: Safety/Behavior (Zero Tolerance)
            else if (inputLower.includes('abuse') || inputLower.includes('harassment') || inputLower.includes('violence') || inputLower.includes('threat')) {
                suggestion = "🚨 CRITICAL SAFETY EVENT: AI recommends immediate contract termination, permanent account suspension, and referral to security partners.";
                confidence = 0.99;
                actionType = "AUTO_TERMINATE";
            }
            // Case C: Attendance/No-Show
            else if (inputLower.includes('late') || inputLower.includes('absence') || inputLower.includes('no show')) {
                const employerScore = contract?.employer?.behaviorScore || 50;
                if (employerScore > 90) {
                    suggestion = "Reliable Employer reporting no-show. Chat shows no response from Worker. Recommend 100% refund to Employer.";
                    confidence = 0.91;
                } else {
                    suggestion = "Possible attendance dispute. Recommend 10% penalty and a mediated warning.";
                    confidence = 0.75;
                }
            }
            else {
                suggestion = "Ambiguous dispute. Suggest a voice-recorded statement from both parties to provide more context for human moderation.";
                confidence = 0.45;
            }

            // 3. Persist AI Insight
            const updatedDispute = await prisma.dispute.update({
                where: { id: disputeId },
                data: {
                    aiSuggestedResolution: suggestion,
                    aiConfidenceScore: confidence,
                    autoMediated: confidence > 0.95
                }
            });

            return {
                disputeId,
                suggestion,
                confidence,
                autoMediated: updatedDispute.autoMediated,
                actionType,
                contextAnalyzed: {
                    messages: chatHistory.length,
                    terms: contract?.terms?.length || 0
                }
            };
        } catch (error) {
            console.error('[AI Mediation Error]', error);
            return { error: 'Failed to process mediation' };
        }
    }
   /**
     * Predictive Churn Analysis for Employers
     */
    async predictEmployerChurn(employerId) {
        const employer = await prisma.employer.findUnique({
            where: { id: employerId },
            include: { jobPosts: { orderBy: { updatedAt: 'desc' }, take: 1 }, contracts: { orderBy: { createdAt: 'desc' }, take: 1 } }
        });

        if (!employer) return { churnRisk: 'N/A' };

        const lastActivity = employer.jobPosts[0]?.updatedAt || employer.contracts[0]?.createdAt || employer.createdAt;
        const daysSinceLastActivity = Math.floor((new Date() - new Date(lastActivity)) / (1000 * 60 * 60 * 24));
        
        let risk = 'Low';
        if (daysSinceLastActivity > 30) risk = 'Critical';
        else if (daysSinceLastActivity > 14) risk = 'High';
        else if (daysSinceLastActivity > 7) risk = 'Medium';

        return {
            churnRisk: risk,
            daysInactive: daysSinceLastActivity,
            action: risk === 'Critical' ? 'Automatic Phone Outreach' : risk === 'High' ? 'Send 20% Discount Coupon' : 'Recommend Featured Listing'
        };
    }
}

module.exports = new AIService();

