const prisma = require('../utils/prisma');
const crypto = require('crypto');
const paymentService = require('../services/paymentService');

/**
 * Generate a cryptographically secure random code with a prefix
 * Uses 3 bytes (6 hex characters) for high entropy and collision resistance
 */
const generateSecureCode = (prefix = 'PREM') => {
    const randomString = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `${prefix}-${randomString}`;
};

/**
 * Admin: Generate Premium Codes in Bulk
 * Supports targeting specific Tiers or Time Extensions
 */
exports.bulkGenerateCodes = async (req, res, next) => {
    try {
        const { codeType, tierUpgrade, durationDays, count = 1 } = req.body;

        if (!['TIME_EXTENSION', 'TRUST_UPGRADE'].includes(codeType)) {
            return res.status(400).json({ error: 'Invalid codeType. Must be TIME_EXTENSION or TRUST_UPGRADE.' });
        }

        const codes = [];
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1); // Valid for 1 year

        let prefix = 'PREM';
        if (codeType === 'TIME_EXTENSION') {
            if (!durationDays) return res.status(400).json({ error: 'durationDays is required.' });
            prefix = `PREM-${durationDays}D`;
        } else if (codeType === 'TRUST_UPGRADE') {
            if (!tierUpgrade) return res.status(400).json({ error: 'tierUpgrade is required.' });
            // Handle enum mapping (e.g., SILVER_ACCESS -> SILVER)
            prefix = tierUpgrade.split('_')[0];
        }

        // Use a Set to track generated codes in this batch to avoid local collisions
        const generatedStrings = new Set();
        
        while (generatedStrings.size < count) {
            generatedStrings.add(generateSecureCode(prefix));
        }

        const dataToInsert = Array.from(generatedStrings).map(codeStr => ({
            code: codeStr,
            codeType,
            durationDays: durationDays || 30,
            tierUpgrade,
            expiresAt: expiryDate,
            status: 'UNUSED'
        }));

        // Insert into database, skipping any global collisions
        const result = await prisma.subscriptionCode.createMany({
            data: dataToInsert,
            skipDuplicates: true
        });

        // Audit Log for bulk generation
        const { logAction } = require('../services/auditService');
        await logAction('ADMIN_BULK_CODES_GENERATED', req.user.id, 'ADMIN', { 
            count: result.count, 
            requested: count,
            tierUpgrade, 
            durationDays 
        });

        res.status(201).json({
            message: `Successfully generated ${result.count} unique codes.`,
            count: result.count
        });

    } catch (error) {
        console.error("Bulk Generate Code Error:", error);
        next(error);
    }
};

/**
 * Admin: Get All Premium Codes with advanced filtering
 */
exports.getAllCodes = async (req, res, next) => {
    try {
        const { status, code, page = 1, limit = 50 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (status && status !== 'ALL') where.status = status;
        if (code) where.code = { contains: code.toUpperCase() };

        const [total, codes] = await Promise.all([
            prisma.subscriptionCode.count({ where }),
            prisma.subscriptionCode.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit)
            })
        ]);

        res.json({
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            codes
        });

    } catch (error) {
        console.error("Get All Codes Error:", error);
        next(error);
    }
};

/**
 * Unified Redemption Route (supports both JobSeekers and Employers)
 * Delegates logic to paymentService for consistency
 */
exports.redeemCode = async (req, res, next) => {
    try {
        const { code } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role; // e.g., 'JOB_SEEKER' or 'EMPLOYER'
        const userType = userRole === 'JOB_SEEKER' ? 'seeker' : 'employer';

        if (!code) {
            return res.status(400).json({ error: 'Activation code is required.' });
        }

        // Delegate to unified payment service
        const updatedUser = await paymentService.activateWithCode(userId, userType, code.toUpperCase());

        res.status(200).json({
            message: `Successfully activated Premium Access!`,
            tier: updatedUser.tier,
            expiry: updatedUser.subscriptionExpiry
        });

    } catch (error) {
        console.error("Redeem Code Error:", error);
        res.status(400).json({ error: error.message });
    }
};

/**
 * Admin: Manually activate a code for a specific user
 */
exports.adminActivateCode = async (req, res, next) => {
    try {
        const { code, userId, targetType } = req.body;
        const userType = targetType === 'JOB_SEEKER' ? 'seeker' : 'employer';

        if (!code || !userId || !targetType) {
            return res.status(400).json({ error: 'code, userId, and targetType are required.' });
        }

        const updatedUser = await paymentService.activateWithCode(userId, userType, code.toUpperCase());

        res.status(200).json({
            message: `Successfully activated code for user ${userId}`,
            user: {
                id: updatedUser.id,
                tier: updatedUser.tier,
                expiry: updatedUser.subscriptionExpiry
            }
        });

    } catch (error) {
        console.error("Admin Activate Code Error:", error);
        res.status(400).json({ error: error.message });
    }
};
