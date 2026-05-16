const prisma = require('../utils/prisma');
const notificationService = require('../services/notificationService');
const crypto = require('crypto');

/**
 * Request a Micro-Loan (Salary Advance)
 * Accessible by PLATINUM workers with active escrow contracts.
 */
exports.requestMicroLoan = async (req, res) => {
    try {
        const { amount } = req.body;
        const jobSeekerId = req.user.id; // From auth middleware

        // 1. Verify JobSeeker Eligibility
        const seeker = await prisma.jobSeeker.findUnique({
            where: { id: jobSeekerId },
            include: { escrowContracts: true }
        });

        if (!seeker) {
            return res.status(404).json({ error: 'Job seeker not found.' });
        }

        // Eligibility rules: Must be PLATINUM and have high behavior score
        if (seeker.tier !== 'PLATINUM' || seeker.behaviorScore < 80) {
            return res.status(403).json({ error: 'Not eligible. Platinum tier and 80+ Trust Score required.' });
        }

        // 2. Check for active escrow contracts to collateralize the loan
        const activeEscrows = seeker.escrowContracts.filter(e => e.status === 'FUNDED' || e.status === 'PENDING');
        const totalEscrowAmount = activeEscrows.reduce((sum, e) => sum + e.amount, 0);

        // Max loan is 50% of locked escrow
        if (amount > totalEscrowAmount * 0.5) {
            return res.status(400).json({ error: `Requested amount exceeds 50% of locked escrow (${totalEscrowAmount * 0.5} ETB max).` });
        }

        // 3. Create the Loan Record
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30); // 30 day term

        const loan = await prisma.microLoan.create({
            data: {
                jobSeekerId,
                amount,
                status: 'APPROVED', // Auto-approved for Platinum
                dueDate,
                escrowContractId: activeEscrows.length > 0 ? activeEscrows[0].id : null
            }
        });

        // 4. (Simulated) Transfer funds to worker via Telebirr/Chapa Payout API
        // In a real scenario, we'd hit the Chapa Transfer API here.

        res.status(201).json({
            message: 'Micro-loan approved and funds disbursed.',
            loan
        });

        // Notify Seeker
        await notificationService.notify(jobSeekerId, 'JOB_SEEKER', {
            title: 'Loan Approved! 💸',
            message: `Your request for ${amount} ETB has been approved and disbursed to your wallet.`,
            type: 'PAYMENT'
        });

    } catch (error) {
        console.error('Error in requestMicroLoan:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get Worker's Loans
 */
exports.getWorkerLoans = async (req, res) => {
    try {
        const loans = await prisma.microLoan.findMany({
            where: { jobSeekerId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(loans);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch loans' });
    }
};
