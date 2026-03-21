const paymentService = require('../services/paymentService');
const prisma = require('../utils/prisma');

class PaymentController {
    /**
     * Get available tiers
     */
    async getTiers(req, res) {
        try {
            const tiers = await paymentService.getTiers();
            res.json(tiers);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Initiate payment
     */
    async initiate(req, res) {
        try {
            const { tierId, provider } = req.body;
            const { id: userId, role } = req.user;
            const userType = role === 'JOB_SEEKER' ? 'seeker' : 'employer';

            const payment = await paymentService.initiatePayment(userId, userType, tierId, provider);
            res.status(201).json(payment);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Complete payment (Webhook or Manual callback)
     */
    async complete(req, res) {
        try {
            // Chapa sends 'tx_ref' in its payload. 
            // We can use it to find our internal paymentId if not provided directly.
            const { paymentId, externalRef, tx_ref, status } = req.body;
            
            let targetPaymentId = paymentId;
            
            if (!targetPaymentId && tx_ref) {
                const payment = await prisma.payment.findUnique({
                    where: { transactionReference: tx_ref }
                });
                if (payment) targetPaymentId = payment.id;
            }

            if (!targetPaymentId) {
                return res.status(400).json({ error: 'Missing payment identifier (paymentId or tx_ref)' });
            }

            // Verify status if coming from Chapa
            if (status && status !== 'success') {
                return res.status(400).json({ error: 'Payment status is not successful' });
            }

            const result = await paymentService.completePayment(targetPaymentId, externalRef || tx_ref);
            res.json({ message: 'Payment completed and subscription activated', result });
        } catch (error) {
            console.error('[PaymentController] Completion error:', error.message);
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Activate with code
     */
    async activateCode(req, res) {
        try {
            const { code } = req.body;
            const { id: userId, role } = req.user;
            const userType = role === 'JOB_SEEKER' ? 'seeker' : 'employer';

            await paymentService.activateWithCode(userId, userType, code);
            res.json({ message: 'Subscription activated successfully' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    /**
     * Verify a code without activating
     */
    async verifyCode(req, res) {
        try {
            const { code } = req.params;
            const result = await paymentService.validateCode(code);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new PaymentController();
