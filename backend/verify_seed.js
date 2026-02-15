const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://postgres.seqeximptkufzdeoprxr:EdwlBackend291965@aws-1-eu-west-1.pooler.supabase.com:5432/postgres'
        }
    }
});

async function checkData() {
    try {
        const tierCount = await prisma.subscriptionTier.count();
        const adminCount = await prisma.admin.count();
        console.log(`Verification:`);
        console.log(` - Subscription Tiers: ${tierCount}`);
        console.log(` - Admin Accounts: ${adminCount}`);

        if (tierCount > 0) {
            const firstTier = await prisma.subscriptionTier.findFirst();
            console.log(` - Sample Tier Name: ${firstTier.name}`);
        }
    } catch (err) {
        console.error('Check failed:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
