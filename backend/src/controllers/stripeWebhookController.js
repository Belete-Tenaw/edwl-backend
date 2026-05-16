/**
 * Stripe Webhook Handler (GAP 1 Fix)
 * Handles real-time payment events from Stripe.
 * This endpoint is called by Stripe directly when payment succeeds/fails —
 * it is NOT called by the frontend. This is the only reliable way to confirm payments.
 *
 * Stripe event flow:
 * 1. Employer clicks "Pay with Stripe" → frontend opens Stripe Checkout
 * 2. Employer pays → Stripe calls POST /api/payments/stripe/webhook
 * 3. This handler verifies the signature, then activates the subscription
 */
const Stripe = require('stripe');
const prisma = require('../utils/prisma');
const paymentService = require('../services/paymentService');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * POST /api/payments/stripe/webhook
 * NOTE: This route must use raw body — do NOT use express.json() on it.
 * It is registered with express.raw({ type: 'application/json' }) in the route file.
 */
exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        if (webhookSecret) {
            // In production: verify the webhook signature to prevent spoofing
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } else {
            // In development/test: parse the body directly (no signature check)
            event = JSON.parse(req.body.toString());
            console.warn('[StripeWebhook] ⚠️ STRIPE_WEBHOOK_SECRET not set — skipping signature verification. Do NOT use this in production.');
        }
    } catch (err) {
        console.error('[StripeWebhook] Signature verification failed:', err.message);
        return res.status(400).json({ error: `Webhook signature error: ${err.message}` });
    }

    console.log(`[StripeWebhook] Event received: ${event.type}`);

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;

                // The tx_ref we set as client_reference_id when creating the session
                const txRef = session.client_reference_id;

                if (!txRef) {
                    console.warn('[StripeWebhook] No client_reference_id on session. Skipping.');
                    break;
                }

                if (session.payment_status === 'paid') {
                    console.log(`[StripeWebhook] Payment confirmed for txRef: ${txRef}`);

                    // Find the pending payment in our DB
                    const payment = await prisma.payment.findUnique({
                        where: { transactionReference: txRef }
                    });

                    if (!payment) {
                        console.warn(`[StripeWebhook] No payment record found for txRef: ${txRef}`);
                        break;
                    }

                    if (payment.status === 'COMPLETED') {
                        console.log(`[StripeWebhook] Payment ${txRef} already completed. Idempotent skip.`);
                        break;
                    }

                    // Mark payment completed and activate subscription
                    await prisma.payment.update({
                        where: { id: payment.id },
                        data: { status: 'COMPLETED' }
                    });

                    // Trigger the full subscription activation flow
                    await paymentService.activateSubscription(payment.id);

                    console.log(`[StripeWebhook] ✅ Subscription activated for payment: ${payment.id}`);
                }
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object;
                console.warn(`[StripeWebhook] Payment failed: ${paymentIntent.id}`);
                // Optionally mark the payment as FAILED in DB
                // The tx_ref isn't available here directly from payment_intent,
                // but can be retrieved via metadata if set during session creation
                break;
            }

            case 'customer.subscription.deleted': {
                // For recurring subscriptions — mark subscription as CANCELLED
                console.log('[StripeWebhook] Subscription cancelled by Stripe.');
                break;
            }

            default:
                // Unhandled events are OK — Stripe sends many types
                console.log(`[StripeWebhook] Unhandled event type: ${event.type}`);
        }
    } catch (err) {
        console.error('[StripeWebhook] Error processing event:', err);
        // Return 200 to prevent Stripe from retrying — we log internally
        // (Stripe retries on 5xx, which could cause double-activation)
    }

    // Always respond 200 to Stripe quickly
    res.status(200).json({ received: true });
};
