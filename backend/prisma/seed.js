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
            name: 'Silver',
            priceETB: 500,
            durationDays: 30,
            features: ['Basic visibility', '5 job applications/day']
        },
        {
            name: 'Gold',
            priceETB: 1200,
            durationDays: 90,
            features: ['Priority list', 'Unlimited job applications', 'Verified badge']
        },
        {
            name: 'Platinum',
            priceETB: 3000,
            durationDays: 365,
            features: ['All Gold features', 'Direct matching support', 'Legal contract review']
        }
    ];

    for (const tier of tiers) {
        await prisma.subscriptionTier.upsert({
            where: { name: tier.name },
            update: tier,
            create: tier,
        });
    }

    console.log('Seeding completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
