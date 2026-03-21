const prisma = require('./src/utils/prisma');
const bcrypt = require('bcrypt');

async function main() {
    const adminEmail = process.argv[2] || 'EDWL2026';
    const adminPassword = process.argv[3] || 'TwaBel2026';

    console.log(`Creating admin user: ${adminEmail}`);

    const existingAdmin = await prisma.admin.findUnique({
        where: { username: adminEmail }
    });

    if (existingAdmin) {
        console.log('Admin user already exists.');
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
