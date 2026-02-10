const prisma = require('../utils/prisma');
const { logAction } = require('./auditService');

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
     * Get simulated payment URL for providers
     */
    getPaymentURL(provider, amount, transactionReference) {
        if (provider === 'TELEBIRR') {
            // Simulate Telebirr H5/Web-pay URL
            return `https://telebirr.et/pay?appId=edwl_app&amount=${amount}&ref=${transactionReference}&callback=https://edwl.et/api/payments/complete`;
        }
        if (provider === 'CBE') {
            // Simulate CBE Birr USSD/Link
            return `https://cbebirr.et/ussd/pay?shortcode=123456&amount=${amount}&ref=${transactionReference}`;
        }
        return `https://edwl.et/manual-payment?ref=${transactionReference}`;
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

        const transactionReference = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const payment = await prisma.payment.create({
            data: {
                amount: tier.priceETB,
                provider,
                transactionReference,
                status: 'PENDING',
                tierId,
                [userType === 'seeker' ? 'jobSeekerId' : 'employerId']: userId
            }
        });

        // Add payment URL to the response for mobile/web redirects
        return {
            ...payment,
            paymentUrl: this.getPaymentURL(provider, tier.priceETB, transactionReference)
        };
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

            // 4. Update User Tier (SILVER, GOLD, or PLATINUM)
            if (payment.jobSeekerId) {
                await tx.jobSeeker.update({
                    where: { id: payment.jobSeekerId },
                    data: { tier: tier.tier, subscriptionExpiry: expiryDate }
                });
            } else {
                await tx.employer.update({
                    where: { id: payment.employerId },
                    data: { tier: tier.tier, subscriptionExpiry: expiryDate }
                });
            }

            // 5. Generate Invoice
            await tx.invoice.create({
                data: {
                    invoiceNumber: `INV-${Date.now()}`,
                    paymentId: paymentId
                }
            });

            // 6. Audit Log
            await logAction(
                'PAYMENT_COMPLETED',
                payment.jobSeekerId || payment.employerId,
                payment.jobSeekerId ? 'JOB_SEEKER' : 'EMPLOYER',
                { paymentId, tierId: tier.id, provider: payment.provider }
            );

            return updatedPayment;
        });
    }

    /**
     * Activate a subscription using a code
     */
    async activateWithCode(userId, userType, code) {
        return await prisma.$transaction(async (tx) => {
            const subCode = await tx.subscriptionCode.findUnique({
                where: { code }
            });

            if (!subCode || subCode.status !== 'UNUSED') {
                throw new Error('Invalid or used activation code');
            }

            if (subCode.expiresAt < new Date()) {
                throw new Error('Code has expired');
            }
            // Update code status
            await tx.subscriptionCode.update({
                where: { code },
                data: { status: 'USED', assignedTo: userId, userType }
            });

            // Update user tier and expiry
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + subCode.durationDays);

            let updatedUser;
            if (userType === 'seeker') {
                updatedUser = await tx.jobSeeker.update({
                    where: { id: userId },
                    data: { tier: 'SILVER', subscriptionExpiry: expiryDate }
                });
            } else {
                updatedUser = await tx.employer.update({
                    where: { id: userId },
                    data: { tier: 'SILVER', subscriptionExpiry: expiryDate }
                });
            }

            // Audit Log
            await logAction(
                'SUBSCRIPTION_CODE_REDEEMED',
                userId,
                userType === 'seeker' ? 'JOB_SEEKER' : 'EMPLOYER',
                { code, durationDays: subCode.durationDays }
            );

            return updatedUser;
        });
    }
}

module.exports = new PaymentService();
