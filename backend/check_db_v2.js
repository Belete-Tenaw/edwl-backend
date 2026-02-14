const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkConnection() {
    console.log('Testing database connection...');
    try {
        const result = await prisma.$queryRaw`SELECT 1 as connected`;
        console.log('Successfully connected to the database:', result);
    } catch (error) {
        console.error('FAILED to connect to the database:');
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkConnection();
