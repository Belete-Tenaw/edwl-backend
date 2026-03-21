const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testTeaserLogic() {
    console.log('--- Testing Teaser Logic (Mock) ---');

    // 1. Check for FREE tier employers with active jobs
    const freeEmployers = await prisma.employer.findMany({
        where: { tier: 'FREE', isActive: true },
        include: { jobPosts: true }
    });

    console.log(`Found ${freeEmployers.length} FREE tier active employers.`);

    for (const employer of freeEmployers) {
        console.log(`Checking Employer: ${employer.phone || employer.email} (Jobs: ${employer.jobPosts.length})`);
        for (const job of employer.jobPosts) {
            const matches = await prisma.$queryRawUnsafe(`SELECT * FROM match_seekers_for_job($1::uuid) LIMIT 3`, job.id);
            if (matches && matches.length > 0) {
                const topMatch = matches[0];
                console.log(`  - Job: ${job.title} | Top Match Score: ${topMatch.s_score}% | Tier: ${topMatch.s_tier}`);
                if (topMatch.s_score > 70 && topMatch.s_tier === 'PLATINUM') {
                    console.log(`  >>> TRIGGER: Teaser for HIGH-VALUE Match!`);
                }
            }
        }
    }

    // 2. Check for upcoming expiries
    const today = new Date();
    const threeDaysFromNowStart = new Date(today);
    threeDaysFromNowStart.setDate(today.getDate() + 3);
    threeDaysFromNowStart.setHours(0, 0, 0, 0);

    const threeDaysFromNowEnd = new Date(today);
    threeDaysFromNowEnd.setDate(today.getDate() + 3);
    threeDaysFromNowEnd.setHours(23, 59, 59, 999);

    const expiring = await prisma.employer.findMany({
        where: {
            subscriptionExpiry: {
                gte: threeDaysFromNowStart,
                lte: threeDaysFromNowEnd
            }
        }
    });

    console.log(`\nFound ${expiring.length} employers expiring in exactly 3 days.`);
    for (const emp of expiring) {
        console.log(`  - Expiring: ${emp.phone || emp.email} | Expiry: ${emp.subscriptionExpiry}`);
    }

    console.log('\n--- Test Completed ---');
    await prisma.$disconnect();
}

testTeaserLogic();
