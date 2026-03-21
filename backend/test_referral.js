const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const referralController = require('./src/controllers/referralController');

async function testReferralReward() {
    console.log('--- Testing Referral Reward Logic ---');

    // 1. Create a test seeker (or use existing)
    let seeker = await prisma.jobSeeker.findFirst({
        where: { tier: 'BRONZE' }
    });

    if (!seeker) {
        console.log('No BRONZE seeker found to test.');
        return;
    }

    console.log(`Testing with Seeker: ${seeker.fullName} (Initial Tier: ${seeker.tier})`);

    // 2. Simulate 3 referrals
    console.log('Simulating 3 referrals...');
    await referralController.processRewards(seeker.id, 'seeker', 3);

    // 3. Verify reward (GOLD upgrade for Bronze)
    let updatedSeeker = await prisma.jobSeeker.findUnique({ where: { id: seeker.id } });
    console.log(`Updated Tier: ${updatedSeeker.tier} (Expected: GOLD)`);
    console.log(`Subscription Expiry: ${updatedSeeker.subscriptionExpiry}`);

    // 4. Test "Featured" boost for GOLD/PLATINUM
    console.log('\nTesting Featured Boost for GOLD seeker...');
    await referralController.processRewards(seeker.id, 'seeker', 6);

    let featuredSeeker = await prisma.jobSeeker.findUnique({ where: { id: seeker.id } });
    console.log(`Is Featured: ${featuredSeeker.isFeatured} (Expected: true)`);
    console.log(`Featured Expiry: ${featuredSeeker.featuredExpiry}`);

    console.log('\n--- Test Completed ---');
    await prisma.$disconnect();
}

testReferralReward();
