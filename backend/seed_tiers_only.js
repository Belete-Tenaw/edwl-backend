const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://postgres.seqeximptkufzdeoprxr:EdwlBackend291965@aws-1-eu-west-1.pooler.supabase.com:5432/postgres'
        }
    }
});

const tiers = [
    {
        name: 'Silver Monthly',
        tier: 'SILVER',
        period: 'MONTHLY',
        priceETB: 500,
        durationDays: 30,
        features: ['Basic visibility', 'Unlimited access during subscription', '5 profiles per day view limit after expiry']
    },
    {
        name: 'Gold Quarterly',
        tier: 'GOLD',
        period: 'QUARTERLY',
        priceETB: 1200,
        durationDays: 90,
        features: ['Priority listing', 'Unlimited access', 'Verified badge eligibility']
    }
];

async function seed() {
    console.log('Seeding Tiers...');
    for (const t of tiers) {
        try {
            console.log(`Processing ${t.name}...`);
            const { name, ...data } = t;
            await prisma.subscriptionTier.upsert({
                where: { name: name },
                update: data,
                create: t
            });
            console.log(`✅ Success for ${t.name}`);
        } catch (err) {
            console.error(`❌ Error for ${t.name}:`, err.message);
            if (err.code) console.error('Code:', err.code);
        }
    }
    await prisma.$disconnect();
}

seed();
