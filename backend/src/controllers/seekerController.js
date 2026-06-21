const prisma = require('../utils/prisma');
const { calculateWorkerRank, calculateTrustScore } = require('../utils/rankLogic');
const { uploadFileToFirebase } = require('../services/firebaseStorageService');
const faydaService = require('../services/faydaService');
const cacheService = require('../services/cacheService');
const matchingService = require('../services/matchingService');

// Removed local calculateSeekerTier as it's now handled by calculateWorkerRank in utils
const parseStringArrayField = (value) => {
    if (Array.isArray(value)) {
        return value.map(item => String(item).trim()).filter(Boolean);
    }

    if (typeof value !== 'string') return [];

    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
            return parsed.map(item => String(item).trim()).filter(Boolean);
        }
    } catch (error) {
        // Fall back to comma-separated input from older clients.
    }

    return trimmed.split(',').map(item => item.trim()).filter(Boolean);
};

const normalizeOptionalText = (value, maxLength = 120) => {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed ? trimmed.slice(0, maxLength) : undefined;
};

const isOtherOccupation = (value) => value && value.toUpperCase() === 'OTHER';

const toPublicDisplayName = (fullName = '') => {
    const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'Reviewed worker';
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[1].charAt(0)}.`;
};

const toSalaryBand = (salary) => {
    if (!Number.isFinite(salary) || salary <= 0) return null;
    const lower = Math.max(0, Math.floor(salary / 1000) * 1000);
    const upper = lower + 1000;
    return `${lower.toLocaleString()}-${upper.toLocaleString()} ETB`;
};

const getOccupationLabel = (seeker) => {
    if (isOtherOccupation(seeker.occupationCategory) && seeker.customOccupation) {
        return seeker.customOccupation;
    }
    return seeker.occupationCategory || 'Domestic support';
};

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

exports.getPublicSeekers = async (req, res) => {
    try {
        const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
        const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
        const location = typeof req.query.location === 'string' ? req.query.location.trim() : '';

        const where = {
            isActive: true,
            verificationStatus: 'APPROVED',
            ...(category ? { occupationCategory: category } : {})
        };

        const searchTerms = [];
        if (q) {
            searchTerms.push(
                { occupationCategory: { contains: q, mode: 'insensitive' } },
                { customOccupation: { contains: q, mode: 'insensitive' } },
                { preferredLocation: { contains: q, mode: 'insensitive' } }
            );
        }

        if (location) {
            searchTerms.push(
                { preferredLocation: { contains: location, mode: 'insensitive' } },
                { locationRegion: { contains: location, mode: 'insensitive' } },
                { locationWoreda: { contains: location, mode: 'insensitive' } }
            );
        }

        if (searchTerms.length > 0) {
            where.OR = searchTerms;
        }

        const seekers = await prisma.jobSeeker.findMany({
            where,
            orderBy: [
                { isFeatured: 'desc' },
                { updatedAt: 'desc' }
            ],
            take: 24,
            select: {
                id: true,
                fullName: true,
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
                locationWoreda: true,
                updatedAt: true
            }
        });

        const items = seekers.map((seeker) => ({
            id: seeker.id,
            displayName: toPublicDisplayName(seeker.fullName),
            occupation: getOccupationLabel(seeker),
            experienceYears: seeker.experienceYears,
            salaryBand: toSalaryBand(seeker.expectedSalary),
            preferredLocation: seeker.preferredLocation,
            preferredArrangement: seeker.preferredArrangement,
            locationRegion: seeker.locationRegion,
            locationWoreda: seeker.locationWoreda,
            profilePhoto: seeker.profilePhoto,
            skills: (seeker.skills || []).slice(0, 5),
            languages: (seeker.languages || []).slice(0, 4),
            certificateCount: (seeker.certificates || []).length,
            isVerified: seeker.isVerified,
            verificationStatus: seeker.verificationStatus,
            rating: seeker.rating,
            completedJobs: seeker.completedJobs,
            badge: seeker.badge,
            tier: seeker.tier,
            updatedAt: seeker.updatedAt
        }));

        res.json({
            items,
            count: items.length,
            policy: {
                publicDataOnly: true,
                contactHiddenUntilSignup: true,
                approvalRequired: true
            }
        });
    } catch (error) {
        console.error('Public seeker browse error:', error);
        res.status(500).json({ error: 'Unable to load public profiles right now.' });
    }
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

        const {
            fullName, bio, skills, languages, occupationCategory, customOccupation,
            experienceYears, expectedSalary, preferredLocation, preferredArrangement,
            guarantorPhone, videoBio, availability, videoTranscription
        } = req.body;

        const updateData = {
            fullName, bio,
            experienceYears: experienceYears ? parseInt(experienceYears) : undefined,
            expectedSalary: expectedSalary ? parseInt(expectedSalary) : undefined,
            preferredLocation, preferredArrangement, guarantorPhone, videoBio,
            availability, videoTranscription
        };

        if (skills) {
            updateData.skills = parseStringArrayField(skills);
        }

        if (languages) {
            updateData.languages = parseStringArrayField(languages);
        }

        if (Object.prototype.hasOwnProperty.call(req.body, 'occupationCategory')) {
            const normalizedOccupationCategory = normalizeOptionalText(occupationCategory, 80);
            const normalizedCustomOccupation = normalizeOptionalText(customOccupation, 120);

            if (isOtherOccupation(normalizedOccupationCategory) && !normalizedCustomOccupation) {
                return res.status(400).json({ error: "Please specify the occupation when selecting Other." });
            }

            updateData.occupationCategory = normalizedOccupationCategory || null;
            updateData.customOccupation = isOtherOccupation(normalizedOccupationCategory)
                ? normalizedCustomOccupation
                : null;
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

        // Flush cache on update
        cacheService.del('all_seekers');

        matchingService.notifyEmployersForSeekerUpdate(updated.id).catch((err) => {
            console.error('[Profile Match Notification Error]:', err.message);
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

        // Only cache for non-employers or generic list
        const cacheKey = `seekers_${userRole}`;
        const cached = cacheService.get(cacheKey);
        if (cached) return res.json(cached);

        let seekers;
        if (userRole === 'EMPLOYER') {
            seekers = await prisma.$queryRaw`
                SELECT * FROM get_seeker_visibility_with_id(${userId}::uuid)
                ORDER BY "fullName" ASC
            `;
        } else {
            seekers = await prisma.jobSeeker.findMany({
                orderBy: { fullName: 'asc' }
            });
        }

        const enrichedSeekers = seekers.map(s => ({
            ...s,
            trustScore: calculateTrustScore(s)
        }));

        cacheService.set(cacheKey, enrichedSeekers, 300000); // 5 minutes
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
exports.getConciergePicks = async (req, res) => {
    try {
        // Rank by points, rating, and verification status
        const topPicks = await prisma.jobSeeker.findMany({
            where: { isActive: true },
            orderBy: [
                { isVerified: 'desc' },
                { rewardPoints: 'desc' },
                { rating: 'desc' }
            ],
            take: 3
        });
        res.json(topPicks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
