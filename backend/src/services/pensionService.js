const prisma = require('../utils/prisma');
const notificationService = require('./notificationService');
const telegramService = require('./telegramService');

class PensionService {
    /**
     * Initialize a Micro-Pension account for a Job Seeker
     */
    async createPensionAccount(jobSeekerId) {
        // Check if account already exists
        const existing = await prisma.microPension.findUnique({
            where: { jobSeekerId }
        });

        if (existing) return existing;

        return await prisma.microPension.create({
            data: {
                jobSeekerId,
                balance: 0.0,
                currency: 'ETB'
            }
        });
    }

    /**
     * Add deposit contribution (e.g. 3% from escrow release or manual worker matching)
     */
    async depositToPension(jobSeekerId, amount, type = 'CONTRIBUTION', contractId = null) {
        if (amount <= 0) throw new Error('Deposit amount must be greater than zero');

        return await prisma.$transaction(async (tx) => {
            // 1. Ensure pension account exists
            let pension = await tx.microPension.findUnique({
                where: { jobSeekerId }
            });

            if (!pension) {
                pension = await tx.microPension.create({
                    data: { jobSeekerId, balance: 0.0, currency: 'ETB' }
                });
            }

            // 2. Update pension balance
            const updatedPension = await tx.microPension.update({
                where: { id: pension.id },
                data: {
                    balance: { increment: amount },
                    lastDeposit: new Date()
                }
            });

            // 3. Record individual transaction ledger entry
            const transaction = await tx.pensionTx.create({
                data: {
                    pensionId: pension.id,
                    amount,
                    type,
                    contractId
                }
            });

            // 4. Send interactive notification to worker
            const seeker = await tx.jobSeeker.findUnique({
                where: { id: jobSeekerId },
                select: { fullName: true }
            });

            await notificationService.notify(jobSeekerId, 'JOB_SEEKER', {
                title: 'Pension Savings Boosted! 📈',
                message: `Congratulations! ${amount} ETB has been added to your long-term EDWL Micro-Pension Account. Current balance: ${updatedPension.balance} ETB.`,
                type: 'SYSTEM'
            });

            // 5. Broadcast to admin Telegram channel
            await telegramService.notifyAdmin(
                `🛡️ <b>Pension Contribution Logged</b>\n\n` +
                `Worker: ${seeker.fullName}\n` +
                `Amount: ${amount} ETB (${type})\n` +
                `New Balance: ${updatedPension.balance} ETB`
            );

            return { pension: updatedPension, transaction };
        });
    }

    /**
     * Retrieve a seeker's pension details, including full ledger transaction history
     */
    async getPensionDetails(jobSeekerId) {
        const pension = await prisma.microPension.findUnique({
            where: { jobSeekerId },
            include: {
                transactions: {
                    orderBy: { timestamp: 'desc' }
                }
            }
        });

        if (!pension) {
            return {
                balance: 0.0,
                currency: 'ETB',
                transactions: []
            };
        }

        return pension;
    }

    /**
     * Process micro-pension withdrawal (secured under specific emergency rules)
     */
    async withdrawFromPension(jobSeekerId, amount, reason = 'EMERGENCY') {
        if (amount <= 0) throw new Error('Withdrawal amount must be greater than zero');

        return await prisma.$transaction(async (tx) => {
            const pension = await tx.microPension.findUnique({
                where: { jobSeekerId }
            });

            if (!pension || pension.balance < amount) {
                throw new Error('Insufficient micro-pension balance');
            }

            // 1. Update balance
            const updatedPension = await tx.microPension.update({
                where: { id: pension.id },
                data: {
                    balance: { decrement: amount }
                }
            });

            // 2. Log withdrawal transaction
            const transaction = await tx.pensionTx.create({
                data: {
                    pensionId: pension.id,
                    amount,
                    type: 'WITHDRAWAL'
                }
            });

            // 3. Notify seeker
            await notificationService.notify(jobSeekerId, 'JOB_SEEKER', {
                title: 'Pension Withdrawal! 🏦',
                message: `You successfully withdrew ${amount} ETB from your Micro-Pension for ${reason}. Remaining balance: ${updatedPension.balance} ETB.`,
                type: 'PAYMENT'
            });

            // 4. Log alert to Telegram admin
            await telegramService.notifyAdmin(
                `⚠️ <b>Pension Emergency Withdrawal</b>\n\n` +
                `Amount: ${amount} ETB\n` +
                `Reason: ${reason}\n` +
                `Remaining: ${updatedPension.balance} ETB`
            );

            return { pension: updatedPension, transaction };
        });
    }
}

module.exports = new PensionService();
