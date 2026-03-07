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
    // Check if exactly 3 referrals (to prevent re-awarding every time after 3, 
    // though in a real SaaS we'd handle multiples of 3)
    // For now: 3 referrals = reward
    if (count % 3 === 0 && count > 0) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);

        if (userType === 'seeker') {
            await prisma.jobSeeker.update({
                where: { id: userId },
                data: {
                    tier: 'GOLD',
                    subscriptionExpiry: expiryDate
                }
            });
        } else {
            await prisma.employer.update({
                where: { id: userId },
                data: {
                    tier: 'GOLD_ACCESS',
                    subscriptionExpiry: expiryDate
                }
            });
        }
        // Future: Add notification/audit log for reward
    }
};
