const prisma = require('../utils/prisma');

/**
 * GET /api/jobs/salary/benchmark
 * Returns salary benchmarking data for a given job type + region.
 * Aggregates from real contracts in the DB + fallback market data.
 * Query params:
 *   jobType  (string) e.g. "Nanny", "Cook", "Cleaner"
 *   region   (string, optional) e.g. "Addis Ababa"
 */
exports.getSalaryBenchmark = async (req, res) => {
    try {
        const { jobType, region } = req.query;

        // Build Prisma where clause from real contract + job post data
        const whereJob = {};
        if (jobType) whereJob.jobType = { contains: jobType, mode: 'insensitive' };
        if (region)  whereJob.locationRegion = { contains: region, mode: 'insensitive' };

        // Aggregate from JobPosts (offered salaries)
        const jobAgg = await prisma.jobPost.aggregate({
            where: whereJob,
            _avg:   { salaryOffered: true },
            _min:   { salaryOffered: true },
            _max:   { salaryOffered: true },
            _count: { salaryOffered: true }
        });

        // Aggregate from signed Contracts (actual salaries paid)
        const contractAgg = await prisma.contract.aggregate({
            where: {
                status: { in: ['ACTIVE', 'COMPLETED'] },
                ...(jobType ? { jobPost: { jobType: { contains: jobType, mode: 'insensitive' } } } : {})
            },
            _avg:  { salary: true },
            _min:  { salary: true },
            _max:  { salary: true },
            _count: { salary: true }
        });

        // Merge the two sources (prefer contract data as ground-truth)
        const offeredAvg   = Math.round(jobAgg._avg.salaryOffered || 0);
        const contractAvg  = Math.round(contractAgg._avg.salary    || 0);
        const combinedAvg  = contractAvg > 0
            ? Math.round((offeredAvg + contractAvg) / 2)
            : offeredAvg;

        // Fallback market floor/ceiling table (ETB, 2022 baseline)
        // These are multiplied by the current inflation multiplier at runtime.
        const marketFloors2022 = {
            nanny:     { low: 2500, mid: 4500, high: 8000 },
            cook:      { low: 2000, mid: 4000, high: 7500 },
            cleaner:   { low: 1500, mid: 3000, high: 5500 },
            driver:    { low: 3500, mid: 6000, high: 10000 },
            security:  { low: 2500, mid: 4000, high: 7000 },
            caregiver: { low: 2000, mid: 4500, high: 8000 },
            default:   { low: 1800, mid: 3500, high: 7000 }
        };

        // Apply dynamic inflation adjustment so suggestions never fall below
        // the real-world cost of living in Ethiopia.
        const { getInflationMultiplier, getEconomicContext } = require('../services/economicService');
        const inflationMultiplier = getInflationMultiplier();
        const economicContext = getEconomicContext();

        const key = (jobType || '').toLowerCase();
        const baseMarket = marketFloors2022[key] || marketFloors2022.default;

        // Scale all market thresholds by current inflation factor
        const market = {
            low:  Math.round(baseMarket.low  * inflationMultiplier),
            mid:  Math.round(baseMarket.mid  * inflationMultiplier),
            high: Math.round(baseMarket.high * inflationMultiplier)
        };

        const dataPoints = (jobAgg._count.salaryOffered || 0) + (contractAgg._count.salary || 0);

        // Fair range guidance
        const fairMin = combinedAvg > 0 ? Math.min(combinedAvg, market.low) : market.low;
        const fairMax = combinedAvg > 0 ? Math.max(combinedAvg, market.mid) : market.mid;

        res.json({
            jobType:     jobType || 'All',
            region:      region  || 'Ethiopia',
            dataPoints,
            offered: {
                avg: offeredAvg,
                min: Math.round(jobAgg._min.salaryOffered || 0),
                max: Math.round(jobAgg._max.salaryOffered || 0)
            },
            contracted: {
                avg: contractAvg,
                min: Math.round(contractAgg._min.salary || 0),
                max: Math.round(contractAgg._max.salary || 0)
            },
            combined:   combinedAvg,
            market,
            economicContext,
            recommendation: {
                fairMin,
                fairMax,
                label: combinedAvg > market.high
                    ? '⚠️ Above market — you may attract more candidates by adjusting slightly'
                    : combinedAvg < market.low
                    ? '⚠️ Below market — this may deter quality workers'
                    : '✅ Fair market rate — competitive salary'
            }
        });
    } catch (err) {
        console.error('[SalaryBenchmark Error]', err);
        res.status(500).json({ error: 'Failed to fetch salary benchmark data.' });
    }
};
