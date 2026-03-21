const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
    try {
        const admins = await prisma.admin.findMany();
        console.log('--- Current Admins ---');
        if (admins.length === 0) {
            console.log('No admin users found in the database.');
        } else {
            admins.forEach(admin => {
                console.log(`Username: ${admin.username}, Role: ${admin.role}`);
            });
        }
    } catch (error) {
        console.error('Error checking admins:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAdmin();
