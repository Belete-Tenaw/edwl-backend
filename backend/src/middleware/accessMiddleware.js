const prisma = require('../utils/prisma');

const applyDualLayerAccessCheck = async (req, res, next) => {
    try {
        if (req.user.role !== 'EMPLOYER') {
            return next(); // Seekers and Admins bypass this check
        }

        const employerId = req.user.id;
        let workerId = req.params.id; // Assume the route contains the worker ID in params

        // Basic verification of employer
        const employer = await prisma.employer.findUnique({
            where: { id: employerId },
            select: { tier: true, subscriptionExpiry: true, isActive: true }
        });

        if (!employer || !employer.isActive) {
            return res.status(403).json({ error: "Employer account not active." });
        }

        // Layer 1: Time Access Verification
        if (!employer.subscriptionExpiry || new Date(employer.subscriptionExpiry) < new Date()) {
            return res.status(403).json({
                error: "Time Access Expired. Please renew your monthly subscription to unlock platform access.",
                upgradeRequired: "TIME_EXTENSION"
            });
        }

        // Layer 2: Trust Access Verification (if fetching a specific worker)
        if (workerId) {
            const worker = await prisma.jobSeeker.findUnique({
                where: { id: workerId },
                select: { tier: true, verificationStatus: true }
            });

            if (worker && worker.verificationStatus === 'APPROVED') {
                const employerTier = employer.tier;
                const workerTier = worker.tier;

                if (workerTier === 'PLATINUM' && employerTier !== 'PLATINUM_ACCESS') {
                    return res.status(403).json({
                        error: "Trust Access Required.",
                        upgradeRequired: "PLATINUM_ACCESS",
                        price: 5000
                    });
                }

                if (workerTier === 'GOLD' && !['GOLD_ACCESS', 'PLATINUM_ACCESS'].includes(employerTier)) {
                    return res.status(403).json({
                        error: "Trust Access Required.",
                        upgradeRequired: "GOLD_ACCESS",
                        price: 2000
                    });
                }
            }
        }

        next();
    } catch (error) {
        console.error("Dual-Layer Middleware Error:", error);
        res.status(500).json({ error: "Access verification failed." });
    }
};

module.exports = applyDualLayerAccessCheck;
