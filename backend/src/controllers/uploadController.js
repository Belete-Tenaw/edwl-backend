const prisma = require('../utils/prisma');
const { uploadFileToFirebase } = require('../services/firebaseStorageService');

// Upload certificate
exports.uploadCertificate = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        if (role !== 'JOB_SEEKER') {
            return res.status(403).json({ error: 'Only job seekers can upload certificates' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const result = await uploadFileToFirebase(req.file, 'legal-docs', false);
        const certificateUrl = result.storagePath;

        // Add to certificates array
        const seeker = await prisma.jobSeeker.update({
            where: { id: userId },
            data: {
                certificates: {
                    push: certificateUrl
                }
            }
        });

        res.json({
            message: 'Certificate uploaded successfully',
            certificateUrl,
            certificates: seeker.certificates
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Request verification with ID upload
exports.requestVerification = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        if (role !== 'JOB_SEEKER') {
            return res.status(403).json({ error: 'Only job seekers can request verification' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'ID document is required for verification' });
        }

        // Upload to Firebase
        const result = await uploadFileToFirebase(req.file, 'legal-docs', false);
        const idDocumentUrl = result.storagePath;

        // Update seeker with ID document
        await prisma.jobSeeker.update({
            where: { id: userId },
            data: {
                idDocument: idDocumentUrl,
                verificationStatus: 'PENDING'
            }
        });

        // Create verification request
        const request = await prisma.verificationRequest.create({
            data: {
                jobSeekerId: userId,
                documentType: req.body.documentType || 'NATIONAL_ID',
                documentUrl: idDocumentUrl,
                status: 'PENDING'
            }
        });

        res.json({
            message: 'Verification request submitted successfully',
            request
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Upload Live Selfie (Trust & Safety Betterment)
exports.uploadLiveSelfie = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        if (!req.file) {
            return res.status(400).json({ error: 'Selfie image is required' });
        }

        // Upload to Firebase (stored in 'selfies' folder)
        const result = await uploadFileToFirebase(req.file, 'selfies', false);
        const selfieUrl = result.storagePath;

        // Update user record based on role
        if (role === 'JOB_SEEKER') {
            await prisma.jobSeeker.update({
                where: { id: userId },
                data: { liveSelfieUrl: selfieUrl }
            });
        } else if (role === 'EMPLOYER') {
            await prisma.employer.update({
                where: { id: userId },
                data: { liveSelfieUrl: selfieUrl }
            });
        }

        res.json({
            message: 'Live selfie uploaded successfully',
            selfieUrl
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Upload Video Bio (Trust & Transparency Feature)
exports.uploadVideoBio = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        if (role !== 'JOB_SEEKER') {
            return res.status(403).json({ error: 'Only job seekers can upload a video bio' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Video file is required' });
        }

        // Upload to Firebase (stored in 'videos' folder)
        const result = await uploadFileToFirebase(req.file, 'videos', false);
        const videoUrl = result.storagePath;

        // Update seeker record
        await prisma.jobSeeker.update({
            where: { id: userId },
            data: { videoBio: videoUrl }
        });

        res.json({
            message: 'Video introduction uploaded successfully',
            videoUrl
        });
    } catch (error) {
        console.error("Video Upload Error:", error);
        res.status(500).json({ error: error.message });
    }
};
// Upload Voice Bio (Accessibility & Inclusivity Feature)
exports.uploadVoiceBio = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        if (role !== 'JOB_SEEKER') {
            return res.status(403).json({ error: 'Only job seekers can upload a voice bio' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Audio file is required' });
        }

        // Upload to Firebase (stored in 'voice-bios' folder)
        const result = await uploadFileToFirebase(req.file, 'voice-bios', false);
        const voiceUrl = result.storagePath;

        // Update seeker record (basic field update, transcription happens via AI route)
        await prisma.jobSeeker.update({
            where: { id: userId },
            data: { voiceBioUrl: voiceUrl }
        });

        res.json({
            message: 'Voice bio uploaded successfully',
            voiceUrl
        });
    } catch (error) {
        console.error("Voice Upload Error:", error);
        res.status(500).json({ error: error.message });
    }
};
