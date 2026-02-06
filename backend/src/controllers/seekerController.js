const prisma = require('../utils/prisma');

exports.getSeekerProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const seeker = await prisma.jobSeeker.findUnique({
            where: { id }
        });

        if (!seeker) return res.status(404).json({ error: 'Seeker not found' });

        // Log view if viewed by an employer
        if (userRole === 'EMPLOYER') {
            await prisma.viewLog.create({
                data: {
                    employerId: userId,
                    targetJobSeekerId: id
                }
            });

            // Check tier
            const employer = await prisma.employer.findUnique({ where: { id: userId } });
            if (employer.tier === 'FREEMIUM') {
                seeker.phone = '********';
                seeker.email = '********';
                seeker.idDocument = null;
            }
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
                updateData.profilePhoto = `/uploads/profilePhoto/${req.files.profilePhoto[0].filename}`;
            }
            if (req.files.idDocument) {
                updateData.idDocument = `/uploads/idDocument/${req.files.idDocument[0].filename}`;
                // Reset verification status if ID is updated
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
        const seekers = await prisma.jobSeeker.findMany({
            select: {
                id: true,
                fullName: true,
                gender: true,
                age: true,
                skills: true,
                experienceYears: true,
                preferredLocation: true,
                preferredArrangement: true,
                profilePhoto: true
            }
        });
        res.json(seekers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
