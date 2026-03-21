const prisma = require('../utils/prisma');

/**
 * Get core platform metrics for the admin dashboard
 */
exports.getPlatformStats = async (req, res) => {
    try {
        // Parallelize for speed
        const [
            seekerCount,
            employerCount,
            activeJobs,
            pendingVerifications,
            totalRevenue
        ] = await Promise.all([
            prisma.jobSeeker.count(),
            prisma.employer.count(),
            prisma.jobPost.count(),
            prisma.verificationRequest.count({ where: { status: 'PENDING' } }),
            prisma.payment.aggregate({
                where: { status: 'COMPLETED' },
                _sum: { amount: true }
            })
        ]);

        res.json({
            users: {
                seekers: seekerCount,
                employers: employerCount,
                total: seekerCount + employerCount
            },
            activity: {
                activeJobs,
                pendingVerifications
            },
            revenue: {
                totalETB: totalRevenue._sum.amount || 0
            }
        });
    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ error: "Failed to fetch platform statistics" });
    }
};

/**
 * Get user registration trends (last 7 days)
 */
exports.getRegistrationTrends = async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const seekers = await prisma.jobSeeker.groupBy({
            by: ['createdAt'],
            where: { createdAt: { gte: sevenDaysAgo } },
            _count: true
        });

        // Simple aggregation logic (can be expanded)
        res.json({ trends: seekers });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
/**
 * Market Insights: Regional heatmaps and salary trends
 */
exports.getMarketInsights = async (req, res) => {
    try {
        const [
            jobsByRegion,
            workersByRegion,
            salaryByJobType,
            completedContracts
        ] = await Promise.all([
            // Jobs by region (aggregated from Employers who posted them)
            prisma.jobPost.groupBy({
                by: ['address'], // Note: JobPost address is usually a city/region name
                _count: true
            }),
            // Workers by region
            prisma.jobSeeker.groupBy({
                by: ['locationRegion'],
                _count: true
            }),
            // Average salary by job type
            prisma.jobPost.groupBy({
                by: ['jobType'],
                _avg: { salaryOffered: true }
            }),
            // Average dispute resolution time (only for resolved ones)
            prisma.dispute.findMany({
                where: { status: 'RESOLVED', resolvedAt: { not: null } },
                select: { createdAt: true, resolvedAt: true }
            })
        ]);

        // Calculate avg resolution time in hours
        let avgResolutionHours = 0;
        if (completedContracts.length > 0) {
            const totalMs = completedContracts.reduce((acc, curr) => {
                return acc + (new Date(curr.resolvedAt) - new Date(curr.createdAt));
            }, 0);
            avgResolutionHours = (totalMs / completedContracts.length) / (1000 * 60 * 60);
        }

        res.json({
            regionalBalance: {
                jobs: jobsByRegion,
                workers: workersByRegion
            },
            trends: {
                salaryByJobType
            },
            efficiency: {
                avgDisputeResolutionHours: Math.round(avgResolutionHours * 10) / 10
            }
        });
    } catch (error) {
        console.error("Market Insights Error:", error);
        res.status(500).json({ error: "Failed to fetch market insights" });
    }
};
