const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function createAdmin() {
    const username = 'EDWL2026';
    const password = 'TdwBel291965'; // Changed to match the requested password
    const hashedPassword = await bcrypt.hash(password, 10);

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
        console.log(`Admin user created/updated: ${admin.username}`);
        console.log(`Password: ${password}`);
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
