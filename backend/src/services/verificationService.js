const prisma = require('../utils/prisma');
const { logAction } = require('./auditService');
const { sendTelegramAlert } = require('./notificationService');

/**
 * Sends a notification to the user about their verification status.
 * @param {string} userId
 * @param {string} type - 'SEEKER' or 'EMPLOYER'
 * @param {string} status - 'APPROVED' or 'REJECTED'
 * @param {string} tier - New tier if approved
 * @param {string} reason - Rejection reason if applicable
 */
const sendVerificationNotice = async (userId, type, status, tier = null, reason = null) => {
    try {
        const user = type === 'SEEKER' 
            ? await prisma.jobSeeker.findUnique({ where: { id: userId }, select: { telegramChatId: true, fullName: true, phone: true } })
            : await prisma.employer.findUnique({ where: { id: userId }, select: { telegramChatId: true, contactName: true, phone: true } });

        if (!user || !user.telegramChatId) return;

        let message = '';
        if (status === 'APPROVED') {
            message = `🎉 <b>Verification Approved!</b>\n\nCongratulations ${user.fullName || user.contactName}, your account has been verified. Your new tier is <b>${tier || 'STANDARD'}</b>.`;
        } else {
            message = `⚠️ <b>Verification Rejected</b>\n\nHello ${user.fullName || user.contactName}, unfortunately your verification request was not approved.\n\n<b>Reason:</b> ${reason || 'Documents did not meet our standards.'}\n\nPlease re-upload valid documents to try again.`;
        }

        await sendTelegramAlert(user.telegramChatId, message);
    } catch (error) {
        console.error('[VerificationNotice] Error:', error.message);
    }
};

/**
 * Processes a verification request using a Prisma transaction for atomicity.
 * @param {string} adminId
 * @param {string} requestId - The ID of the VerificationRequest
 * @param {string} status - 'APPROVED' or 'REJECTED'
 * @param {string} tier - Optional tier to upgrade to (e.g., 'GOLD')
 * @param {string} reason - Rejection reason if applicable
 */
exports.processVerificationRequest = async (adminId, requestId, status, tier, reason = null) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Fetch the request
        const request = await tx.verificationRequest.findUnique({
            where: { id: requestId }
        });

        if (!request) {
            throw new Error('Verification request not found.');
        }

        if (request.status !== 'PENDING') {
            throw new Error(`Request has already been processed (${request.status}).`);
        }

        const targetUserId = request.jobSeekerId || request.employerId;
        const targetType = request.jobSeekerId ? 'SEEKER' : 'EMPLOYER';

        // 2. Update the VerificationRequest
        await tx.verificationRequest.update({
            where: { id: requestId },
            data: {
                status,
                reviewedAt: new Date()
            }
        });

        // 3. Update the User (JobSeeker or Employer)
        if (status === 'APPROVED') {
            const updateData = {
                verificationStatus: 'APPROVED',
                isVerified: true
            };
            
            if (tier) {
                updateData.tier = tier;
            }

            if (targetType === 'SEEKER') {
                await tx.jobSeeker.update({ where: { id: targetUserId }, data: updateData });
            } else {
                await tx.employer.update({ where: { id: targetUserId }, data: updateData });
            }
        } else if (status === 'REJECTED') {
            const updateData = {
                verificationStatus: 'REJECTED',
                isVerified: false
            };
            
            if (targetType === 'SEEKER') {
                await tx.jobSeeker.update({ where: { id: targetUserId }, data: updateData });
            } else {
                await tx.employer.update({ where: { id: targetUserId }, data: updateData });
            }

            // Trigger notification
            await sendVerificationNotice(targetUserId, targetType, 'REJECTED', null, reason);
        }

        // 4. Audit Log
        await logAction(
            'ADMIN_VERIFY_USER',
            adminId,
            'ADMIN',
            {
                requestId,
                targetUserId,
                targetUserType: targetType,
                action: status,
                assignedTier: tier || null,
                rejectReason: reason || null
            },
            tx // Pass transaction client to audit service if supported, otherwise standard logAction will execute sequentially
        );

        // 5. Trigger Approval Notification (Outside of transaction for stability)
        if (status === 'APPROVED') {
            sendVerificationNotice(targetUserId, targetType, 'APPROVED', tier);
        }

        return { success: true, status, targetUserId };
    });
};
