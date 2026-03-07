const prisma = require('../utils/prisma');

exports.createJobPost = async (req, res) => {
    try {
        const { title, description, requiredSkills, salaryOffered, jobType, preferredArrangement, address } = req.body;
        const employerId = req.user.id;

        if (req.user.role !== 'EMPLOYER') {
            return res.status(403).json({ error: 'Only employers can post jobs' });
        }

        // Validate required fields
        if (!title || !title.trim()) return res.status(400).json({ error: 'Job title is required.' });
        if (!description || !description.trim()) return res.status(400).json({ error: 'Job description is required.' });
        if (!salaryOffered || isNaN(parseInt(salaryOffered))) return res.status(400).json({ error: 'A valid salary is required.' });
        if (!address || !address.trim()) return res.status(400).json({ error: 'Job address is required.' });
        if (!preferredArrangement) return res.status(400).json({ error: 'Preferred arrangement is required.' });

        // Job Posting Limit for FREE tier
        const employer = await prisma.employer.findUnique({ where: { id: employerId } });
        if (employer.tier === 'FREE') {
            const activeJobs = await prisma.jobPost.count({ where: { employerId } });
            if (activeJobs >= 2) {
                return res.status(403).json({
                    error: 'Limit reached',
                    message: 'Free tier employers are limited to 2 job posts. Upgrade to a Premium plan to post more.'
                });
            }
        }

        const job = await prisma.jobPost.create({
            data: {
                title, description, requiredSkills,
                salaryOffered: parseInt(salaryOffered),
                jobType, preferredArrangement, address,
                employerId
            }
        });

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

        // Use raw query to call the migration function
        // Need to cast to UUID if necessary, depends on how Prisma handles strings to UUID
        const matches = await prisma.$queryRawUnsafe(`SELECT * FROM match_seekers_for_job($1::uuid)`, id);
        res.json(matches);
    } catch (error) {
        console.error("Matching error:", error);
        res.status(500).json({ error: error.message });
    }
};
