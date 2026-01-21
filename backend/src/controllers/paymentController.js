const paymentService = require('../services/paymentService');

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
            const { paymentId, externalRef } = req.body;
            const result = await paymentService.completePayment(paymentId, externalRef);
            res.json({ message: 'Payment completed and subscription activated', result });
        } catch (error) {
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
}

module.exports = new PaymentController();
