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

        if (userRole === 'EMPLOYER') {
            // Log the view
            await prisma.viewLog.create({
                data: {
                    employerId: userId,
                    targetJobSeekerId: id
                }
            });

            // Fetch masked data from the view function for this specific seeker
            const seekers = await prisma.$queryRaw`
                SELECT * FROM get_seeker_visibility_with_id(${userId})
                WHERE id = ${id}::uuid
                LIMIT 1
            `;

            if (!seekers || seekers.length === 0) return res.status(404).json({ error: 'Seeker not found' });
            return res.json(seekers[0]);
        }

        // For Seekers/Admins, return the full profile
        const seeker = await prisma.jobSeeker.findUnique({
            where: { id }
        });

        if (!seeker) return res.status(404).json({ error: 'Seeker not found' });
        res.json(seeker);
    } catch (error) {
        console.error("Get profile error:", error);
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

        let seekers;
        if (userRole === 'EMPLOYER') {
            // Use the database-level masking function for employers
            seekers = await prisma.$queryRaw`
                SELECT * FROM get_seeker_visibility_with_id(${userId})
                ORDER BY "fullName" ASC
            `;
        } else {
            // Seekers and Admin see the full data
            seekers = await prisma.jobSeeker.findMany({
                orderBy: { fullName: 'asc' }
            });
        }

        res.json(seekers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};