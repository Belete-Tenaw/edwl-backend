const prisma = require('./src/utils/prisma');
const bcrypt = require('bcrypt');

/**
 * USAGE: node update_admin.js <current_username> <new_username> <new_password>
 */

async function main() {
    const currentUsername = process.argv[2];
    const newUsername = process.argv[3];
    const newPassword = process.argv[4];

    if (!currentUsername || !newUsername || !newPassword) {
        console.error('Error: Please provide current username, new username, and new password.');
        console.log('Usage: node update_admin.js <current_username> <new_username> <new_password>');
        process.exit(1);
    }

    try {
        // 1. Check if the current admin exists
        const existingAdmin = await prisma.admin.findUnique({
            where: { username: currentUsername }
        });

        if (!existingAdmin) {
            console.error(`Error: Admin user "${currentUsername}" not found.`);
            process.exit(1);
        }

        console.log(`Hashing new password...`);
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        console.log(`Updating admin account...`);
        await prisma.admin.update({
            where: { username: currentUsername },
            data: {
                username: newUsername,
                password: hashedPassword
            }
        });

        console.log('--------------------------------------------------');
        console.log('SUCCESS: Admin Credentials Updated!');
        console.log(`New Username: ${newUsername}`);
        console.log('--------------------------------------------------');
        console.log('You can now log in at the Admin Dashboard with these new credentials.');

    } catch (error) {
        // Handle unique constraint error if the new username is already taken
        if (error.code === 'P2002') {
            console.error(`Error: The username "${newUsername}" is already taken by another admin.`);
        } else {
            console.error('An unexpected error occurred:', error.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
