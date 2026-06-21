const prisma = require('../utils/prisma');
const notificationService = require('./notificationService');

const DEFAULT_MATCH_LIMIT = 25;
const STRONG_MATCH_THRESHOLD = Number(process.env.MATCH_NOTIFY_THRESHOLD || 72);
const DEDUPE_HOURS = Number(process.env.MATCH_NOTIFICATION_DEDUPE_HOURS || 24);

const AMHARIC_SKILL_HINTS = {
    cleaning: ['ጽዳት', 'ማጽዳት'],
    cooking: ['ምግብ', 'ማብሰል', 'ባህላዊ'],
    childcare: ['ሕፃን', 'ህጻን', 'ልጅ', 'እንክብካቤ'],
    elderly_care: ['አረጋውያን', 'እንክብካቤ'],
    laundry: ['ልብስ', 'ማጠብ'],
    driving: ['መንጃ', 'መኪና'],
    security: ['ጥበቃ'],
    gardening: ['አትክልት']
};

const SKILL_ALIASES = {
    cleaning: ['cleaning', 'clean', 'housekeeping', 'maid', 'sanitation', ...AMHARIC_SKILL_HINTS.cleaning],
    cooking: ['cooking', 'cook', 'chef', 'meal', 'food', 'injera', ...AMHARIC_SKILL_HINTS.cooking],
    childcare: ['childcare', 'child care', 'nanny', 'babysitting', 'children', 'kids', 'baby', ...AMHARIC_SKILL_HINTS.childcare],
    elderly_care: ['elderly care', 'eldercare', 'caregiver', 'care giving', ...AMHARIC_SKILL_HINTS.elderly_care],
    laundry: ['laundry', 'washing', 'ironing', ...AMHARIC_SKILL_HINTS.laundry],
    driving: ['driver', 'driving', 'transport', ...AMHARIC_SKILL_HINTS.driving],
    security: ['security', 'guard', ...AMHARIC_SKILL_HINTS.security],
    gardening: ['gardening', 'garden', 'yard', ...AMHARIC_SKILL_HINTS.gardening]
};

const OCCUPATION_HINTS = {
    HOUSEHOLD_SERVICES: ['household', 'domestic', 'home', 'cleaning', 'maid', 'housekeeping', 'ቤት', 'የቤት'],
    TRANSPORTATION_SERVICES: ['driver', 'transport', 'driving', 'መንጃ', 'መኪና'],
    SECURITY_SERVICES: ['security', 'guard', 'ጥበቃ'],
    HOSPITALITY_SERVICES: ['hospitality', 'hotel', 'guest', 'reception'],
    FOOD_BEVERAGE_SERVICES: ['food', 'cook', 'chef', 'cooking', 'meal', 'ምግብ'],
    BEAUTY_WELLNESS_SERVICES: ['beauty', 'wellness', 'salon', 'hair'],
    ADMINISTRATIVE_SUPPORT: ['admin', 'office', 'assistant', 'clerical'],
    FACILITY_SERVICES: ['facility', 'maintenance', 'cleaning'],
    GENERAL_SERVICES: ['general', 'support', 'assistant'],
    ENTERTAINMENT_RECREATION_SERVICES: ['recreation', 'event', 'entertainment']
};

const normalize = (value) =>
    String(value || '')
        .toLowerCase()
        .normalize('NFKC')
        .replace(/[_-]+/g, ' ')
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const uniq = (items) => [...new Set(items.filter(Boolean))];

const normalizeArray = (items) => {
    if (!Array.isArray(items)) return [];
    return uniq(items.map(normalize).filter(Boolean));
};

const hasTextHit = (haystack, needles) => {
    const text = normalize(haystack);
    if (!text) return false;
    return needles.some((needle) => {
        const n = normalize(needle);
        return n && text.includes(n);
    });
};

const buildJobText = (job) =>
    normalize([
        job.title,
        job.description,
        job.jobType,
        job.address,
        ...(job.requiredSkills || [])
    ].filter(Boolean).join(' '));

const buildSeekerText = (seeker) =>
    normalize([
        seeker.bio,
        seeker.customOccupation,
        seeker.occupationCategory,
        seeker.preferredLocation,
        ...(seeker.skills || []),
        ...(seeker.languages || [])
    ].filter(Boolean).join(' '));

const expandSkillTerms = (skill) => {
    const normalized = normalize(skill);
    const aliases = SKILL_ALIASES[normalized] || [];
    return uniq([normalized, ...aliases.map(normalize)]);
};

