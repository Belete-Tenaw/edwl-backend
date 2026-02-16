const { PrismaClient } = require('@prisma/client');

// Using your DIRECT_URL specifically for this fix script to avoid pooler issues
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres.seqeximptkufzdeoprxr:admin123@aws-1-eu-west-1.pooler.supabase.com:5432/postgres"
        },
    },
});

async function main() {
    console.log("Connecting directly to Supabase to fix 'undefined' paths...");

    try {
        const result = await prisma.jobSeeker.updateMany({
            where: {
                idDocument: "undefined"
            },
            data: {
                idDocument: "uploads/idDocument/idDocument-1770666881763-647212138.jpg"
            }
        });

        console.log(`✅ SUCCESS! Updated ${result.count} record(s).`);
    } catch (error) {
        console.error("❌ Database Error:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();