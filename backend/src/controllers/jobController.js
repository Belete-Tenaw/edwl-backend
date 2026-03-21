const prisma = require('../utils/prisma');
const telegramService = require('../services/telegramService');

exports.createJobPost = async (req, res) => {
    try {
        const { title, description, requiredSkills, salaryOffered, jobType, preferredArrangement, address, locationRegion, locationZone, locationWoreda } = req.body;
        const employerId = req.user.id;

        if (req.user.role !== 'EMPLOYER') {
            return res.status(403).json({ error: 'Only employers can post jobs' });
        }

        // Validate required fields
        if (!title || !title.trim()) return res.status(400).json({ error: 'Job title is required.' });
        if (!description || !description.trim()) return res.status(400).json({ error: 'Job description is required.' });
        if (!salaryOffered || isNaN(parseInt(salaryOffered))) return res.status(400).json({ error: 'A valid salary is required.' });
        // Daily Job Posting Limit (Fraud Prevention)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Combine limit check queries to reduce latency
        const [postsToday, activeJobs, employer] = await Promise.all([
            prisma.jobPost.count({
                where: { employerId, createdAt: { gte: today } }
            }),
            prisma.jobPost.count({ where: { employerId } }),
            prisma.employer.findUnique({ where: { id: employerId } })
        ]);

        if (postsToday >= 3) {
            return res.status(429).json({ // 429 is more accurate for rate limits
                error: 'Daily limit reached',
                message: 'You can only post up to 3 jobs per day to prevent system abuse.'
            });
        }

        if (employer.tier === 'FREE' && activeJobs >= 2) {
            return res.status(403).json({
                error: 'Limit reached',
                message: 'Free tier employers are limited to 2 active job posts. Upgrade to a Premium plan to post more.'
            });
        }

        const job = await prisma.jobPost.create({
            data: {
                title, description, requiredSkills,
                salaryOffered: parseInt(salaryOffered),
                jobType, preferredArrangement, address,
                locationRegion, locationZone, locationWoreda,
                employerId
            }
        });

        // 🎯 Proactive Match Notifications (Optimized)
        // Wrapped in an async IIFE to avoid blocking the response
        (async () => {
            try {
                const matches = await prisma.$queryRawUnsafe(
                    `SELECT * FROM match_seekers_for_job($1::uuid)`,
                    job.id
                );

                // Benchmark: Industry giants use >80% match for push, we use 75
                const topMatches = matches.filter(m => m.match_score >= 75);
                
                for (const match of topMatches) {
                    const seeker = await prisma.jobSeeker.findUnique({
                        where: { id: match.seeker_id },
                        select: { telegramChatId: true, fullName: true, isActive: true }
                    });

                    if (seeker?.isActive && seeker?.telegramChatId) {
                        const message = `🔔 <b>Perfect Match!</b>\n\nHello ${seeker.fullName},\n\nWe found a job matching your skills: <b>"${job.title}"</b>.\n\n💰 Salary: ${job.salaryOffered} ETB\n📍 Location: ${job.locationWoreda || job.locationRegion || 'Near You'}\n\nApply now: https://edwl-ethio-domesticworkerslink.web.app/jobs/${job.id}`;
                        await telegramService.sendMessage(seeker.telegramChatId, message);
                    }
                }
            } catch (err) {
                console.error('[Match Notification Error]:', err.message);
            }
        })();

        res.status(201).json(job);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await prisma.jobPost.findMany({
            include: {
                employer: {
                    select: {
                        id: true,
                        contactName: true,
                        employerType: true,
                        isVerified: true,
                        rating: true,
                        completedJobs: true
                        // The requirement says "Cannot view employer full profile or address" for freemium.
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getJobById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const job = await prisma.jobPost.findUnique({
            where: { id },
            include: { employer: true }
        });

        if (!job) return res.status(404).json({ error: 'Job not found' });

        // Log the view
        await prisma.viewLog.create({
            data: {
                [userRole === 'JOB_SEEKER' ? 'jobSeekerId' : 'employerId']: userId,
                targetJobPostId: id
            }
        });

        // Check tier and hide info if necessary
        let user;
        if (userRole === 'JOB_SEEKER') {
            user = await prisma.jobSeeker.findUnique({ where: { id: userId } });
        } else {
            user = await prisma.employer.findUnique({ where: { id: userId } });
        }

        if (user.tier === 'FREE') {
            // Masking employer details
            job.employer.phone = '********';
            job.employer.email = '********';
            job.employer.address = '********';
            job.address = '********'; // Job address also hidden?
        }

        res.json(job);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMatchesForJob = async (req, res) => {
    try {
        const { id } = req.params;
        if (req.user.role !== 'EMPLOYER') {
            return res.status(403).json({ error: 'Only employers can see matches' });
        }

        // Use raw query to call the weighted matching function
        // This function calculates scores based on skills, location, and tier.
        const matches = await prisma.$queryRawUnsafe(
            `SELECT * FROM match_seekers_for_job($1::uuid)`,
            id
        );

        if (matches.length === 0) {
            return res.json([]);
        }

        const employerId = req.user.id;
        const matchedIds = matches.map(m => m.seeker_id);

        // Fetch full masked profiles for these exact matched seekers
        // We use the existing visibility view to ensure privacy compliance
        const placeholders = matchedIds.map((_, i) => `$${i + 2}`).join(',');
        const fullProfiles = await prisma.$queryRawUnsafe(`
            SELECT * FROM "JobSeeker"
            WHERE id IN (${placeholders})
        `, employerId, ...matchedIds);

        // Fetch employer tier to enforce masking
        const employer = await prisma.employer.findUnique({ where: { id: req.user.id }, select: { tier: true } });
        const isFreeTier = employer?.tier === 'FREE';

        // Merge the smart score and visibility flag into the profiles
        const enrichedMatches = fullProfiles.map(profile => {
            const scoreData = matches.find(m => m.seeker_id === profile.id);

            // Mask if not visible in scoreData OR if employer is on FREE tier (Privacy Audit Fix)
            const isMasked = !scoreData?.is_visible || isFreeTier;

            return {
                id: profile.id,
                fullName: profile.fullName,
                skills: profile.skills,
                experienceYears: profile.experienceYears,
                tier: profile.tier,
                rating: profile.rating,
                match_score: scoreData ? Math.round(scoreData.match_score) : 0,
                is_visible: !isMasked,
                // Masked fields
                phone: isMasked ? '********' : profile.phone,
                email: isMasked ? '********' : profile.email,
                profilePhoto: profile.profilePhoto
            };
        });

        // Final sort by match score descending
        enrichedMatches.sort((a, b) => b.match_score - a.match_score);

        res.json(enrichedMatches);
    } catch (error) {
        console.error("Smart Matching error:", error);
        res.status(500).json({ error: "Failed to calculate matching seekers" });
    }
};
