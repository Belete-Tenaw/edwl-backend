const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('📖 Reading smart_match.sql...');
        const sqlPath = path.join(__dirname, 'prisma', 'smart_match.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('🚀 Executing SQL on database...');
        await prisma.$executeRawUnsafe(sql);

        console.log('✅ Smart Matching function successfully registered!');
    } catch (error) {
        console.error('❌ Error applying SQL:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