const scoreSkills = (job, seeker) => {
    const requiredSkills = normalizeArray(job.requiredSkills);
    const seekerSkills = normalizeArray(seeker.skills);
    const seekerText = buildSeekerText(seeker);
    const jobText = buildJobText(job);

    if (requiredSkills.length === 0) {
        return {
            points: seekerSkills.length > 0 ? 16 : 8,
            detail: seekerSkills.length > 0 ? 'Profile has relevant skill signals' : 'No skills requested by employer'
        };
    }

    let matched = 0;
    const matchedLabels = [];

    requiredSkills.forEach((requiredSkill) => {
        const terms = expandSkillTerms(requiredSkill);
        const directHit = seekerSkills.some((skill) => terms.includes(skill) || terms.some((term) => skill.includes(term)));
        const textHit = terms.some((term) => seekerText.includes(term));
        const reverseHit = seekerSkills.some((skill) => jobText.includes(skill));

        if (directHit || textHit || reverseHit) {
            matched += 1;
            matchedLabels.push(requiredSkill);
        }
    });

    const ratio = matched / requiredSkills.length;
    return {
        points: Math.round(ratio * 30),
        detail: matchedLabels.length > 0
            ? `${matchedLabels.slice(0, 3).join(', ')} skills align`
            : 'Skills need review'
    };
};

const scoreOccupation = (job, seeker) => {
    const jobText = buildJobText(job);
    const customOccupation = normalize(seeker.customOccupation);
    const categoryHints = OCCUPATION_HINTS[seeker.occupationCategory] || [];

    if (customOccupation && jobText.includes(customOccupation)) {
        return { points: 10, detail: 'Occupation matches the job need' };
    }

    if (categoryHints.some((hint) => jobText.includes(normalize(hint)))) {
        return { points: 8, detail: 'Service category matches the job' };
    }

    return { points: 0, detail: null };
};

const scoreLocation = (job, seeker) => {
    const seekerPreferredLocation = normalize(seeker.preferredLocation);
    const jobAddress = normalize(job.address);

    if (job.locationWoreda && seeker.locationWoreda && normalize(job.locationWoreda) === normalize(seeker.locationWoreda)) {
        return { points: 16, detail: 'Same woreda' };
    }

    if (job.locationZone && seeker.locationZone && normalize(job.locationZone) === normalize(seeker.locationZone)) {
        return { points: 12, detail: 'Same zone' };
    }

    if (job.locationRegion && seeker.locationRegion && normalize(job.locationRegion) === normalize(seeker.locationRegion)) {
        return { points: 9, detail: 'Same region' };
    }

    if (seekerPreferredLocation && jobAddress && (jobAddress.includes(seekerPreferredLocation) || seekerPreferredLocation.includes(jobAddress))) {
        return { points: 8, detail: 'Preferred location aligns' };
    }

    return { points: 0, detail: null };
};

const scoreSalary = (job, seeker) => {
    const salary = Number(job.salaryOffered || 0);
    const expected = Number(seeker.expectedSalary || 0);

    if (!salary || !expected) return { points: 4, detail: null };
    if (salary >= expected) return { points: 12, detail: 'Salary meets expectation' };
    if (salary >= expected * 0.9) return { points: 8, detail: 'Salary is close to expectation' };
    if (salary >= expected * 0.8) return { points: 4, detail: 'Salary may need negotiation' };

    return { points: 0, detail: null };
};

const scoreArrangement = (job, seeker) => {
    if (!job.preferredArrangement || !seeker.preferredArrangement) return { points: 3, detail: null };
    return job.preferredArrangement === seeker.preferredArrangement
        ? { points: 8, detail: 'Work arrangement matches' }
        : { points: 0, detail: null };
};

const scoreExperience = (seeker) => {
    const years = Number(seeker.experienceYears || 0);
    if (years >= 5) return { points: 8, detail: 'Experienced candidate' };
    if (years >= 2) return { points: 6, detail: 'Practical experience' };
    if (years >= 1) return { points: 4, detail: 'Early experience' };
    return { points: 1, detail: null };
};

const scoreTrust = (seeker) => {
    let points = 0;
    const details = [];

    if (seeker.verificationStatus === 'APPROVED' || seeker.isVerified) {
        points += 6;
        details.push('Admin reviewed');
    }

    if (seeker.isFaydaVerified) {
        points += 5;
        details.push('Fayda verified');
    }

    if (['GOLD', 'PLATINUM'].includes(seeker.tier)) {
        points += seeker.tier === 'PLATINUM' ? 4 : 3;
        details.push(`${seeker.tier} tier`);
    }

    const rating = Number(seeker.rating || 0);
    if (rating >= 4.5) {
        points += 3;
        details.push('High rating');
    } else if (rating >= 4) {
        points += 2;
    }

    return { points: Math.min(points, 15), detail: details[0] || null };
};

