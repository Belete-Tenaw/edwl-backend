const prisma = require('./src/utils/prisma');
const bcrypt = require('bcrypt');

/**
 * USAGE: node create_secure_admin.js <username> <password>
 */

async function main() {
    const username = process.argv[2];
    const password = process.argv[3];

    if (!username || !password) {
        console.error('Error: Please provide both a username and a password.');
        console.log('Usage: node create_secure_admin.js <username> <password>');
        process.exit(1);
    }

    console.log(`Checking if admin "${username}" exists...`);

    try {
        const existingAdmin = await prisma.admin.findUnique({
            where: { username }
        });

        if (existingAdmin) {
            console.error(`Error: Admin user "${username}" already exists.`);
            process.exit(1);
        }

        console.log(`Hashing password for "${username}"...`);
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log(`Creating admin account...`);
        const newAdmin = await prisma.admin.create({
            data: {
                username,
                password: hashedPassword,
                role: 'SUPERADMIN' // Default to SUPERADMIN role
            }
        });

        console.log('--------------------------------------------------');
        console.log('SUCCESS: Secure Admin Account Created!');
        console.log(`ID:       ${newAdmin.id}`);
        console.log(`Username: ${newAdmin.username}`);
        console.log('--------------------------------------------------');
        console.log('You can now log in at /login with these credentials.');

    } catch (error) {
        console.error('An unexpected error occurred:');
        console.error(error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
