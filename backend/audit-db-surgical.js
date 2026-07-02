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
    // ── JobSeeker ────────────────────────────────────────────────────────────
    // Derived from schema.prisma model JobSeeker (scalar fields only)
    const jobSeekerFields = [
        'id', 'fullName', 'badges', 'gender', 'age', 'religion', 'maritalStatus',
        'phone', 'email', 'password', 'bio', 'skills', 'languages',
        'occupationCategory', 'customOccupation',
        'experienceYears', 'expectedSalary', 'preferredLocation', 'preferredArrangement',
        'profilePhoto', 'certificates', 'idDocument',
        'isVerified', 'verificationStatus', 'rating', 'completedJobs',
        'locationRegion', 'locationZone', 'locationWoreda', 'locationKebele',
        'subscriptionExpiry', 'createdAt', 'updatedAt',
        'badge', 'faydaId', 'featuredExpiry',
        'guarantorIdUrl', 'guarantorPhone', 'healthCertificateUrl',
        'isActive', 'isFaydaVerified', 'isFeatured',
        'nationalIdUrl', 'passwordHint', 'policeClearanceUrl',
        'priorityWeight', 'referralCode', 'referralCount', 'rewardPoints',
        'referredById', 'referredByType',
        'securityAnswer', 'securityQuestion', 'telegramChatId',
        'videoBio', 'videoTranscription', 'voiceBioUrl', 'voiceBioTranscription',
        'interviewAnswers', 'availability',
        'tier', 'premiumCode', 'isSubscribed',
        'resetPasswordExpires', 'resetPasswordToken',
        'liveSelfieUrl', 'behaviorScore', 'responseTimeMs',
        'agencyId', 'isHealthClinicallyVerified', 'isPoliceApiVerified', 'lastVoiceCallAt'
    ];

    // ── Employer ─────────────────────────────────────────────────────────────
    // Derived from schema.prisma model Employer (scalar fields only)
    const employerFields = [
        'id', 'employerType', 'contactName', 'phone', 'email', 'password',
        'address', 'familySize', 'profilePhoto', 'idDocument', 'certificates',
        'isVerified', 'verificationStatus', 'rating', 'completedJobs',
        'locationRegion', 'locationZone', 'locationWoreda', 'locationKebele',
        'subscriptionExpiry', 'createdAt', 'updatedAt',
        'badge', 'faydaId', 'isActive', 'isFaydaVerified',
        'passwordHint', 'referralCode', 'referralCount', 'rewardPoints',
        'referredById', 'referredByType',
        'securityAnswer', 'securityQuestion', 'telegramChatId',
        'tier', 'premiumCode', 'isSubscribed',
        'resetPasswordExpires', 'resetPasswordToken',
        'liveSelfieUrl', 'behaviorScore', 'responseTimeMs'
    ];

    // ── AuditLog ─────────────────────────────────────────────────────────────
    const auditLogFields = [
        'id', 'action', 'userId', 'userType', 'details', 'ipAddress',
        'createdAt', 'employerId', 'jobSeekerId'
    ];

    // ── VerificationRequest ───────────────────────────────────────────────────
    const verificationRequestFields = [
        'id', 'jobSeekerId', 'employerId', 'requestType', 'status',
        'adminNotes', 'submittedAt', 'reviewedAt'
    ];

    // ── SubscriptionCode ──────────────────────────────────────────────────────
    const subscriptionCodeFields = [
        'id', 'code', 'status', 'assignedTo', 'userType',
        'durationDays', 'createdAt', 'expiresAt', 'codeType', 'tierUpgrade'
    ];

    // ── Contract ──────────────────────────────────────────────────────────────
    const contractFields = [
        'id', 'employerId', 'jobSeekerId', 'jobPostId', 'status',
        'startDate', 'endDate', 'salary', 'insuranceFee',
        'employerSigned', 'workerSigned', 'jobType', 'termsConditions',
        'signedAt', 'createdAt'
    ];

    // ── EscrowContract ────────────────────────────────────────────────────────
    const escrowContractFields = [
        'id', 'contractId', 'employerId', 'workerId', 'jobId',
        'amount', 'status', 'providerRef', 'provider', 'telebirrRef',
        'employerConfirmed', 'workerConfirmed', 'transactionHash',
        'releaseDate', 'createdAt', 'updatedAt'
    ];

    const out = [];
    out.push(await checkTable('JobSeeker',          jobSeekerFields));
    out.push(await checkTable('Employer',            employerFields));
    out.push(await checkTable('AuditLog',            auditLogFields));
    out.push(await checkTable('VerificationRequest', verificationRequestFields));
    out.push(await checkTable('SubscriptionCode',    subscriptionCodeFields));
    out.push(await checkTable('Contract',            contractFields));
    out.push(await checkTable('EscrowContract',      escrowContractFields));

    fs.writeFileSync('audit-results.json', JSON.stringify(out, null, 2));
    console.log('Results written to audit-results.json');

    // Print a human-readable summary to stdout
    let allClean = true;
    for (const r of out) {
        const hasMissing = r.missing && r.missing.length > 0;
        const hasUnexpected = r.unexpected && r.unexpected.length > 0;
        if (hasMissing || hasUnexpected) {
            allClean = false;
            console.log(`\n⚠️  Table: ${r.tableName}`);
            if (hasMissing)    console.log(`   MISSING (in schema, not in DB):    ${r.missing.join(', ')}`);
            if (hasUnexpected) console.log(`   UNEXPECTED (in DB, not in schema): ${r.unexpected.join(', ')}`);
        } else {
            console.log(`✅ Table: ${r.tableName} — fully in sync`);
        }
    }
    if (allClean) console.log('\n🎉 All audited tables are fully in sync with the schema.');

    await prisma.$disconnect();
}

main();