const scoreReliability = (seeker) => {
    const behaviorScore = Number(seeker.behaviorScore || 50);
    const responseTimeMs = Number(seeker.responseTimeMs || 0);
    let points = Math.round(Math.min(Math.max(behaviorScore, 0), 100) / 100 * 6);
    const details = [];

    if (responseTimeMs > 0 && responseTimeMs <= 3600000) {
        points += 2;
        details.push('Fast responder');
    }

    if (Number(seeker.completedJobs || 0) > 0) {
        points += Math.min(2, Number(seeker.completedJobs));
        details.push('Platform work history');
    }

    return { points: Math.min(points, 10), detail: details[0] || null };
};

const buildMatchInsights = (components, score) => {
    const ordered = [
        components.skills,
        components.occupation,
        components.location,
        components.salary,
        components.arrangement,
        components.experience,
        components.trust,
        components.reliability
    ];
    const insights = ordered
        .filter((component) => component.detail && component.points > 0)
        .sort((a, b) => b.points - a.points)
        .map((component) => component.detail);

    if (score >= 88) insights.unshift('Exceptional fit');
    else if (score >= 78) insights.unshift('Strong fit');
    else if (score >= 68) insights.unshift('Good fit');

    return uniq(insights).slice(0, 5);
};

const scoreJobForSeeker = (job, seeker) => {
    const components = {
        skills: scoreSkills(job, seeker),
        occupation: scoreOccupation(job, seeker),
        location: scoreLocation(job, seeker),
        salary: scoreSalary(job, seeker),
        arrangement: scoreArrangement(job, seeker),
        experience: scoreExperience(seeker),
        trust: scoreTrust(seeker),
        reliability: scoreReliability(seeker)
    };

    const score = Math.min(
        100,
        Object.values(components).reduce((total, item) => total + item.points, 0)
    );

    return {
        score,
        matchScore: score,
        match_score: score,
        matchInsights: buildMatchInsights(components, score),
        matchBreakdown: Object.entries(components).reduce((breakdown, [key, value]) => {
            breakdown[key] = value.points;
            return breakdown;
        }, {})
    };
};

const seekerSelect = {
    id: true,
    fullName: true,
    age: true,
    gender: true,
    bio: true,
    skills: true,
    languages: true,
    occupationCategory: true,
    customOccupation: true,
    experienceYears: true,
    expectedSalary: true,
    preferredLocation: true,
    preferredArrangement: true,
    profilePhoto: true,
    certificates: true,
    isVerified: true,
    verificationStatus: true,
    rating: true,
    completedJobs: true,
    badge: true,
    tier: true,
    locationRegion: true,
    locationZone: true,
    locationWoreda: true,
    isActive: true,
    isFeatured: true,
    isFaydaVerified: true,
    behaviorScore: true,
    responseTimeMs: true,
    updatedAt: true,
    telegramChatId: true
};

const jobInclude = {
    employer: {
        select: {
            id: true,
            contactName: true,
            employerType: true,
            isVerified: true,
            rating: true,
            completedJobs: true
        }
    }
};

const withMatch = (job, seeker) => ({
    ...job,
    ...scoreJobForSeeker(job, seeker)
});

const matchJobsForSeeker = async (seekerId, options = {}) => {
    const minScore = Number(options.minScore ?? 0);
    const limit = Number(options.limit || DEFAULT_MATCH_LIMIT);

    const seeker = await prisma.jobSeeker.findUnique({
        where: { id: seekerId },
        select: seekerSelect
    });

    if (!seeker || !seeker.isActive) {
        return { seeker, matches: [] };
    }

    const jobs = await prisma.jobPost.findMany({
        include: jobInclude,
        orderBy: { createdAt: 'desc' },
        take: Number(options.scanLimit || 200)
    });

    const matches = jobs
        .map((job) => withMatch(job, seeker))
        .filter((job) => job.matchScore >= minScore)
        .sort((a, b) => b.matchScore - a.matchScore || new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);

    return { seeker, matches };
};

const matchSeekersForJob = async (jobId, options = {}) => {
    const minScore = Number(options.minScore ?? 0);
    const limit = Number(options.limit || DEFAULT_MATCH_LIMIT);

    const job = await prisma.jobPost.findUnique({
        where: { id: jobId },
        include: jobInclude
    });

    if (!job) {
        return { job: null, matches: [] };
    }

    const seekers = await prisma.jobSeeker.findMany({
        where: {
            isActive: true,
            verificationStatus: 'APPROVED'
        },
        select: seekerSelect,
        orderBy: [
            { isFeatured: 'desc' },
            { updatedAt: 'desc' }
        ],
        take: Number(options.scanLimit || 250)
    });

    const matches = seekers
        .map((seeker) => ({
            ...seeker,
            ...scoreJobForSeeker(job, seeker),
            is_visible: true
        }))
        .filter((seeker) => seeker.matchScore >= minScore)
        .sort((a, b) => b.matchScore - a.matchScore || Number(b.isVerified) - Number(a.isVerified))
        .slice(0, limit);

    return { job, matches };
};

