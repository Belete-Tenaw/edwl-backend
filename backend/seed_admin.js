const prisma = require('./src/utils/prisma');
const bcrypt = require('bcrypt');

async function main() {
    const adminEmail = process.argv[2];
    const adminPassword = process.argv[3];

    if (!adminEmail || !adminPassword) {
        console.error('\u274C Error: Username and password are required.');
        console.log('Usage: node seed_admin.js <username> <password>');
        process.exit(1);
    }

    if (adminPassword.length < 10) {
        console.error('\u274C Error: Password must be at least 10 characters.');
        process.exit(1);
    }

    console.log(`Creating admin user: ${adminEmail}`);

    const existingAdmin = await prisma.admin.findUnique({
        where: { username: adminEmail }
    });

    if (existingAdmin) {
        if (process.argv[3]) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await prisma.admin.update({
                where: { username: adminEmail },
                data: { password: hashedPassword }
            });
            console.log(`Admin user password updated successfully for: ${adminEmail}`);
        } else {
            console.log('Admin user already exists. To update the password, run: node seed_admin.js <username> <new_password>');
        }
        return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.admin.create({
        data: {
            username: adminEmail,
            password: hashedPassword,
            role: 'SUPERADMIN'
        }
    });

    console.log(`Admin user created with ID: ${admin.id}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
