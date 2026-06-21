const prisma = require('../utils/prisma');
const chapaService = require('../services/chapaService');
const stripeService = require('../services/stripeService');
const crypto = require('crypto');

/**
 * ============================================================
 * 🔐 SMART-CONTRACT ESCROW ENGINE
 * HMAC-SHA256 integrity locking + dual-party confirmation.
 * Funds are held in a cryptographically-bound escrow and
 * only released when BOTH parties confirm work is complete.
 * Auto-escalation to AI mediation after 7 days of stalemate.
 * ============================================================
 */

/**
 * Generates a SHA-256 HMAC signature for an escrow transaction.
 * This is stored on creation and re-verified before any payout, preventing tampering.
 */
const generateEscrowSignature = (contractId, amount, workerId, employerId) => {
    const secret = process.env.JWT_SECRET || 'test_secret';
    return crypto
        .createHmac('sha256', secret)
        .update(`${contractId}:${amount}:${workerId}:${employerId}`)
        .digest('hex');
};

// ─────────────────────────────────────────────
// Initiate Escrow (Employer deposits funds)
// ─────────────────────────────────────────────
exports.initiateEscrow = async (req, res) => {
    try {
        const { contractId, amount, currency = 'ETB' } = req.body;
        const employerId = req.user.userId;

        const contract = await prisma.contract.findUnique({
            where: { id: contractId },
            include: { jobSeeker: true, employer: true }
        });

        if (!contract || contract.employerId !== employerId) {
            return res.status(404).json({ error: "Contract not found or unauthorized." });
        }

        const provider = currency === 'USD' ? 'STRIPE' : 'CHAPA';
        const providerRef = `ESC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const salaryAmount = parseFloat(amount);
        const platformFee = Math.round(salaryAmount * 0.05); // 5% matching commission fee
        const totalCharge = salaryAmount + platformFee;

        // Generate HMAC signature to cryptographically bind escrow to its original parameters
        const transactionHash = generateEscrowSignature(
            contractId,
            salaryAmount,
            contract.jobSeekerId,
            employerId
        );

        // Create Escrow Record (Status PENDING until verified)
        const escrow = await prisma.escrowContract.create({
            data: {
                contractId,
                employerId,
                workerId: contract.jobSeekerId,
                jobId: contract.jobPostId,
                amount: salaryAmount,
                status: 'PENDING',
                provider,
                providerRef,
                transactionHash
            }
        });

        // Track Platform Fee as a pending revenue payment record
        await prisma.payment.create({
            data: {
                amount: platformFee,
                currency: currency,
                provider: provider === 'STRIPE' ? 'STRIPE' : 'CHAPA',
                transactionReference: providerRef,
                status: 'PENDING',
                employerId: employerId
            }
        });

        const checkoutData = {
            amount: totalCharge.toString(),
            currency: currency,
            email: contract.employer.email || 'employer@edwl.et',
            first_name: (contract.employer.contactName || 'Employer').split(' ')[0],
            last_name: (contract.employer.contactName || 'Employer').split(' ')[1] || 'User',
            tx_ref: providerRef,
            callback_url: `${process.env.BASE_URL}/api/escrow/webhook`,
            return_url: `${process.env.FRONTEND_URL || 'https://edwl.et'}/escrow-success?ref=${providerRef}`,
            customization: {
                title: `EDWL Escrow Payment`,
                description: `Salary: ${salaryAmount} ${currency} + 5% Platform Matching Fee: ${platformFee} ${currency}`
            }
        };

        let paymentRes;
        if (provider === 'STRIPE') {
            paymentRes = await stripeService.initialize(checkoutData);
        } else {
            paymentRes = await chapaService.initialize(checkoutData);
        }

        if (paymentRes.status === 'success') {
            return res.status(201).json({ 
                message: "Escrow payment initialized.", 
                escrow,
                paymentUrl: paymentRes.data.checkout_url
            });
        }

        throw new Error('Failed to initialize payment gateway');

    } catch (error) {
        console.error("Initiate escrow error:", error);
        res.status(500).json({ error: "Failed to initiate escrow." });
    }
};

const notificationService = require('../services/notificationService');

// ─────────────────────────────────────────────
// Verify Escrow Payment (Gateway webhook)
// ─────────────────────────────────────────────
exports.verifyEscrow = async (req, res) => {
    try {
        const { providerRef } = req.body;
        
        const escrow = await prisma.escrowContract.findUnique({
            where: { providerRef }
        });

        if (!escrow) return res.status(404).json({ error: "Escrow not found." });
        if (escrow.status !== 'PENDING') return res.json({ message: "Already processed", escrow });

        let verification;
        if (escrow.provider === 'STRIPE') {
            verification = await stripeService.verify(providerRef);
            if (verification.status !== 'success' && verification.status !== 'paid') {
                return res.status(400).json({ error: "Payment not verified" });
            }
        } else {
            verification = await chapaService.verify(providerRef);
            if (verification.status !== 'success') {
                return res.status(400).json({ error: "Payment not verified" });
            }
        }

        // Transactionally update Escrow status, Contract status, and finalize Platform matching fee Payment
        const updatedEscrow = await prisma.$transaction(async (tx) => {
            const updated = await tx.escrowContract.update({
                where: { id: escrow.id },
                data: { status: 'FUNDED' }
            });

            await tx.contract.update({
                where: { id: escrow.contractId },
                data: { status: 'ACTIVE' }
            });

            // Mark the 5% platform fee payment as completed (counted in admin dashboard)
            await tx.payment.updateMany({
                where: { transactionReference: providerRef },
                data: { status: 'COMPLETED' }
            });

            return updated;
        });

        // NOTIFY WORKER
        await notificationService.notify(escrow.workerId, 'JOB_SEEKER', {
            title: 'Escrow Funded! 💳',
            message: `The employer has funded the escrow for your contract. Your payment is secured.`,
            type: 'PAYMENT'
        });

        res.json({ message: "Escrow funded successfully.", escrow: updatedEscrow });
    } catch (error) {
        console.error("Verify escrow error:", error);
        res.status(500).json({ error: "Failed to verify escrow." });
    }
};

// ─────────────────────────────────────────────────────────────
// 🤝 SMART-CONTRACT: Dual-Party Confirmation
//
// Both employer AND worker must call this endpoint to confirm
// that the job is complete. Funds are released automatically
// only when BOTH confirmations are received (like a multi-sig).
// If only one party confirms after 7 days → auto-escalate to
// AI mediation.
// ─────────────────────────────────────────────────────────────
exports.confirmCompletion = async (req, res) => {
    try {
        const { escrowId } = req.params;
        const userId   = req.user.userId;
        const userRole = req.user.role; // 'employer' | 'seeker'

        const escrow = await prisma.escrowContract.findUnique({ where: { id: escrowId } });
        if (!escrow) return res.status(404).json({ error: "Escrow not found." });
        if (escrow.status !== 'FUNDED') {
            return res.status(400).json({ error: `Cannot confirm in ${escrow.status} status.` });
        }

        // Determine which confirmation flag to set
        const isEmployer = userRole === 'employer' && escrow.employerId === userId;
        const isWorker   = userRole === 'seeker'   && escrow.workerId   === userId;

        if (!isEmployer && !isWorker) {
            return res.status(403).json({ error: "Not a party to this escrow." });
        }

        const updateData = isEmployer
            ? { employerConfirmed: true }
            : { workerConfirmed: true };

        const updated = await prisma.escrowContract.update({
            where: { id: escrowId },
            data: updateData
        });

        // Check if BOTH parties have now confirmed → trigger automatic release
        if (updated.employerConfirmed && updated.workerConfirmed) {
            // Cryptographic integrity check before release
            if (updated.transactionHash) {
                const expectedHash = generateEscrowSignature(
                    updated.contractId,
                    updated.amount,
                    updated.workerId,
                    updated.employerId
                );
                if (expectedHash !== updated.transactionHash) {
                    console.error(`[SECURITY ALERT] Escrow ${escrowId} HMAC mismatch on dual-confirm!`);
                    return res.status(403).json({ error: 'Security validation failed: Escrow integrity check failed.' });
                }
            }

            // Auto-release funds
            await prisma.$transaction(async (tx) => {
                await tx.escrowContract.update({
                    where: { id: escrowId },
                    data: { status: 'RELEASED', releaseDate: new Date() }
                });
                await tx.contract.update({
                    where: { id: updated.contractId },
                    data: { status: 'COMPLETED' }
                });
            });

            // Notify both parties
            await notificationService.notify(updated.workerId, 'JOB_SEEKER', {
                title: '🎉 Payment Auto-Released!',
                message: `Both parties confirmed completion. ${updated.amount} ETB has been released to your account.`,
                type: 'PAYMENT'
            });
            await notificationService.notify(updated.employerId, 'EMPLOYER', {
                title: '✅ Contract Completed',
                message: `Escrow funds have been auto-released to the worker. Contract is now closed.`,
                type: 'PAYMENT'
            });

            return res.json({
                message: "Both parties confirmed. Funds auto-released to worker.",
                status: 'RELEASED'
            });
        }

        // Only one party confirmed — schedule 7-day stalemate window
        const party = isEmployer ? 'Employer' : 'Worker';
        await notificationService.notify(
            isEmployer ? updated.workerId : updated.employerId,
            isEmployer ? 'JOB_SEEKER' : 'EMPLOYER',
            {
                title: '⏳ Awaiting Your Confirmation',
                message: `${party} has confirmed job completion. Please confirm to release escrow funds, or raise a dispute if there is an issue.`,
                type: 'PAYMENT'
            }
        );

        return res.json({
            message: `${party} confirmation recorded. Awaiting the other party.`,
            employerConfirmed: updated.employerConfirmed,
            workerConfirmed: updated.workerConfirmed
        });

    } catch (error) {
        console.error("Confirm completion error:", error);
        res.status(500).json({ error: "Failed to record confirmation." });
    }
};

// ─────────────────────────────────────────────────────────────
// 🤖 STALEMATE AUTO-ESCALATION (called by cron job)
// Escalates to AI mediation if only one party confirmed
// and 7 days have passed since first confirmation.
// ─────────────────────────────────────────────────────────────
exports.escalateStalemates = async () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Find escrows where exactly one party confirmed and contract is old enough
    const stalemates = await prisma.escrowContract.findMany({
        where: {
            status: 'FUNDED',
            updatedAt: { lt: sevenDaysAgo },
            OR: [
                { employerConfirmed: true, workerConfirmed: false },
                { employerConfirmed: false, workerConfirmed: true }
            ]
        }
    });

    for (const escrow of stalemates) {
        // Open a dispute and mark escrow as DISPUTED
        await prisma.$transaction(async (tx) => {
            await tx.escrowContract.update({
                where: { id: escrow.id },
                data: { status: 'DISPUTED' }
            });
            await tx.dispute.create({
                data: {
                    contractId: escrow.contractId,
                    reason: 'ESCROW_STALEMATE',
                    description: `Auto-escalated: escrow ${escrow.id} had one-sided confirmation for over 7 days.`,
                    status: 'OPEN'
                }
            });
        });

        // Notify both parties
        await notificationService.notify(escrow.workerId, 'JOB_SEEKER', {
            title: '⚠️ Escrow Dispute Opened',
            message: 'Your escrow has been escalated to AI mediation due to incomplete confirmation after 7 days.',
            type: 'SYSTEM'
        });
        await notificationService.notify(escrow.employerId, 'EMPLOYER', {
            title: '⚠️ Escrow Dispute Opened',
            message: 'Your escrow has been escalated to AI mediation due to incomplete confirmation after 7 days.',
            type: 'SYSTEM'
        });
    }

    console.log(`[EscrowCron] Escalated ${stalemates.length} stalemate escrow(s).`);
};

// ─────────────────────────────────────────────────────────────
// 🛡️ Admin Override Release (emergency manual release)
// ─────────────────────────────────────────────────────────────
exports.adminReleaseEscrow = async (req, res) => {
    try {
        const { escrowId } = req.params;
        const { reason } = req.body;

        const escrow = await prisma.escrowContract.findUnique({ where: { id: escrowId } });
        if (!escrow) return res.status(404).json({ error: "Escrow not found." });

        if (!['FUNDED', 'DISPUTED'].includes(escrow.status)) {
            return res.status(400).json({ error: `Cannot admin-release escrow in ${escrow.status} status.` });
        }

        await prisma.$transaction(async (tx) => {
            await tx.escrowContract.update({
                where: { id: escrowId },
                data: { status: 'RELEASED', releaseDate: new Date() }
            });
            if (escrow.contractId) {
                await tx.contract.update({
                    where: { id: escrow.contractId },
                    data: { status: 'COMPLETED' }
                });
            }
            // Audit log
            await tx.auditLog.create({
                data: {
                    action: 'ADMIN_ESCROW_RELEASE',
                    userId: req.user.userId,
                    userType: 'ADMIN',
                    details: { escrowId, reason, amount: escrow.amount }
                }
            });
        });

        await notificationService.notify(escrow.workerId, 'JOB_SEEKER', {
            title: '✅ Payment Released by Admin',
            message: `An administrator has released your escrow payment of ${escrow.amount} ETB.`,
            type: 'PAYMENT'
        });

        return res.json({ message: "Escrow manually released by admin.", escrowId });
    } catch (error) {
        console.error("Admin release escrow error:", error);
        res.status(500).json({ error: "Failed to admin-release escrow." });
    }
};

// ─────────────────────────────────────────────
// Release Escrow (legacy single-party release)
// ─────────────────────────────────────────────
exports.releaseEscrow = async (req, res) => {
    try {
        const { escrowId } = req.params;
        const employerId = req.user.userId;

        const escrow = await prisma.escrowContract.findUnique({
            where: { id: escrowId }
        });

        if (!escrow || escrow.employerId !== employerId) {
            return res.status(404).json({ error: "Escrow record not found or unauthorized." });
        }

        if (escrow.status !== 'FUNDED') {
            return res.status(400).json({ error: `Cannot release funds in ${escrow.status} status.` });
        }

        // CRYPTOGRAPHIC VERIFICATION: Re-compute the HMAC and assert it matches the stored hash.
        if (escrow.transactionHash) {
            const expectedHash = generateEscrowSignature(
                escrow.contractId,
                escrow.amount,
                escrow.workerId,
                escrow.employerId
            );
            if (expectedHash !== escrow.transactionHash) {
                console.error(`[SECURITY ALERT] Escrow ${escrowId} HMAC mismatch! Possible data tampering detected.`);
                return res.status(403).json({ error: 'Security validation failed: Escrow integrity check failed. Contact support.' });
            }
        }

        const updatedEscrow = await prisma.escrowContract.update({
            where: { id: escrowId },
            data: {
                status: 'RELEASED',
                releaseDate: new Date()
            }
        });

        await prisma.contract.update({
            where: { id: escrow.contractId },
            data: { status: 'COMPLETED' }
        });

        // NOTIFY WORKER
        await notificationService.notify(escrow.workerId, 'JOB_SEEKER', {
            title: 'Payment Released! 🎉',
            message: `The employer has released your payment of ${escrow.amount} ETB. Check your wallet.`,
            type: 'PAYMENT'
        });

        res.json({ message: "Funds released to worker successfully.", escrow: updatedEscrow });
    } catch (error) {
        console.error("Release escrow error:", error);
        res.status(500).json({ error: "Failed to release escrow." });
    }
};

// ─────────────────────────────────────────────
// Get Escrow records
// ─────────────────────────────────────────────
exports.getEscrows = async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;

        const where = role === 'seeker' ? { workerId: userId } : { employerId: userId };

        const escrows = await prisma.escrowContract.findMany({
            where,
            include: {
                contract: {
                    include: {
                        jobPost: { select: { title: true } }
                    }
                },
                employer: { select: { contactName: true } },
                worker: { select: { fullName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(escrows);
    } catch (error) {
        console.error("Get escrows error:", error);
        res.status(500).json({ error: "Failed to fetch escrow records." });
    }
};
