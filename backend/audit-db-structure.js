const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Listing columns for JobSeeker...");
        const columns = await prisma.$queryRaw`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'JobSeeker'
            ORDER BY column_name;
        `;
        console.table(columns);

        console.log("\nListing columns for Employer...");
        const empColumns = await prisma.$queryRaw`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'Employer'
            ORDER BY column_name;
        `;
        console.table(empColumns);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
