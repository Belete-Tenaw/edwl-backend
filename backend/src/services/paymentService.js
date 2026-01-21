const prisma = require('../utils/prisma');

class PaymentService {
    /**
     * Get all available subscription tiers
     */
    async getTiers() {
        return await prisma.subscriptionTier.findMany({
            orderBy: { priceETB: 'asc' }
        });
    }

    /**
     * Initialize a payment for a subscription
     * @param {string} userId - ID of the jobseeker or employer
     * @param {string} userType - 'seeker' or 'employer'
     * @param {string} tierId - ID of the subscription tier
     * @param {string} provider - Payment provider (TELEBIRR, CHAPA, etc.)
     */
    async initiatePayment(userId, userType, tierId, provider) {
        const tier = await prisma.subscriptionTier.findUnique({ where: { id: tierId } });
        if (!tier) throw new Error('Subscription tier not found');

        const payment = await prisma.payment.create({
            data: {
                amount: tier.priceETB,
                provider,
                transactionReference: `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                status: 'PENDING',
                tierId,
                [userType === 'seeker' ? 'jobSeekerId' : 'employerId']: userId
            }
        });

        return payment;
    }

    /**
     * Verify and complete a payment, then activate subscription
     * @param {string} paymentId 
     * @param {string} externalRef - External reference from provider
     */
    async completePayment(paymentId, externalRef) {
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: { jobSeeker: true, employer: true }
        });

        if (!payment) throw new Error('Payment not found');
        if (payment.status === 'COMPLETED') return payment;

        // In a real scenario, we would verify with Telebirr/Chapa API here

        return await prisma.$transaction(async (tx) => {
            // 1. Update Payment Status
            const updatedPayment = await tx.payment.update({
                where: { id: paymentId },
                data: {
                    status: 'COMPLETED',
                    transactionReference: externalRef || payment.transactionReference
                }
            });

            // 2. Find Tier
            const tier = await tx.subscriptionTier.findUnique({ where: { id: payment.tierId } });
            if (!tier) throw new Error('Tier not found for this payment');

            // 3. Create/Update Subscription
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + tier.durationDays);

            const subscription = await tx.subscription.create({
                data: {
                    [payment.jobSeekerId ? 'jobSeekerId' : 'employerId']: payment.jobSeekerId || payment.employerId,
                    tierId: tier.id,
                    endDate: expiryDate,
                    status: 'ACTIVE',
                    paymentId: paymentId
                }
            });

            // 4. Update User Tier
            if (payment.jobSeekerId) {
                await tx.jobSeeker.update({
                    where: { id: payment.jobSeekerId },
                    data: { tier: 'SUBSCRIBER', subscriptionExpiry: expiryDate }
                });
            } else {
                await tx.employer.update({
                    where: { id: payment.employerId },
                    data: { tier: 'SUBSCRIBER', subscriptionExpiry: expiryDate }
                });
            }

            // 5. Generate Invoice
            await tx.invoice.create({
                data: {
                    invoiceNumber: `INV-${Date.now()}`,
                    paymentId: paymentId
                }
            });

            return updatedPayment;
        });
    }

    /**
     * Activate a subscription using a code
     */
    async activateWithCode(userId, userType, code) {
        const subCode = await prisma.subscriptionCode.findUnique({
            where: { code }
        });

        if (!subCode || subCode.status !== 'UNUSED') {
            throw new Error('Invalid or used activation code');
        }

        if (subCode.expiresAt < new Date()) {
            throw new Error('Code has expired');
        }

        return await prisma.$transaction(async (tx) => {
            // Update code status
            await tx.subscriptionCode.update({
                where: { code },
                data: { status: 'USED', assignedTo: userId, userType }
            });

            // Update user tier and expiry
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + subCode.durationDays);

            if (userType === 'seeker') {
                return await tx.jobSeeker.update({
                    where: { id: userId },
                    data: { tier: 'SUBSCRIBER', subscriptionExpiry: expiryDate }
                });
            } else {
                return await tx.employer.update({
                    where: { id: userId },
                    data: { tier: 'SUBSCRIBER', subscriptionExpiry: expiryDate }
                });
            }
        });
    }
}

module.exports = new PaymentService();
