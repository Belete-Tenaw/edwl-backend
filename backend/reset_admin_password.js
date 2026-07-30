const prisma = require('./src/utils/prisma');
const bcrypt = require('bcrypt');

/**
 * USAGE: node reset_admin_password.js <username> <newPassword>
 * Resets the password for an EXISTING admin account.
 */
async function main() {
    const username = process.argv[2];
    const newPassword = process.argv[3];

    if (!username || !newPassword) {
        console.error('Error: Please provide both a username and a new password.');
        console.log('Usage: node reset_admin_password.js <username> <newPassword>');
        process.exit(1);
    }

    console.log(`Checking if admin "${username}" exists...`);

    try {
        const existingAdmin = await prisma.admin.findUnique({
            where: { username }
        });

        if (!existingAdmin) {
            console.error(`Error: Admin user "${username}" does not exist.`);
            process.exit(1);
        }

        console.log(`Hashing new password for "${username}"...`);
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        console.log(`Updating admin password...`);
        const updatedAdmin = await prisma.admin.update({
            where: { username },
            data: { password: hashedPassword }
        });

        console.log('--------------------------------------------------');
        console.log('SUCCESS: Admin Password Reset!');
        console.log(`ID:       ${updatedAdmin.id}`);
        console.log(`Username: ${updatedAdmin.username}`);
        console.log(`Role:     ${updatedAdmin.role}`);
        console.log('--------------------------------------------------');
        console.log('You can now log in at /login with your new password.');

    } catch (error) {
        console.error('An unexpected error occurred:');
        console.error(error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();