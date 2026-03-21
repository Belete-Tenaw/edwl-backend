const prisma = require('./src/utils/prisma');
const paymentService = require('./src/services/paymentService');
const chapaService = require('./src/services/chapaService');

// Mock ChapaService to avoid real API calls since we don't have keys
const originalInitialize = chapaService.initialize;
const originalVerify = chapaService.verify;

async function testPaymentFlow() {
    console.log('--- Starting Payment Flow Test ---');
    
    // 1. Setup: Find or create a test user
    let user = await prisma.jobSeeker.findFirst({ where: { email: 'test_seeker@example.com' } });
    if (!user) {
        user = await prisma.jobSeeker.create({
            data: {
                fullName: 'Test Seeker',
                email: 'test_seeker@example.com',
                phone: '+251 900 000 000',
                password: 'hashedpassword',
                gender: 'MALE',
                age: 25,
                maritalStatus: 'SINGLE',
                experienceYears: 2,
                expectedSalary: 5000,
                preferredLocation: 'Addis Ababa',
                preferredArrangement: 'LIVE_OUT',
                profilePhoto: 'https://example.com/photo.jpg',
                tier: 'BRONZE'
            }
        });
        console.log('Created test user:', user.id);
    }

    // 2. Setup: Find a tier
    const tier = await prisma.subscriptionTier.findFirst({ where: { tier: 'GOLD' } });
    if (!tier) {
        console.error('No GOLD tier found. Run seeding first.');
        return;
    }
    console.log('Selected tier:', tier.id, tier.tier);

    // 3. Mock Chapa API Responses
    chapaService.initialize = async (data) => {
        console.log('MOCKED: chapaService.initialize called with', data.tx_ref);
        return { status: 'success', data: { checkout_url: 'https://mock.chapa.co/checkout/' + data.tx_ref } };
    };

    chapaService.verify = async (txRef) => {
        console.log('MOCKED: chapaService.verify called for', txRef);
        return { status: 'success', data: { status: 'success', amount: tier.priceETB } };
    };

    try {
        // 4. Initiate Payment
        console.log('\nStep 1: Initiating Payment...');
        const initResult = await paymentService.initiatePayment(user.id, 'seeker', tier.id, 'CHAPA');
        console.log('Initiate result:', initResult.status, 'Ref:', initResult.transactionReference);
        console.log('Redirect URL:', initResult.paymentUrl);

        if (!initResult.paymentUrl.includes(initResult.transactionReference)) {
            throw new Error('Payment URL does not contain transaction reference');
        }

        // 5. Complete Payment (Simulating Webhook/Callback)
        console.log('\nStep 2: Completing Payment (Simulating Webhook)...');
        const completeResult = await paymentService.completePayment(initResult.id);
        console.log('Complete result status:', completeResult.status);

        // 6. Verify Database State
        console.log('\nStep 3: Verifying Database State...');
        const updatedUser = await prisma.jobSeeker.findUnique({ where: { id: user.id } });
        console.log('User Tier:', updatedUser.tier);
        console.log('User isSubscribed:', updatedUser.isSubscribed);
        console.log('Subscription Expiry:', updatedUser.subscriptionExpiry);

        if (updatedUser.tier !== 'GOLD' || !updatedUser.isSubscribed) {
            throw new Error('Database state did not update correctly!');
        }

        console.log('\n✅ End-to-End Payment Flow Success!');
    } catch (err) {
        console.error('\n❌ Test Failed:', err.message);
    } finally {
        // Restore mocks
        chapaService.initialize = originalInitialize;
        chapaService.verify = originalVerify;
        process.exit();
    }
}

testPaymentFlow();
