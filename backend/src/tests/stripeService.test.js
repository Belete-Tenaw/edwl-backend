/**
 * Stripe Service Unit Tests
 * Tests the cross-border payment initialization and verification logic.
 * All Stripe API calls are mocked to avoid real network calls.
 */

// Define shared mock functions at the top level so they persist across imports
const mockCreate = jest.fn();
const mockList = jest.fn();

// Mock the 'stripe' module BEFORE anything imports it.
// The module returns a constructor; we make that constructor always return
// an object with the mocked methods.
jest.mock('stripe', () => {
    return jest.fn().mockImplementation(() => ({
        checkout: {
            sessions: {
                create: mockCreate,
                list: mockList,
            },
        },
    }));
});

const stripeService = require('../services/stripeService');

describe('StripeService - initialize', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return a checkout URL on successful session creation', async () => {
        mockCreate.mockResolvedValue({
            url: 'https://checkout.stripe.com/session/abc123',
            id: 'cs_test_abc123',
        });

        const result = await stripeService.initialize({
            amount: '29.99',
            tx_ref: 'EDWL-XYZ123',
            email: 'employer@example.com',
            return_url: 'https://edwl.app/payment/success',
            customization: {
                title: 'EDWL Silver Subscription',
                description: 'Unlock Silver Tier access',
            },
        });

        expect(result.status).toBe('success');
        expect(result.data.checkout_url).toBe('https://checkout.stripe.com/session/abc123');
        expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: 'employer@example.com',
            client_reference_id: 'EDWL-XYZ123',
        }));
    });

    it('should convert amount to cents correctly', async () => {
        mockCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/test', id: 'cs_test' });

        await stripeService.initialize({
            amount: '15.50',
            tx_ref: 'EDWL-TEST1',
            email: 'test@example.com',
            return_url: 'https://edwl.app/',
            customization: { title: 'Test Plan', description: 'Test' },
        });

        expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
            line_items: expect.arrayContaining([
                expect.objectContaining({
                    price_data: expect.objectContaining({
                        unit_amount: 1550, // $15.50 -> 1550 cents
                        currency: 'usd',
                    }),
                }),
            ]),
        }));
    });

    it('should return an error object if Stripe API fails', async () => {
        mockCreate.mockRejectedValue(new Error('Invalid API key'));

        const result = await stripeService.initialize({
            amount: '29.99',
            tx_ref: 'EDWL-ERR',
            email: 'err@example.com',
            return_url: 'https://edwl.app/',
            customization: { title: 'Plan', description: 'Desc' },
        });

        expect(result.status).toBe('error');
        expect(result.message).toBe('Invalid API key');
    });
});

describe('StripeService - verify', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return success if a matching paid session is found', async () => {
        mockList.mockResolvedValue({
            data: [
                { id: 'cs_test_paid', client_reference_id: 'EDWL-XYZ456', payment_status: 'paid' },
                { id: 'cs_test_other', client_reference_id: 'EDWL-OTHER', payment_status: 'unpaid' },
            ],
        });

        const result = await stripeService.verify('EDWL-XYZ456');
        expect(result.status).toBe('success');
        expect(result.data.tx_ref).toBe('EDWL-XYZ456');
        expect(result.data.external_ref).toBe('cs_test_paid');
    });

    it('should return pending if session is not yet paid', async () => {
        mockList.mockResolvedValue({
            data: [
                { id: 'cs_test_pending', client_reference_id: 'EDWL-PEND', payment_status: 'unpaid' },
            ],
        });

        const result = await stripeService.verify('EDWL-PEND');
        expect(result.status).toBe('pending');
    });

    it('should return pending if transaction reference is not found in sessions', async () => {
        mockList.mockResolvedValue({ data: [] });
        const result = await stripeService.verify('EDWL-NOTFOUND');
        expect(result.status).toBe('pending');
    });

    it('should return error if Stripe API call throws', async () => {
        mockList.mockRejectedValue(new Error('Network error'));
        const result = await stripeService.verify('EDWL-ERR');
        expect(result.status).toBe('error');
    });
});
