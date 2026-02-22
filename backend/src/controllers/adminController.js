const prisma = require('../utils/prisma');
const crypto = require('crypto');
const { logAction } = require('../services/auditService');

exports.getAllUsers = async (req, res) => {
    try {
        const seekers = await prisma.jobSeeker.findMany({
            select: {
                id: true, fullName: true, phone: true, email: true,
                isVerified: true, verificationStatus: true, tier: true, badge: true, createdAt: true,
                profilePhoto: true, idDocument: true, isActive: true,
                nationalIdUrl: true, policeClearanceUrl: true, healthCertificateUrl: true,
                guarantorIdUrl: true, guarantorPhone: true
            }
        });
        const employers = await prisma.employer.findMany({
            select: {
                id: true, contactName: true, phone: true, email: true,
                isVerified: true, verificationStatus: true, tier: true, badge: true, createdAt: true,
                profilePhoto: true, idDocument: true, isActive: true
            }
        });
        res.json({ seekers, employers });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.verifyUser = async (req, res) => {
    try {
        const { id, type, status, notes, badge } = req.body; // status: APPROVED, REJECTED, PENDING; badge: SILVER, GOLD, PLATINUM

        let priorityWeight = 0;
        if (status === 'APPROVED' && type === 'seeker') {
            if (badge === 'PLATINUM') priorityWeight = 100;
            else if (badge === 'GOLD') priorityWeight = 50;
            else if (badge === 'SILVER') priorityWeight = 10;
        }

        let updated;
        if (type === 'seeker') {
            updated = await prisma.jobSeeker.update({
                where: { id },
                data: {
                    verificationStatus: status,
                    isVerified: status === 'APPROVED',
                    badge: status === 'APPROVED' ? (badge || 'STANDARD') : 'STANDARD',
                    priorityWeight
                }
            });
        } else {
            updated = await prisma.employer.update({
                where: { id },
                data: {
                    verificationStatus: status,
                    isVerified: status === 'APPROVED'
                }
            });
        }

        await logAction(
            'ADMIN_VERIFY_USER',
            req.user.id,
            'ADMIN',
            { targetUserId: id, targetUserType: type, status, notes, badge, priorityWeight }
        );

        res.json({ message: `User verification status updated to ${status}`, user: { id: updated.id, status: updated.verificationStatus, badge: updated.badge } });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateAccountStatus = async (req, res) => {
    try {
        const { id, type, action } = req.body; // action: SUSPEND, ACTIVATE

        // In this schema, we don't have a specific 'accountStatus' field yet, 
        // but we can use verificationStatus: REJECTED or a new field.
        // For now, let's just log and update verificationStatus as a placeholder or 
        // assume we might add an isActive field later.

        // Since we are strictly following the provided schema, let's use verificationStatus for now
        // or just log the action if we were to add a field.

        await logAction(
            'ADMIN_ACCOUNT_STATUS_CHANGE',
            req.user.id,
            'ADMIN',
            { targetUserId: id, targetUserType: type, action }
        );

        if (type === 'seeker') {
            await prisma.jobSeeker.update({
                where: { id },
                data: {
                    isActive: action === 'ACTIVATE'
                }
            });
        } else {
            await prisma.employer.update({
                where: { id },
                data: {
                    isActive: action === 'ACTIVATE'
                }
            });
        }

        res.json({ message: `User account ${action}ed` });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.generateCode = async (req, res) => {
    try {
        const { days } = req.body;
        const code = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 char code

        // expiry of the code itself
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Code expires in 7 days if not used

        const newCode = await prisma.subscriptionCode.create({
            data: {
                code,
                expiresAt,
                durationDays: days ? parseInt(days) : 30
            }
        });

        // Audit Log
        await logAction(
            'ADMIN_CODE_GENERATED',
            req.user.id,
            'ADMIN',
            { code: newCode.code, durationDays: newCode.durationDays }
        );

        res.status(201).json(newCode);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.activateSubscription = async (req, res) => {
    try {
        const { code, userId, userType, days } = req.body;

        const subCode = await prisma.subscriptionCode.findUnique({
            where: { code }
        });

        if (!subCode || subCode.status === 'USED' || subCode.expiresAt < new Date()) {
            return res.status(400).json({ error: 'Invalid or expired code' });
        }

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + parseInt(days));

        if (userType === 'JOB_SEEKER') {
            await prisma.jobSeeker.update({
                where: { id: userId },
                data: { tier: 'SILVER', subscriptionExpiry: expiryDate }
            });
        } else {
            await prisma.employer.update({
                where: { id: userId },
                data: { tier: 'SILVER_ACCESS', subscriptionExpiry: expiryDate }
            });
        }

        await prisma.subscriptionCode.update({
            where: { code },
            data: { status: 'USED', assignedTo: userId, userType }
        });

        // Audit Log
        await logAction(
            'ADMIN_MANUAL_ACTIVATE',
            req.user.id,
            'ADMIN',
            { targetUserId: userId, targetUserType: userType, code, days }
        );

        res.json({ message: 'Subscription activated successfully', expiryDate });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id, type } = req.params;

        // Only SUPERADMIN can delete users — MODERATORs can only suspend
        if (req.user.adminRole !== 'SUPERADMIN') {
            return res.status(403).json({ error: 'Only SUPERADMIN can delete users. Use Account Suspension instead.' });
        }

        if (type === 'seeker') {
            await prisma.jobSeeker.delete({ where: { id } });
        } else {
            await prisma.employer.delete({ where: { id } });
        }

        // Audit Log
        await logAction(
            'ADMIN_USER_DELETED',
            req.user.id,
            'ADMIN',
            { deletedUserId: id, deletedUserType: type }
        );

        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
