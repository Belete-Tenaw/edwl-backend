const prisma = require('../utils/prisma');

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

        const certificateUrl = `/uploads/certificate/${req.file.filename}`;

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

        const idDocumentUrl = `/uploads/idDocument/${req.file.filename}`;

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
