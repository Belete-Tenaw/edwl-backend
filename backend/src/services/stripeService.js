const Stripe = require('stripe');

// Use a mock/sandbox key if not provided, allowing for easy testing
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_1234567890abcdef');

class StripeService {
    /**
     * Initializes a Stripe Checkout session for a subscription
     * @param {Object} data Payment initialization data
     * @returns {Object} Stripe Checkout session URL
     */
    async initialize(data) {
        try {
            // Mapping EDWL tiers to Stripe Price IDs (Usually set in ENV or DB)
            // For autonomous setup, we can create ad-hoc prices or use pre-configured ones.
            // Here, we use an ad-hoc price creation for maximum autonomy.
            
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd', // Stripe Connect usually maps local ETB to USD or handles local currencies if supported
                            product_data: {
                                name: data.customization.title,
                                description: data.customization.description,
                            },
                            unit_amount: Math.round(parseFloat(data.amount) * 100), // Convert to cents
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment', // Can be 'subscription' if we set up recurring
                success_url: data.return_url,
                cancel_url: data.return_url,
                client_reference_id: data.tx_ref,
                customer_email: data.email,
            });

            return {
                status: 'success',
                data: {
                    checkout_url: session.url
                }
            };
        } catch (error) {
            console.error('[Stripe Initialize Error]', error);
            return {
                status: 'error',
                message: error.message
            };
        }
    }

    /**
     * Verifies a payment with Stripe via the session or payment intent
     * @param {string} txRef - The EDWL transaction reference mapped to client_reference_id
     */
    async verify(txRef) {
        try {
            // Stripe doesn't directly query by client_reference_id easily without list iterations.
            // Ideally, webhook events update the DB. For polling fallback, we fetch the recent sessions:
            const sessions = await stripe.checkout.sessions.list({ limit: 10 });
            
            const session = sessions.data.find(s => s.client_reference_id === txRef);

            if (session && session.payment_status === 'paid') {
                return {
                    status: 'success',
                    data: {
                        tx_ref: txRef,
                        status: 'paid',
                        external_ref: session.id
                    }
                };
            }

            return { status: 'pending' };
        } catch (error) {
            console.error('[Stripe Verify Error]', error);
            return { status: 'error' };
        }
    }
}

module.exports = new StripeService();
