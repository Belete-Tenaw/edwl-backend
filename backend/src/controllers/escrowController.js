const prisma = require('../utils/prisma');
const chapaService = require('../services/chapaService');
const stripeService = require('../services/stripeService');

// Initiate Escrow (Employer deposits funds)
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

        // Create Escrow Record (Status PENDING until verified)
        const escrow = await prisma.escrowContract.create({
            data: {
                contractId,
                employerId,
                workerId: contract.jobSeekerId,
                jobId: contract.jobPostId,
                amount: parseFloat(amount),
                status: 'PENDING',
                provider,
                providerRef
            }
        });

        const checkoutData = {
            amount: amount.toString(),
            currency: currency,
            email: contract.employer.email || 'employer@edwl.et',
            first_name: (contract.employer.contactName || 'Employer').split(' ')[0],
            last_name: (contract.employer.contactName || 'Employer').split(' ')[1] || 'User',
            tx_ref: providerRef,
            callback_url: `${process.env.BASE_URL}/api/escrow/webhook`,
            return_url: `${process.env.FRONTEND_URL || 'https://edwl.et'}/escrow-success?ref=${providerRef}`,
            customization: {
                title: `EDWL Escrow Payment`,
                description: `Escrow for Contract ${contractId}`
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

// Verify Escrow Payment
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

        const updatedEscrow = await prisma.escrowContract.update({
            where: { id: escrow.id },
            data: { status: 'FUNDED' }
        });

        await prisma.contract.update({
            where: { id: escrow.contractId },
            data: { status: 'ACTIVE' }
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

// Release Escrow (Employer releases funds to Seeker)
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

// Get Escrow records
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
