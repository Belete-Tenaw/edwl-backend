const prisma = require('./src/utils/prisma');

async function testPremiumCodes() {
    try {
        console.log("Creating an Employer for testing...");
        const employer = await prisma.employer.create({
            data: {
                employerType: 'HOUSEHOLD',
                contactName: 'Test Employer for Codes',
                phone: '+251999999999',
                email: 'testcode@edwl.com',
                password: 'hashedpw',
                address: 'Bole',
                tier: 'FREE'
            }
        });
        console.log("Employer Tier:", employer.tier);

        console.log("\nGenerating a PLATINUM_ACCESS Trust Upgrade code...");
        // Simulating the controller logic
        const crypto = require('crypto');
        const randomString = crypto.randomBytes(3).toString('hex').toUpperCase();
        const code = `PLAT-${randomString}`;

        let expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        const newCode = await prisma.subscriptionCode.create({
            data: {
                code,
                codeType: 'TRUST_UPGRADE',
                tierUpgrade: 'PLATINUM_ACCESS',
                status: 'UNUSED',
                expiresAt: expiryDate
            }
        });
        console.log("Code generated:", newCode.code);

        console.log("\nSimulating Code Redemption...");

        // Simulating the transactional logic in codeController
        const updatedEmployer = await prisma.$transaction(async (tx) => {
            const premiumCode = await tx.subscriptionCode.findUnique({
                where: { code: newCode.code }
            });

            await tx.subscriptionCode.update({
                where: { id: premiumCode.id },
                data: { status: 'USED', assignedTo: employer.id, userType: 'EMPLOYER' }
            });

            return await tx.employer.update({
                where: { id: employer.id },
                data: { tier: premiumCode.tierUpgrade }
            });
        });

        console.log("Redemption Success!");
        console.log("New Employer Tier:", updatedEmployer.tier);

        // Cleanup
        await prisma.employer.delete({ where: { id: employer.id } });
        await prisma.subscriptionCode.delete({ where: { code: newCode.code } });
        console.log("Cleanup complete.");

    } catch (e) {
        console.error("Test failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

testPremiumCodes();
