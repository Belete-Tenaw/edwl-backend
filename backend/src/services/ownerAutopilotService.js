const prisma = require('../utils/prisma');
const telegramService = require('./telegramService');

const DAY_MS = 24 * 60 * 60 * 1000;

const roundMoney = (value) => Math.round((value || 0) * 100) / 100;

const percent = (part, total) => {
    if (!total) return 0;
    return Math.round((part / total) * 1000) / 10;
};

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));

const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const buildDemandShortages = (demandGroups, supplyGroups) => {
    return demandGroups
        .map(group => {
            const supply = supplyGroups.find(item => item.locationWoreda === group.locationWoreda);
            const demand = group._count.id;
            const supplyCount = supply ? supply._count.id : 0;

            return {
                location: group.locationWoreda,
                demand,
                supply: supplyCount,
                shortage: demand - supplyCount
            };
        })
        .filter(item => item.location && item.shortage > 0)
        .sort((a, b) => b.shortage - a.shortage)
        .slice(0, 5);
};

const buildActionQueue = ({
    overdueVerificationCount,
    expiringSubscriptionCount,
    inactiveFreeEmployers,
    openDisputes,
    reports7d,
    revenue7d,
    demandShortages,
    conversionRate
}) => {
    const actions = [];

    if (overdueVerificationCount > 0) {
        actions.push({
            key: 'VERIFY_BACKLOG',
            priority: 'HIGH',
            title: 'Approve trusted profiles',
            impact: `${overdueVerificationCount} verification request${overdueVerificationCount === 1 ? '' : 's'} waiting over 2 hours`,
            ownerAction: 'Clear oldest verification queue first to increase searchable supply and trust.'
        });
    }

    if (expiringSubscriptionCount > 0) {
        actions.push({
            key: 'RENEWALS',
            priority: 'HIGH',
            title: 'Protect renewal revenue',
            impact: `${expiringSubscriptionCount} paid user${expiringSubscriptionCount === 1 ? '' : 's'} expire within 3 days`,
            ownerAction: 'Send renewal reminders with premium-value proof before access expires.'
        });
    }

    if (inactiveFreeEmployers.length > 0) {
        actions.push({
            key: 'WINBACK',
            priority: 'MEDIUM',
            title: 'Convert stalled employers',
            impact: `${inactiveFreeEmployers.length} free employer${inactiveFreeEmployers.length === 1 ? '' : 's'} with stale activity`,
            ownerAction: 'Use the re-engagement code engine for the employers most likely to hire.'
        });
    }

    if (openDisputes > 0 || reports7d > 0) {
        actions.push({
            key: 'TRUST_RISK',
            priority: openDisputes > 0 ? 'HIGH' : 'MEDIUM',
            title: 'Reduce trust drag',
            impact: `${openDisputes} open dispute${openDisputes === 1 ? '' : 's'}, ${reports7d} report${reports7d === 1 ? '' : 's'} this week`,
            ownerAction: 'Resolve funded disputes and suspend obvious abuse before it harms conversion.'
        });
    }

    if (demandShortages.length > 0) {
        const top = demandShortages[0];
        actions.push({
            key: 'SUPPLY_SCOUTING',
            priority: 'MEDIUM',
            title: `Scout ${top.location}`,
            impact: `${top.shortage} more job${top.shortage === 1 ? '' : 's'} than approved workers`,
            ownerAction: 'Recruit and verify workers in the highest-shortage location first.'
        });
    }

    if (revenue7d <= 0) {
        actions.push({
            key: 'REVENUE_RECOVERY',
            priority: 'HIGH',
            title: 'Restart revenue motion',
            impact: 'No completed revenue recorded in the last 7 days',
            ownerAction: 'Prioritize manual outreach to employers with active jobs and no premium access.'
        });
    } else if (conversionRate < 10) {
        actions.push({
            key: 'CONVERSION',
            priority: 'MEDIUM',
            title: 'Lift premium conversion',
            impact: `${conversionRate}% employer premium conversion`,
            ownerAction: 'Show verified-worker proof, direct-contact value, and time-limited upgrade paths.'
        });
    }

    return actions.slice(0, 6);
};

