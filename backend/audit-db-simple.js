const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const jsCols = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'JobSeeker'`;
        console.log("JobSeeker Columns:", jsCols.map(c => c.column_name).join(', '));

        const empCols = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'Employer'`;
        console.log("Employer Columns:", empCols.map(c => c.column_name).join(', '));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
