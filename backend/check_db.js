const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const userCount = await prisma.user.count();
        const adminCount = await prisma.admin.count();
        console.log(`Database connected successfully.`);
        console.log(`Users: ${userCount}, Admins: ${adminCount}`);
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
