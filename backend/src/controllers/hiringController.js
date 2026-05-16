const prisma = require('../utils/prisma');
const escrowService = require('../services/escrowService');
const notificationService = require('../services/notificationService');

// Save or Update Hiring Requirements
exports.createHiringRequirement = async (req, res) => {
    try {
        const { employerId, ...requirements } = req.body;

        if (!employerId) {
            return res.status(400).json({ success: false, error: "Employer ID is required" });
        }

        const savedData = await prisma.hiringRequirement.upsert({
            where: { employerId: employerId },
            update: requirements,
            create: {
                employerId: employerId,
                ...requirements,
            },
        });

        res.status(200).json({
            success: true,
            message: "Hiring requirements saved successfully!",
            data: savedData,
        });
    } catch (error) {
        console.error("Prisma Error:", error);
        res.status(500).json({ success: false, error: "Failed to save requirements" });
    }
};

/**
 * Initiate a new Hire (Create Contract + Escrow)
 */
exports.initiateHire = async (req, res) => {
    try {
        const { employerId, workerId, jobPostId, salary, startDate, endDate, terms } = req.body;

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Contract
            const contract = await tx.contract.create({
                data: {
                    employerId,
                    jobSeekerId: workerId,
                    jobPostId,
                    salary,
                    startDate: new Date(startDate),
                    endDate: endDate ? new Date(endDate) : null,
                    termsConditions: terms,
                    status: 'PENDING_SIGNATURE'
                }
            });

            // 2. Initialize Escrow (Zero-Trust)
            const escrow = await tx.escrowContract.create({
                data: {
                    contractId: contract.id,
                    employerId,
                    workerId,
                    amount: salary,
                    status: 'PENDING'
                }
            });

            return { contract, escrow };
        });

        // 3. Notify Worker
        await notificationService.notify(workerId, 'JOB_SEEKER', {
            title: 'New Job Offer! 🎊',
            message: `An employer has offered you a position with a salary of ${salary} ETB. Review and sign to begin.`,
            type: 'MATCH'
        });

        res.status(201).json({
            success: true,
            message: "Hiring process initiated. Escrow pending funding.",
            data: result
        });
    } catch (error) {
        console.error("Initiate Hire Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Release Escrow Salary
 */
exports.releaseSalary = async (req, res) => {
    try {
        const { escrowId } = req.params;
        const employerId = req.user.id; // From auth middleware

        const result = await escrowService.releaseFunds(escrowId, 'EMPLOYER');

        res.status(200).json({
            success: true,
            message: "Salary released to worker successfully.",
            data: result
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};