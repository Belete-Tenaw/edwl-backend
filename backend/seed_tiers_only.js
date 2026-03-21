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
        features: ['Basic visibility', '5 job applications', 'Standard messaging', 'Community support']
    },
    {
        name: 'Gold Quarterly',
        tier: 'GOLD',
        period: 'QUARTERLY',
        priceETB: 1200,
        durationDays: 90,
        features: ['Priority ranking', 'Unlimited applications', 'Verified badge eligibility', 'Phone access', 'Premium support']
    },
    {
        name: 'Premium Semi-Annual',
        tier: 'GOLD', // Map to GOLD for now or PLATINUM if needed
        period: 'SEMI_ANNUAL',
        priceETB: 2000,
        durationDays: 180,
        features: ['All Gold features', 'Extended 6 months', 'Premium support', 'Verified badge', 'Unlimited views']
    },
    {
        name: 'Platinum Annual',
        tier: 'PLATINUM',
        period: 'ANNUAL',
        priceETB: 3000,
        durationDays: 365,
        features: ['All Gold features', 'Direct matching', 'Legal assistance', 'Background check', 'Dedicated manager']
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
