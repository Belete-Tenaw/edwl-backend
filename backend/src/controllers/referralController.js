const prisma = require('../utils/prisma');

/**
 * Generates a unique referral code based on the user's name
 * Format: NAME + 3 random digits (e.g., BARK123)
 */
exports.generateReferralCode = async (name) => {
    const cleanName = name.split(' ')[0].toUpperCase().substring(0, 4);
    let code;
    let isUnique = false;

    while (!isUnique) {
        const randomDigits = Math.floor(100 + Math.random() * 900);
        code = `${cleanName}${randomDigits}`;

        // Check uniqueness in both tables
        const seeker = await prisma.jobSeeker.findUnique({ where: { referralCode: code } });
        const employer = await prisma.employer.findUnique({ where: { referralCode: code } });

        if (!seeker && !employer) {
            isUnique = true;
        }
    }
    return code;
};

/**
 * Tracks a referral during registration
 */
exports.trackReferral = async (referralCode, newUserType, newUserId) => {
    if (!referralCode) return;

    // Find the inviter
    let inviter = await prisma.jobSeeker.findUnique({ where: { referralCode } });
    let inviterType = 'seeker';

    if (!inviter) {
        inviter = await prisma.employer.findUnique({ where: { referralCode } });
        inviterType = 'employer';
    }

    if (!inviter) return; // Invalid code

    // Update the new user's referral info
    if (newUserType === 'seeker') {
        await prisma.jobSeeker.update({
            where: { id: newUserId },
            data: { referredById: inviter.id, referredByType: inviterType }
        });
    } else {
        await prisma.employer.update({
            where: { id: newUserId },
            data: { referredById: inviter.id, referredByType: inviterType }
        });
    }

    // Increment inviter's count
    if (inviterType === 'seeker') {
        const updatedInviter = await prisma.jobSeeker.update({
            where: { id: inviter.id },
            data: { referralCount: { increment: 1 } }
        });
        await this.processRewards(updatedInviter.id, 'seeker', updatedInviter.referralCount);
    } else {
        const updatedInviter = await prisma.employer.update({
            where: { id: inviter.id },
            data: { referralCount: { increment: 1 } }
        });
        await this.processRewards(updatedInviter.id, 'employer', updatedInviter.referralCount);
    }
};

/**
 * Processes rewards for successful referrals
 * Reward: 3 referrals = 7 days GOLD status
 */
exports.processRewards = async (userId, userType, count) => {
    // Reward every 3 referrals
    if (count % 3 === 0 && count > 0) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);

        if (userType === 'seeker') {
            const seeker = await prisma.jobSeeker.findUnique({
                where: { id: userId },
                select: { tier: true }
            });

            if (seeker.tier === 'GOLD' || seeker.tier === 'PLATINUM') {
                // High-tier workers get "Featured" boost instead of status upgrade
                await prisma.jobSeeker.update({
                    where: { id: userId },
                    data: {
                        isFeatured: true,
                        featuredExpiry: expiryDate
                    }
                });
            } else {
                // Lower-tier workers get upgraded to GOLD
                await prisma.jobSeeker.update({
                    where: { id: userId },
                    data: {
                        tier: 'GOLD',
                        subscriptionExpiry: expiryDate
                    }
                });
            }
        } else {
            // Employers get GOLD_ACCESS (Time Access)
            await prisma.employer.update({
                where: { id: userId },
                data: {
                    tier: 'GOLD_ACCESS',
                    subscriptionExpiry: expiryDate
                }
            });
        }

        // Audit Log
        await prisma.auditLog.create({
            data: {
                action: 'REFERRAL_REWARD_CLAIMED',
                userId,
                userType: userType === 'seeker' ? 'JOB_SEEKER' : 'EMPLOYER',
                details: { referralCount: count, rewardType: userType === 'seeker' ? 'FEATURED_OR_GOLD' : 'GOLD_ACCESS' }
            }
        });
    }
};
