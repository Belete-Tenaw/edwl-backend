const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const migrationName = '20260412_add_performance_indices';
const migrationPath = path.join(__dirname, '..', 'prisma', 'migrations', migrationName, 'migration.sql');

async function main() {
    try {
        if (!fs.existsSync(migrationPath)) {
            throw new Error(`Migration file not found at ${migrationPath}`);
        }

        const content = fs.readFileSync(migrationPath, 'utf8');
        const hash = crypto.createHash('sha256').update(content).digest('hex');

        console.log(`New hash calculated for ${migrationName}: ${hash}`);

        // Update the database record
        const result = await prisma.$executeRawUnsafe(
            `UPDATE "_prisma_migrations" SET checksum = $1 WHERE migration_name = $2`,
            hash,
            migrationName
        );

        if (result === 1) {
            console.log(`Successfully updated checksum in _prisma_migrations for ${migrationName}`);
        } else {
            console.error(`Failed to update checksum. Migration name ${migrationName} might be incorrect or not found in DB.`);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
