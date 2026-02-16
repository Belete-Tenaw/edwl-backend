const prisma = require('../utils/prisma');

const maskPlatinumBadge = (seeker, employerTier) => {
    const maskedSeeker = { ...seeker };

    if (employerTier === 'SILVER' || employerTier === 'FREEMIUM') {
        // SILVER ACCESS (Base Subscription)
        maskedSeeker.phone = '********';
        maskedSeeker.email = '********';
        maskedSeeker.nationalIdFayda = '********';
        maskedSeeker.guarantorName = '********';
        maskedSeeker.guarantorPhone = '********';
        maskedSeeker.guarantorIdCard = null;
        maskedSeeker.policeClearance = null;
        maskedSeeker.healthCertificate = null;
        maskedSeeker.idDocument = null;

        if (maskedSeeker.badge === 'GOLD' || maskedSeeker.badge === 'PLATINUM') {
            maskedSeeker.badge = 'SILVER';
        }
    } else if (employerTier === 'GOLD') {
        // GOLD ACCESS (Mid-Tier Upgrade)
        maskedSeeker.policeClearance = null;
        maskedSeeker.healthCertificate = null;

        if (maskedSeeker.badge === 'PLATINUM') {
            maskedSeeker.badge = 'GOLD';
        }
    }
    return maskedSeeker;
};

exports.getSeekerProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        let seeker = await prisma.jobSeeker.findUnique({
            where: { id }
        });

        if (!seeker) return res.status(404).json({ error: 'Seeker not found' });

        if (userRole === 'EMPLOYER') {
            await prisma.viewLog.create({
                data: {
                    employerId: userId,
                    targetJobSeekerId: id
                }
            });

            const employer = await prisma.employer.findUnique({ where: { id: userId } });
            seeker = maskPlatinumBadge(seeker, employer.tier);
        }

        res.json(seeker);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const id = req.user.id;
        if (req.user.role !== 'JOB_SEEKER') return res.status(403).json({ error: 'Forbidden' });

        const { fullName, bio, skills, experienceYears, expectedSalary, preferredLocation, preferredArrangement } = req.body;

        const updateData = {
            fullName, bio,
            experienceYears: experienceYears ? parseInt(experienceYears) : undefined,
            expectedSalary: expectedSalary ? parseInt(expectedSalary) : undefined,
            preferredLocation, preferredArrangement
        };

        if (skills) {
            let formattedSkills = skills;
            if (typeof skills === 'string') {
                try {
                    formattedSkills = JSON.parse(skills);
                } catch (e) {
                    formattedSkills = skills.split(',').map(s => s.trim());
                }
            }
            updateData.skills = Array.isArray(formattedSkills) ? formattedSkills : [];
        }

        if (req.files) {
            if (req.files.profilePhoto) {
                // FIXED: Removed leading /
                updateData.profilePhoto = `uploads/profilePhoto/${req.files.profilePhoto[0].filename}`;
            }
            if (req.files.idDocument) {
                // FIXED: Removed leading /
                updateData.idDocument = `uploads/idDocument/${req.files.idDocument[0].filename}`;
                updateData.isVerified = false;
                updateData.verificationStatus = 'PENDING';
            }
        }

        const updated = await prisma.jobSeeker.update({
            where: { id },
            data: updateData
        });

        res.json(updated);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAllSeekers = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let seekers = await prisma.jobSeeker.findMany({
            select: {
                id: true,
                fullName: true,
                gender: true,
                age: true,
                skills: true,
                experienceYears: true,
                preferredLocation: true,
                preferredArrangement: true,
                profilePhoto: true,
                badge: true,
                priorityWeight: true
            },
            orderBy: {
                priorityWeight: 'desc'
            }
        });

        if (userRole === 'EMPLOYER') {
            const employer = await prisma.employer.findUnique({ where: { id: userId } });
            seekers = seekers.map(s => maskPlatinumBadge(s, employer.tier));
        }

        res.json(seekers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};