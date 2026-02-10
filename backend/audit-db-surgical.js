const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function checkTable(tableName, expectedFields) {
    const results = {
        tableName,
        ok: [],
        missing: [],
        unexpected: []
    };
    try {
        const columns = await prisma.$queryRawUnsafe(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = '${tableName}'
        `);
        const actualFields = columns.map(c => c.column_name);

        expectedFields.forEach(field => {
            if (actualFields.includes(field)) {
                results.ok.push(field);
            } else {
                results.missing.push(field);
            }
        });

        actualFields.forEach(field => {
            if (!expectedFields.includes(field)) {
                results.unexpected.push(field);
            }
        });
    } catch (e) {
        results.error = e.message;
    }
    return results;
}

async function main() {
    const jobSeekerFields = [
        'id', 'fullName', 'gender', 'age', 'religion', 'maritalStatus', 'phone', 'email', 'password', 'bio',
        'skills', 'languages', 'experienceYears', 'expectedSalary', 'preferredLocation', 'preferredArrangement',
        'profilePhoto', 'idDocument', 'nationalIdFayda', 'guarantorName', 'guarantorPhone', 'guarantorIdCard',
        'policeClearance', 'healthCertificate', 'badge', 'isVerified', 'verificationStatus', 'rating',
        'completedJobs', 'priorityWeight', 'locationRegion', 'locationZone', 'locationWoreda', 'locationKebele',
        'tier', 'subscriptionExpiry', 'createdAt', 'updatedAt'
    ];

    const employerFields = [
        'id', 'employerType', 'contactName', 'phone', 'email', 'password', 'address', 'familySize',
        'profilePhoto', 'idDocument', 'certificates', 'isVerified', 'verificationStatus', 'rating',
        'completedJobs', 'locationRegion', 'locationZone', 'locationWoreda', 'locationKebele',
        'tier', 'subscriptionExpiry', 'createdAt', 'updatedAt'
    ];

    const out = [];
    out.push(await checkTable('JobSeeker', jobSeekerFields));
    out.push(await checkTable('Employer', employerFields));

    fs.writeFileSync('audit-results.json', JSON.stringify(out, null, 2));
    console.log("Results written to audit-results.json");

    await prisma.$disconnect();
}

main();
