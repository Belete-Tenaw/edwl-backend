const prisma = require('../utils/prisma');
const notificationService = require('./notificationService');
const telegramService = require('./telegramService');

class EscrowService {
    /**
     * Create a new escrow record for a hire
     */
    async createEscrow(contractId, employerId, workerId, amount) {
        return await prisma.escrowContract.create({
            data: {
                contractId,
                employerId,
                workerId,
                amount,
                status: 'PENDING'
            }
        });
    }

    /**
     * Fund the escrow (triggered after payment success)
     */
    async fundEscrow(escrowId, providerRef, provider = 'CHAPA') {
        return await prisma.$transaction(async (tx) => {
            const escrow = await tx.escrowContract.update({
                where: { id: escrowId },
                data: {
                    status: 'FUNDED',
                    providerRef,
                    provider
                }
            });

            // Notify worker that their salary is secured
            await notificationService.notify(escrow.workerId, 'JOB_SEEKER', {
                title: 'Salary Secured! 💰',
                message: `The employer has funded the escrow for your contract. Your payment of ${escrow.amount} ETB is now guaranteed by EDWL.`,
                type: 'PAYMENT'
            });

            // Update contract status if applicable
            if (escrow.contractId) {
                await tx.contract.update({
                    where: { id: escrow.contractId },
                    data: { status: 'ACTIVE' }
                });
            }

            return escrow;
        });
    }

    /**
     * Release funds to worker
     */
    async releaseFunds(escrowId, releasedBy = 'EMPLOYER') {
        return await prisma.$transaction(async (tx) => {
            const escrow = await tx.escrowContract.findUnique({
                where: { id: escrowId },
                include: { worker: true, employer: true }
            });

            if (escrow.status !== 'FUNDED') {
                throw new Error('Only funded escrows can be released');
            }

            const updatedEscrow = await tx.escrowContract.update({
                where: { id: escrowId },
                data: {
                    status: 'RELEASED',
                    releaseDate: new Date()
                }
            });

            // Logic to actually transfer funds to worker's internal wallet would go here
            // For now, we log and notify
            await telegramService.notifyAdmin(`💸 <b>Escrow Released!</b>\n\nWorker: ${escrow.worker.fullName}\nAmount: ${escrow.amount} ETB\nReleased By: ${releasedBy}`);

            await notificationService.notify(escrow.workerId, 'JOB_SEEKER', {
                title: 'Funds Released! 🏦',
                message: `Your salary of ${escrow.amount} ETB has been released to your wallet.`,
                type: 'PAYMENT'
            });

            return updatedEscrow;
        });
    }

    /**
     * Dispute an escrow
     */
    async disputeEscrow(escrowId, reason) {
        return await prisma.escrowContract.update({
            where: { id: escrowId },
            data: { status: 'DISPUTED' }
        });
    }
}

module.exports = new EscrowService();
