/**
 * SECURE ADMIN CREATOR
 * Usage: node create_admin.js <username> <password>
 * NEVER hardcode passwords here. Always pass them as CLI arguments.
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function createAdmin() {
    const username = process.argv[2];
    const password = process.argv[3];

    if (!username || !password) {
        console.error('\u274C Error: Username and password are required.');
        console.log('Usage: node create_admin.js <username> <password>');
        console.log('Example: node create_admin.js myAdminUser MySecurePass123!');
        process.exit(1);
    }

    if (password.length < 10) {
        console.error('\u274C Error: Password must be at least 10 characters long.');
        process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 12); // 12 rounds for admin

    try {
        const admin = await prisma.admin.upsert({
            where: { username },
            update: { password: hashedPassword },
            create: {
                username,
                password: hashedPassword,
                role: 'SUPERADMIN'
            }
        });
        console.log('--------------------------------------------------');
        console.log(`\u2705 Admin user created/updated: ${admin.username}`);
        console.log('\u26A0\uFE0F  Do NOT log or store the plaintext password anywhere.');
        console.log('--------------------------------------------------');
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
