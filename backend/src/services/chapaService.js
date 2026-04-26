const axios = require('axios');

class ChapaService {
    constructor() {
        this.secretKey = process.env.CHAPA_SECRET_KEY;
        this.baseUrl = 'https://api.chapa.co/v1';
    }

    /**
     * Initialize Chapa transaction
     */
    async initialize(paymentData) {
        if (!this.secretKey) {
            console.warn('[ChapaService] Secret Key not configured. Using mock URL.');
            return {
                status: 'success',
                message: 'Hosted checkout created',
                data: {
                    checkout_url: `https://test.chapa.co/checkout/test-payment-${paymentData.tx_ref}`
                }
            };
        }

        try {
            const response = await axios.post(`${this.baseUrl}/transaction/initialize`, paymentData, {
                headers: {
                    Authorization: `Bearer ${this.secretKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('[ChapaService] Initialization error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Chapa initialization failed');
        }
    }

    /**
     * Verify Chapa transaction
     */
    async verify(txRef) {
        if (!this.secretKey) {
            console.warn('[ChapaService] Secret Key not configured. Mocking verification as success.');
            return { status: 'success' };
        }

        try {
            const response = await axios.get(`${this.baseUrl}/transaction/verify/${txRef}`, {
                headers: {
                    Authorization: `Bearer ${this.secretKey}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('[ChapaService] Verification error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Chapa verification failed');
        }
    }

    /**
     * Verify Chapa webhook signature
     * @param {string} signature - The x-chapa-signature header
     * @param {object} body - The raw request body
     */
    verifyWebhookSignature(signature, body) {
        if (!this.secretKey) return true; // Mock mode
        
        const crypto = require('crypto');
        const hash = crypto.createHmac('sha256', this.secretKey)
            .update(JSON.stringify(body))
            .digest('hex');
            
        return hash === signature;
    }
}

module.exports = new ChapaService();