async function buildOwnerAutopilotBrief(now = new Date()) {
    const dayAgo = new Date(now.getTime() - DAY_MS);
    const weekAgo = new Date(now.getTime() - 7 * DAY_MS);
    const threeDaysAhead = new Date(now.getTime() + 3 * DAY_MS);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    const [
        revenue24hData,
        revenue7dData,
        revenueTotalData,
        automatedRevenueData,
        manualRevenueData,
        failedPayments7d,
        pendingVerificationCount,
        overdueVerificationCount,
        expiringEmployers,
        expiringSeekers,
        inactiveFreeEmployers,
        totalEmployers,
        premiumEmployers,
        totalSeekers,
        approvedSeekers,
        totalJobs,
        openDisputes,
        reports7d,
        promoCodesSent,
        promoCodesUsed,
        demandGroups,
        supplyGroups
    ] = await Promise.all([
        prisma.payment.aggregate({
            where: { status: 'COMPLETED', createdAt: { gte: dayAgo } },
            _sum: { amount: true }
        }),
        prisma.payment.aggregate({
            where: { status: 'COMPLETED', createdAt: { gte: weekAgo } },
            _sum: { amount: true }
        }),
        prisma.payment.aggregate({
            where: { status: 'COMPLETED' },
            _sum: { amount: true }
        }),
        prisma.payment.aggregate({
            where: { status: 'COMPLETED', provider: { in: ['CHAPA', 'TELEBIRR', 'STRIPE'] } },
            _sum: { amount: true }
        }),
        prisma.payment.aggregate({
            where: { status: 'COMPLETED', provider: { in: ['MANUAL', 'CBE'] } },
            _sum: { amount: true }
        }),
        prisma.payment.count({
            where: { status: 'FAILED', createdAt: { gte: weekAgo } }
        }),
        prisma.verificationRequest.count({ where: { status: 'PENDING' } }),
        prisma.verificationRequest.count({
            where: { status: 'PENDING', submittedAt: { lte: twoHoursAgo } }
        }),
        prisma.employer.count({
            where: { subscriptionExpiry: { gte: now, lte: threeDaysAhead } }
        }),
        prisma.jobSeeker.count({
            where: { subscriptionExpiry: { gte: now, lte: threeDaysAhead } }
        }),
        prisma.employer.findMany({
            where: {
                tier: 'FREE',
                isActive: true,
                updatedAt: { lte: weekAgo },
                jobPosts: { some: {} }
            },
            select: { id: true, contactName: true, updatedAt: true, telegramChatId: true },
            orderBy: { updatedAt: 'asc' },
            take: 10
        }),
        prisma.employer.count(),
        prisma.employer.count({ where: { tier: { not: 'FREE' } } }),
        prisma.jobSeeker.count(),
        prisma.jobSeeker.count({ where: { verificationStatus: 'APPROVED' } }),
        prisma.jobPost.count(),
        prisma.dispute.count({ where: { status: 'OPEN' } }),
        prisma.report.count({ where: { timestamp: { gte: weekAgo } } }),
        prisma.subscriptionCode.count({ where: { code: { startsWith: 'COMEBACK-' } } }),
        prisma.subscriptionCode.count({ where: { code: { startsWith: 'COMEBACK-' }, status: 'USED' } }),
        prisma.jobPost.groupBy({
            by: ['locationWoreda'],
            _count: { id: true },
            where: { locationWoreda: { not: null } }
        }),
        prisma.jobSeeker.groupBy({
            by: ['locationWoreda'],
            _count: { id: true },
            where: { verificationStatus: 'APPROVED', locationWoreda: { not: null } }
        })
    ]);

    const revenue24h = roundMoney(revenue24hData._sum.amount);
    const revenue7d = roundMoney(revenue7dData._sum.amount);
    const lifetimeRevenue = roundMoney(revenueTotalData._sum.amount);
    const automatedRevenue = roundMoney(automatedRevenueData._sum.amount);
    const manualRevenue = roundMoney(manualRevenueData._sum.amount);
    const automatedShare = percent(automatedRevenue, automatedRevenue + manualRevenue);
    const conversionRate = percent(premiumEmployers, totalEmployers);
    const approvalRate = percent(approvedSeekers, totalSeekers);
    const demandShortages = buildDemandShortages(demandGroups, supplyGroups);
    const expiringSubscriptionCount = expiringEmployers + expiringSeekers;

    const verificationScore = clamp(100 - overdueVerificationCount * 8);
    const trustScore = clamp(100 - openDisputes * 12 - reports7d * 4);
    const revenueAutomationScore = lifetimeRevenue > 0 ? automatedShare : 0;
    const conversionScore = clamp(conversionRate * 5);
    const sleepScore = Math.round(
        revenueAutomationScore * 0.35 +
        verificationScore * 0.25 +
        trustScore * 0.2 +
        conversionScore * 0.2
    );

    const riskLevel = sleepScore >= 80 ? 'LOW' : sleepScore >= 55 ? 'WATCH' : 'HIGH';

    const actions = buildActionQueue({
        overdueVerificationCount,
        expiringSubscriptionCount,
        inactiveFreeEmployers,
        openDisputes,
        reports7d,
        revenue7d,
        demandShortages,
        conversionRate
    });

    return {
        generatedAt: now.toISOString(),
        sleepScore,
        riskLevel,
        revenue: {
            revenue24h,
            revenue7d,
            lifetimeRevenue,
            automatedRevenue,
            manualRevenue,
            automatedShare,
            failedPayments7d
        },
        marketplace: {
            totalSeekers,
            approvedSeekers,
            approvalRate,
            totalEmployers,
            premiumEmployers,
            conversionRate,
            totalJobs,
            demandShortages
        },
        trust: {
            pendingVerificationCount,
            overdueVerificationCount,
            openDisputes,
            reports7d
        },
        retention: {
            expiringEmployers,
            expiringSeekers,
            inactiveFreeEmployers: inactiveFreeEmployers.map(employer => ({
                id: employer.id,
                contactName: employer.contactName,
                updatedAt: employer.updatedAt,
                hasTelegram: Boolean(employer.telegramChatId)
            })),
            comebackCodes: {
                sent: promoCodesSent,
                used: promoCodesUsed,
                conversionRate: percent(promoCodesUsed, promoCodesSent)
            }
        },
        actions
    };
}

