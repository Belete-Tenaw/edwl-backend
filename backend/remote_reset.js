const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres.seqeximptkufzdeoprxr:EdwlBackend291965@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
        },
    },
});

async function resetRemoteAdmin() {
    try {
        console.log("Connecting to remote Supabase...");
        const adminUser = await prisma.admin.findUnique({
            where: { username: "EDWL2026" }
        });

        if (!adminUser) {
            console.log("Admin EDWL2026 not found in remote DB. Creating...");
            const hashedPassword = await bcrypt.hash("TdwBel291965", 10);
            await prisma.admin.create({
                data: {
                    username: "EDWL2026",
                    password: hashedPassword,
                    role: "SUPERADMIN",
                    permissions: ["ALL"]
                }
            });
            console.log("Created remote admin EDWL2026 with password TdwBel291965");
        } else {
            console.log("Found admin, updating password...");
            const hashedPassword = await bcrypt.hash("TdwBel291965", 10);
            await prisma.admin.update({
                where: { username: "EDWL2026" },
                data: { password: hashedPassword }
            });
            console.log("Updated remote admin EDWL2026 password to TdwBel291965");
        }
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

resetRemoteAdmin();
