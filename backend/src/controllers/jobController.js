const prisma = require('../utils/prisma');
const cacheService = require('../services/cacheService');
const { calculateTrustScore } = require('../utils/rankLogic');
const matchingService = require('../services/matchingService');

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

        matchingService.notifySeekersForNewJob(job.id).catch((err) => {
            console.error('[Match Notification Error]:', err.message);
        });

        // Flush cache on new post
        cacheService.del('all_jobs');

        res.status(201).json(job);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAllJobs = async (req, res) => {
    try {
        if (req.user.role === 'JOB_SEEKER') {
            const { matches } = await matchingService.matchJobsForSeeker(req.user.id, {
                minScore: 0,
                limit: 100,
                scanLimit: 250
            });
            return res.json(matches);
        }

        const cachedJobs = cacheService.get('all_jobs');
        if (cachedJobs) return res.json(cachedJobs);

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
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        
        cacheService.set('all_jobs', jobs, 600000); // 10 minutes
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

        if (user.tier === 'FREE' || user.tier === 'BRONZE') {
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

        const { job, matches } = await matchingService.matchSeekersForJob(id, {
            minScore: 0,
            limit: 50,
            scanLimit: 300
        });

        if (!job) return res.status(404).json({ error: 'Job not found' });

        if (matches.length === 0) {
            return res.json([]);
        }

        const finalMatches = matches.map((match) => ({
            ...match,
            match_score: Math.round(match.matchScore),
            trustScore: calculateTrustScore(match)
        }));

        res.json(finalMatches);
    } catch (error) {
        console.error("Smart Matching error:", error);
        res.status(500).json({ error: "Failed to calculate matching seekers" });
    }
};
