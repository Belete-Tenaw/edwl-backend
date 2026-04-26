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
            const chapaService = require('../services/chapaService');
            const signature = req.headers['x-chapa-signature'];
            
            // 1. Signature Verification (Security First)
            if (signature && !chapaService.verifyWebhookSignature(signature, req.body)) {
                console.error('[PaymentController] Invalid signature detected');
                return res.status(401).json({ error: 'Invalid signature' });
            }

            // Chapa sends 'tx_ref' in its payload. 
            // We can use it to find our internal paymentId if not provided directly.
            const { paymentId, externalRef, tx_ref, status } = req.body;
            
            let targetPaymentId = paymentId;
            let transactionRef = tx_ref;
            
            // If it's a Chapa webhook, the structure might be different
            // Chapa usually sends: { tx_ref, status, amount, ... }
            if (!transactionRef && req.body.tx_ref) {
                transactionRef = req.body.tx_ref;
            }

            if (!targetPaymentId && transactionRef) {
                const payment = await prisma.payment.findUnique({
                    where: { transactionReference: transactionRef }
                });
                if (payment) targetPaymentId = payment.id;
            }

            if (!targetPaymentId) {
                console.warn('[PaymentController] Payment not found for ref:', transactionRef);
                return res.status(400).json({ error: 'Missing payment identifier (paymentId or tx_ref)' });
            }

            // Verify status if coming from Chapa
            // If it's a webhook, 'status' might be in req.body.status
            const currentStatus = status || req.body.status;
            if (currentStatus && currentStatus !== 'success') {
                console.warn('[PaymentController] Payment not successful:', currentStatus);
                return res.status(400).json({ error: 'Payment status is not successful' });
            }

            const result = await paymentService.completePayment(targetPaymentId, externalRef || transactionRef);
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

            const updatedUser = await paymentService.activateWithCode(userId, userType, code);
            res.json({ message: 'Subscription activated successfully', user: updatedUser });
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
