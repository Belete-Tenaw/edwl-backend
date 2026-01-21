const prisma = require('../utils/prisma');

exports.createJobPost = async (req, res) => {
    try {
        const { title, description, requiredSkills, salaryOffered, jobType, preferredArrangement, address } = req.body;
        const employerId = req.user.id;

        if (req.user.role !== 'EMPLOYER') {
            return res.status(403).json({ error: 'Only employers can post jobs' });
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
                        employerType: true
                        // full address hidden by default for freemium? 
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

        if (user.tier === 'FREEMIUM') {
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
