const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
    console.log('--- Verifying Subscription Tiers ---');
    try {
        const tiers = await prisma.subscriptionTier.findMany({
            orderBy: { priceETB: 'asc' }
        });
        
        console.log(`Found ${tiers.length} tiers:`);
        tiers.forEach(t => {
            console.log(`- ${t.name} (${t.tier}, ${t.period}): ${t.priceETB} ETB, ${t.durationDays} days`);
        });

        if (tiers.length === 4) {
            console.log('✅ Correct number of tiers found.');
        } else {
            console.error('❌ Unexpected number of tiers.');
        }

        const hasPeriod = tiers.every(t => t.period);
        if (hasPeriod) {
            console.log('✅ All tiers have a period field.');
        } else {
            console.error('❌ Some tiers are missing the period field.');
        }

    } catch (err) {
        console.error('❌ Verification failed:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