const hasRecentNotification = async ({ userId, userType, title, contains }) => {
    const since = new Date(Date.now() - DEDUPE_HOURS * 60 * 60 * 1000);
    const existing = await prisma.notification.findFirst({
        where: {
            userId,
            userType,
            type: 'MATCH',
            title,
            createdAt: { gte: since },
            ...(contains ? { message: { contains } } : {})
        },
        select: { id: true }
    });

    return Boolean(existing);
};

const notifyOnce = async ({ userId, userType, title, message, contains }) => {
    const alreadySent = await hasRecentNotification({ userId, userType, title, contains });
    if (alreadySent) return null;
    return notificationService.notify(userId, userType, { title, message, type: 'MATCH' });
};

const notifySeekersForNewJob = async (jobId, options = {}) => {
    const { job, matches } = await matchSeekersForJob(jobId, {
        minScore: Number(options.minScore || STRONG_MATCH_THRESHOLD),
        limit: Number(options.limit || 10)
    });

    if (!job) return { job: null, notifiedSeekers: 0, strongMatches: [] };

    await Promise.allSettled(matches.map((match) => {
        const insightText = match.matchInsights?.length ? ` Reason: ${match.matchInsights.slice(0, 2).join(', ')}.` : '';
        return notifyOnce({
            userId: match.id,
            userType: 'JOB_SEEKER',
            title: 'Smart job match found',
            contains: job.id,
            message: `${match.matchScore}% match for "${job.title}" (${job.salaryOffered} ETB).${insightText} Open your dashboard to review. Ref: ${job.id}`
        });
    }));

    if (matches.length > 0) {
        await notifyOnce({
            userId: job.employerId,
            userType: 'EMPLOYER',
            title: 'EDWL found strong worker matches',
            contains: job.id,
            message: `${matches.length} reviewed worker profile${matches.length === 1 ? '' : 's'} strongly match "${job.title}". Open your dashboard and view Smart Matches. Ref: ${job.id}`
        });
    }

    return { job, notifiedSeekers: matches.length, strongMatches: matches };
};

const notifyEmployersForSeekerUpdate = async (seekerId, options = {}) => {
    const { seeker, matches } = await matchJobsForSeeker(seekerId, {
        minScore: Number(options.minScore || STRONG_MATCH_THRESHOLD),
        limit: Number(options.limit || 10)
    });

    if (!seeker || !seeker.isActive || seeker.verificationStatus !== 'APPROVED' || matches.length === 0) {
        return { seeker, notifiedEmployers: 0, strongMatches: [] };
    }

    const employerNotifications = new Map();
    matches.forEach((job) => {
        if (!job.employerId || employerNotifications.has(job.employerId)) return;
        employerNotifications.set(job.employerId, job);
    });

    await Promise.allSettled([...employerNotifications.entries()].map(([employerId, job]) => {
        const workerName = seeker.fullName || 'A reviewed worker';
        const insightText = job.matchInsights?.length ? ` Reason: ${job.matchInsights.slice(0, 2).join(', ')}.` : '';
        return notifyOnce({
            userId: employerId,
            userType: 'EMPLOYER',
            title: 'Strong worker match found',
            contains: `${seeker.id}:${job.id}`,
            message: `${workerName} is a ${job.matchScore}% match for "${job.title}".${insightText} Review the match in your dashboard. Ref: ${seeker.id}:${job.id}`
        });
    }));

    await notifyOnce({
        userId: seeker.id,
        userType: 'JOB_SEEKER',
        title: 'Your profile matches open jobs',
        contains: matches[0].id,
        message: `EDWL found ${matches.length} strong job match${matches.length === 1 ? '' : 'es'} for your profile. Best match: "${matches[0].title}" at ${matches[0].matchScore}%. Open your dashboard to review. Ref: ${matches[0].id}`
    });

    return {
        seeker,
        notifiedEmployers: employerNotifications.size,
        strongMatches: matches
    };
};

module.exports = {
    STRONG_MATCH_THRESHOLD,
    scoreJobForSeeker,
    matchJobsForSeeker,
    matchSeekersForJob,
    notifySeekersForNewJob,
    notifyEmployersForSeekerUpdate
};
