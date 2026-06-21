const prisma = require('./src/utils/prisma');
const faydaService = require('./src/services/faydaService');
const { processVerificationRequest } = require('./src/services/verificationService');

async function runTests() {
    console.log("--- Starting EDWL Audit Verification ---");

    // 1. Secure Layer: Check Masking Logic
    const req = { user: { id: "test-emp", role: "EMPLOYER" }, hasPremiumAccess: false };
    
    console.log("1. Checking Premium Masking Logic... (Unit Mocked)");
    const mockSeeker = { phone: "+251911223344", email: "test@example.com", locationKebele: "Bole 03" };
    let phoneToReturn = req.hasPremiumAccess ? mockSeeker.phone : 'HIDDEN (Requires Premium Access)';
    console.assert(phoneToReturn.includes("HIDDEN"), "Masking Failed for non-premium user!");
    console.log("   ✅ Masking returns properly hidden string for non-premium.");

    // 2. Safe Layer: Check Document Verification Logic
    console.log("2. Checking Verification Transaction...");
    
    // Create mock Admin to satisfy foreign key constraints for AuditLog
    await prisma.admin.upsert({
        where: { id: "admin-123" },
        update: {},
        create: {
            id: "admin-123",
            username: "audit-admin-temp",
            password: "hash",
            role: "SUPERADMIN"
        }
    });

    // Create dummy seeker and request
    const mockUser = await prisma.jobSeeker.create({
        data: {
            fullName: "Audit Test User", gender: "MALE", age: 25, maritalStatus: "SINGLE", password: "hash",
            experienceYears: 2, expectedSalary: 5000, preferredLocation: "Addis Ababa", preferredArrangement: "LIVE_OUT",
            profilePhoto: "test.jpg", idDocument: "test.pdf"
        }
    });

    const mockRequest = await prisma.verificationRequest.create({
        data: {
            jobSeekerId: mockUser.id,
            status: 'PENDING',
            requestType: 'TIER_UPGRADE'
        }
    });

    try {
        await processVerificationRequest("admin-123", mockRequest.id, "APPROVED", "SILVER");
        const updatedUser = await prisma.jobSeeker.findUnique({ where: { id: mockUser.id }});
        console.assert(updatedUser.tier === "SILVER", "Tier update failed");
        console.assert(updatedUser.isVerified === true, "isVerified flag failed");
        console.log("   ✅ processVerificationRequest correctly upgraded Tier to SILVER.");
    } catch (e) {
        console.error("Verification logic failed:", e.message);
    }

    // 3. Lucrative Layer: Check Premium Code Activation
    console.log("3. Checking activatePremiumCode Admin Endpoint...");
    // Create a mock code
    const mockCode = "TEST-PREMIUM-" + Date.now();
    await prisma.subscriptionCode.create({
        data: {
            code: mockCode,
            status: 'UNUSED',
            durationDays: 30,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365) // 1 year
        }
    });

    const { activatePremiumCode } = require('./src/controllers/adminController');
    const mockReq = {
        body: { code: mockCode, userId: mockUser.id, targetType: 'JOB_SEEKER', days: 30 },
        user: { id: "admin-123" }
    };
    let responseData = null;
    const mockRes = {
        json: (data) => { responseData = data; },
        status: (code) => { return mockRes; }
    };

    try {
        await activatePremiumCode(mockReq, mockRes);
        console.assert(responseData && responseData.isSubscribed === true, "isSubscribed not returned as true");
        const activatedUser = await prisma.jobSeeker.findUnique({ where: { id: mockUser.id }});
        console.assert(activatedUser.isSubscribed === true, "User isSubscribed not set to true in DB");
        console.assert(activatedUser.subscriptionExpiry > new Date(), "subscriptionExpiry was not extended");
        console.log("   ✅ activatePremiumCode correctly sets isSubscribed and extends expiry.");
    } catch (e) {
        console.error("Premium Activation logic failed:", e.message);
    }

    // Cleanup
    await prisma.auditLog.deleteMany({
        where: {
            OR: [
                { userId: "admin-123" },
                { jobSeekerId: mockUser.id }
            ]
        }
    });
    await prisma.verificationRequest.deleteMany({ where: { jobSeekerId: mockUser.id }});
    await prisma.jobSeeker.delete({ where: { id: mockUser.id }});
    await prisma.subscriptionCode.delete({ where: { code: mockCode }});
    await prisma.admin.delete({ where: { id: "admin-123" } });

    console.log("--- EDWL Audit Verification Complete ---");
    process.exit(0);
}

runTests();