function formatOwnerAutopilotTelegram(report) {
    const topActions = report.actions.length
        ? report.actions.slice(0, 4).map((action, index) =>
            `${index + 1}. <b>${escapeHtml(action.title)}</b> - ${escapeHtml(action.impact)}`
        ).join('\n')
        : 'No urgent action queue. Keep monitoring liquidity and renewals.';

    return [
        '<b>EDWL Owner Autopilot Brief</b>',
        `Sleep Score: <b>${report.sleepScore}/100</b> (${escapeHtml(report.riskLevel)})`,
        `24h Revenue: <b>${report.revenue.revenue24h} ETB</b> | 7d: <b>${report.revenue.revenue7d} ETB</b>`,
        `Automated Share: <b>${report.revenue.automatedShare}%</b>`,
        `Premium Employer Conversion: <b>${report.marketplace.conversionRate}%</b>`,
        `Trust Queue: <b>${report.trust.pendingVerificationCount}</b> pending, <b>${report.trust.openDisputes}</b> disputes`,
        '',
        '<b>Next Money Moves</b>',
        topActions
    ].join('\n');
}

async function runOwnerAutopilotDigest({ notify = true } = {}) {
    const report = await buildOwnerAutopilotBrief();
    let notificationSent = false;

    if (notify) {
        notificationSent = await telegramService.notifyAdmin(formatOwnerAutopilotTelegram(report));
    }

    await prisma.auditLog.create({
        data: {
            action: notify ? 'OWNER_AUTOPILOT_DIGEST_SENT' : 'OWNER_AUTOPILOT_BRIEF_GENERATED',
            userType: 'ADMIN',
            details: {
                generatedAt: report.generatedAt,
                sleepScore: report.sleepScore,
                riskLevel: report.riskLevel,
                revenue24h: report.revenue.revenue24h,
                revenue7d: report.revenue.revenue7d,
                actionKeys: report.actions.map(action => action.key),
                notificationSent
            }
        }
    }).catch(error => {
        console.error('[OwnerAutopilot] Failed to write audit log:', error.message);
    });

    return { ...report, notificationSent };
}

module.exports = {
    buildOwnerAutopilotBrief,
    formatOwnerAutopilotTelegram,
    runOwnerAutopilotDigest
};
