const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding subscription tiers and admin...');

    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.admin.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: hashedPassword,
            role: 'SUPERADMIN'
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
        },
        {
            name: 'Semi-Annual',
            tier: 'GOLD',
            period: 'SEMI_ANNUAL',
            priceETB: 2000,
            durationDays: 180,
            features: ['All Gold features', 'Extended 6-month access', 'Priority support']
        },
        {
            name: 'Platinum Annual',
            tier: 'PLATINUM',
            period: 'ANNUAL',
            priceETB: 3000,
            durationDays: 365,
            features: ['All features', 'Full year access', 'Direct matching support', 'Legal contract review']
        }
    ];

    for (const tierData of tiers) {
        console.log(`Upserting tier: ${tierData.name}`);
        const { name, ...otherData } = tierData;
        await prisma.subscriptionTier.upsert({
            where: { name: name },
            update: otherData,
            create: tierData,
        });
    }

    console.log('Seeding completed successfully.');
}

main()
    .catch((e) => {
        console.error('Seeding ERROR:', e);
        if (e.code) console.error('Error Code:', e.code);
        if (e.meta) console.error('Error Meta:', e.meta);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
