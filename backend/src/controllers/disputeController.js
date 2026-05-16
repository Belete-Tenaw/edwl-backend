const prisma = require('../utils/prisma');
const notificationService = require('../services/notificationService');

/**
 * Report a new Dispute
 */
exports.createDispute = async (req, res) => {
    try {
        const { contractId, reason, description } = req.body;
        const reporterId = req.user.userId;
        const reporterRole = req.user.role;

        // 1. Verify Contract exists and user is part of it
        const contract = await prisma.contract.findUnique({
            where: { id: contractId },
            include: { employer: true, jobSeeker: true }
        });

        if (!contract) {
            return res.status(404).json({ error: 'Contract not found' });
        }

        const isAuthorized = (reporterRole === 'employer' && contract.employerId === reporterId) ||
                             (reporterRole === 'seeker' && contract.jobSeekerId === reporterId);

        if (!isAuthorized) {
            return res.status(403).json({ error: 'Unauthorized to dispute this contract' });
        }

        // 2. Create Dispute
        const dispute = await prisma.dispute.create({
            data: {
                contractId,
                reporterJSId: reporterRole === 'seeker' ? reporterId : null,
                reporterEmpId: reporterRole === 'employer' ? reporterId : null,
                reason,
                description,
                status: 'OPEN'
            }
        });

        // 3. Update Contract & Escrow Status
        await prisma.contract.update({
            where: { id: contractId },
            data: { status: 'DISPUTED' }
        });

        await prisma.escrowContract.updateMany({
            where: { contractId },
            data: { status: 'DISPUTED' }
        });

        // 4. Notify Other Party & Admin
        const otherPartyId = reporterRole === 'employer' ? contract.jobSeekerId : contract.employerId;
        const otherPartyType = reporterRole === 'employer' ? 'JOB_SEEKER' : 'EMPLOYER';

        await notificationService.notify(otherPartyId, otherPartyType, {
            title: 'Dispute Opened ⚖️',
            message: `A dispute has been opened for your contract regarding: "${reason}". Our mediation team is reviewing it.`,
            type: 'SYSTEM'
        });

        res.status(201).json({ message: 'Dispute reported successfully', dispute });
    } catch (error) {
        console.error('Create dispute error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get Dispute Details
 */
exports.getDispute = async (req, res) => {
    try {
        const { id } = req.params;
        const dispute = await prisma.dispute.findUnique({
            where: { id },
            include: { contract: true, reporterJS: true, reporterEmp: true }
        });
        res.json(dispute);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching dispute' });
    }
};
