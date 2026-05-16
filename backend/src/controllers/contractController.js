const prisma = require('../utils/prisma');
const notificationService = require('../services/notificationService');

// Create a digital contract
exports.createContract = async (req, res) => {
    try {
        const { jobSeekerId, jobPostId, startDate, endDate, salaryAmount, termsConditions, jobType, includeInsurance } = req.body;
        const employerId = req.user.userId;

        if (req.user.role !== 'employer') {
            return res.status(403).json({ error: "Only employers can create contracts." });
        }

        const contract = await prisma.contract.create({
            data: {
                employerId,
                jobSeekerId,
                jobPostId,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                salary: parseFloat(salaryAmount),
                insuranceFee: includeInsurance ? 250.0 : 0,
                termsConditions,
                jobType,
                status: 'PENDING_SEEKER_SIGNATURE'
            }
        });

        res.status(201).json(contract);

        // Notify Seeker
        await notificationService.notify(jobSeekerId, 'JOB_SEEKER', {
            title: 'New Contract Offer! 📝',
            message: `You have received a new employment contract offer. Please review and sign.`,
            type: 'MATCH'
        });
    } catch (error) {
        console.error("Create contract error:", error);
        res.status(500).json({ error: "Failed to create contract." });
    }
};

// Sign a contract (Seeker)
exports.signContract = async (req, res) => {
    try {
        const { contractId } = req.params;
        const seekerId = req.user.userId;

        const contract = await prisma.contract.findUnique({
            where: { id: contractId }
        });

        if (!contract || contract.jobSeekerId !== seekerId) {
            return res.status(404).json({ error: "Contract not found or unauthorized." });
        }

        const updatedContract = await prisma.contract.update({
            where: { id: contractId },
            data: {
                status: 'SIGNED_BY_SEEKER',
                signedAt: new Date()
            }
        });

        res.json(updatedContract);

        // Notify Employer
        await notificationService.notify(contract.employerId, 'EMPLOYER', {
            title: 'Contract Signed! ✅',
            message: `The worker has signed the contract. You can now proceed to fund the escrow.`,
            type: 'MATCH'
        });
    } catch (error) {
        console.error("Sign contract error:", error);
        res.status(500).json({ error: "Failed to sign contract." });
    }
};

// Get contracts for user
exports.getContracts = async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;

        const where = role === 'seeker' ? { jobSeekerId: userId } : { employerId: userId };

        const contracts = await prisma.contract.findMany({
            where,
            include: {
                employer: { select: { contactName: true, phone: true } },
                jobSeeker: { select: { fullName: true, phone: true } },
                jobPost: { select: { title: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(contracts);
    } catch (error) {
        console.error("Get contracts error:", error);
        res.status(500).json({ error: "Failed to fetch contracts." });
    }
};
