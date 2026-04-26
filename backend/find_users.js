const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const employers = await prisma.employer.findMany({
        take: 1,
        select: { email: true }
    });
    console.log('Sample Employer Email:', employers[0]?.email);

    const seekers = await prisma.jobSeeker.findMany({
        take: 1,
        select: { phone: true }
    });
    console.log('Sample Seeker Phone:', seekers[0]?.phone);
}

main();
