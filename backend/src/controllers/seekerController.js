const prisma = require('../utils/prisma');
const { calculateWorkerRank, calculateTrustScore } = require('../utils/rankLogic');
const { uploadFileToFirebase } = require('../services/firebaseStorageService');
const faydaService = require('../services/faydaService');

// Removed local calculateSeekerTier as it's now handled by calculateWorkerRank in utils

const maskPlatinumBadge = (seeker, employerTier) => {
    const maskedSeeker = { ...seeker };

    // FIX: Using correct EmployerTier enum names (SILVER_ACCESS, etc.)
    if (employerTier === 'SILVER_ACCESS' || employerTier === 'FREE') {
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
    } else if (employerTier === 'GOLD_ACCESS') {
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
                SELECT * FROM get_seeker_visibility_with_id(${userId}::uuid)
                WHERE id = ${id}::uuid
                LIMIT 1
            `;

            if (!seekers || seekers.length === 0) return res.status(404).json({ error: 'Seeker not found' });

            const seeker = seekers[0];
            
            // Calculate Trust Score on the fly for consistency
            seeker.trustScore = calculateTrustScore(seeker);
            
            // Double-Key Access Control Masking
            seeker.phone = req.hasPremiumAccess ? seeker.phone : '********';
            seeker.email = req.hasPremiumAccess ? seeker.email : '********';
            seeker.locationKebele = req.hasPremiumAccess ? seeker.locationKebele : '********';

            return res.json(seeker);
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

        const { fullName, bio, skills, experienceYears, expectedSalary, preferredLocation, preferredArrangement, guarantorPhone, videoBio } = req.body;

        const updateData = {
            fullName, bio,
            experienceYears: experienceYears ? parseInt(experienceYears) : undefined,
            expectedSalary: expectedSalary ? parseInt(expectedSalary) : undefined,
            preferredLocation, preferredArrangement, guarantorPhone, videoBio
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
            try {
                if (req.files.profilePhoto) {
                    updateData.profilePhoto = (await uploadFileToFirebase(req.files.profilePhoto[0], 'profile-photos', true)).publicUrl;
                }
                if (req.files.idDocument) {
                    updateData.idDocument = (await uploadFileToFirebase(req.files.idDocument[0], 'legal-docs', false)).storagePath;
                }
                if (req.files.nationalIdUrl) {
                    updateData.nationalIdUrl = (await uploadFileToFirebase(req.files.nationalIdUrl[0], 'legal-docs', false)).storagePath;
                }
                if (req.files.guarantorIdUrl) {
                    updateData.guarantorIdUrl = (await uploadFileToFirebase(req.files.guarantorIdUrl[0], 'legal-docs', false)).storagePath;
                }
                if (req.files.policeClearanceUrl) {
                    updateData.policeClearanceUrl = (await uploadFileToFirebase(req.files.policeClearanceUrl[0], 'legal-docs', false)).storagePath;
                }
                if (req.files.healthCertificateUrl) {
                    updateData.healthCertificateUrl = (await uploadFileToFirebase(req.files.healthCertificateUrl[0], 'legal-docs', false)).storagePath;
                }
                if (req.files.videoBio) {
                    updateData.videoBio = (await uploadFileToFirebase(req.files.videoBio[0], 'videos', false)).storagePath;
                }
                
                if (req.files.idDocument || req.files.nationalIdUrl || req.files.guarantorIdUrl || req.files.policeClearanceUrl || req.files.healthCertificateUrl) {
                    updateData.isVerified = false;
                    updateData.verificationStatus = 'PENDING';
                }
            } catch (err) {
                return res.status(500).json({ error: "File upload failed: " + err.message });
            }
        }

        // Fetch current document status for tier calculation
        const currentSeeker = await prisma.jobSeeker.findUnique({
            where: { id },
            select: {
                nationalIdUrl: true,
                idDocument: true,
                profilePhoto: true,
                guarantorIdUrl: true,
                guarantorPhone: true,
                policeClearanceUrl: true,
                healthCertificateUrl: true
            }
        });

        // Merged data for tier calculation
        const mergedData = {
            ...currentSeeker,
            ...updateData
        };

        // Recalculate Tier using unified logic
        updateData.tier = calculateWorkerRank(mergedData);

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
                SELECT * FROM get_seeker_visibility_with_id(${userId}::uuid)
                ORDER BY "fullName" ASC
            `;
        } else {
            // Seekers and Admin see the full data
            seekers = await prisma.jobSeeker.findMany({
                orderBy: { fullName: 'asc' }
            });
        }

        const enrichedSeekers = seekers.map(s => ({
            ...s,
            trustScore: calculateTrustScore(s)
        }));

        res.json(enrichedSeekers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.requestFaydaOTP = async (req, res) => {
    try {
        const { faydaId } = req.body;
        const userId = req.user.id;

        if (!faydaId || faydaId.length !== 12) {
            return res.status(400).json({ error: "Invalid Fayda ID. Must be 12 digits." });
        }

        // Check if Fayda ID is already linked to another account
        const existing = await prisma.jobSeeker.findUnique({
            where: { faydaId }
        });

        if (existing && existing.id !== userId) {
            return res.status(409).json({ error: "This Fayda ID is already linked to another account." });
        }

        const result = await faydaService.requestOTP(faydaId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.verifyFayda = async (req, res) => {
    try {
        const { faydaId, otpCode } = req.body;
        const userId = req.user.id;

        const verification = await faydaService.verifyOTP(faydaId, otpCode);
        if (!verification.success) {
            return res.status(400).json({ error: verification.message });
        }

        // Update seeker
        const seeker = await prisma.jobSeeker.findUnique({ where: { id: userId } });
        
        const updatedData = {
            faydaId: faydaId,
            isFaydaVerified: true
        };

        // Recalculate rank
        const mergedData = { ...seeker, ...updatedData };
        updatedData.tier = calculateWorkerRank(mergedData);

        const updatedSeeker = await prisma.jobSeeker.update({
            where: { id: userId },
            data: updatedData
        });

        res.json({
            message: "Fayda ID verified successfully! You have been promoted to " + updatedSeeker.tier + " rank.",
            tier: updatedSeeker.tier
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};