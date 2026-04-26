const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const p = new PrismaClient();

async function main() {
    const newPassword = 'Test1234!';
    const hashed = await bcrypt.hash(newPassword, 10);

    // Reset employer password
    await p.employer.updateMany({
        where: { email: 'test@example.com' },
        data: { password: hashed }
    });
    console.log(`✅ Employer password reset to: ${newPassword}`);

    // Also reset/create a seeker with known credentials
    await p.jobSeeker.updateMany({
        where: { phone: '+251911999999' },
        data: { password: hashed }
    });
    console.log(`✅ Seeker password reset to: ${newPassword}`);
}

main()
    .catch(console.error)
    .finally(() => p.$disconnect());
