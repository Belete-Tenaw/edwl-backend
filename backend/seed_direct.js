const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedDirect() {
    try {
        console.log('Creating subscription tiers...');

        // Create tiers directly without upsert
        const tier1 = await prisma.subscriptionTier.create({
            data: {
                name: 'Silver Monthly',
                tier: 'SILVER',
                period: 'MONTHLY',
                priceETB: 500.0,
                durationDays: 30,
                features: ['Basic visibility', 'Unlimited access during subscription']
            }
        });
        console.log('✅ Created:', tier1.name);

        const tier2 = await prisma.subscriptionTier.create({
            data: {
                name: 'Gold Quarterly',
                tier: 'GOLD',
                period: 'QUARTERLY',
                priceETB: 1200.0,
                durationDays: 90,
                features: ['Priority listing', 'Unlimited access', 'Verified badge']
            }
        });
        console.log('✅ Created:', tier2.name);

        console.log('✅ Seeding complete!');
    } catch (err) {
        console.error('❌ Error:', err.message);
        if (err.code) console.error('Code:', err.code);
    } finally {
        await prisma.$disconnect();
    }
}

seedDirect();
