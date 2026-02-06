const prisma = require('../utils/prisma');

exports.updateProfile = async (req, res) => {
    try {
        const id = req.user.id;
        if (req.user.role !== 'EMPLOYER') return res.status(403).json({ error: 'Forbidden' });

        const { contactName, address, familySize } = req.body;

        // Extract file paths
        const profilePhotoPath = req.files?.profilePhoto ? `/uploads/profilePhoto/${req.files.profilePhoto[0].filename}` : undefined;
        const idDocumentPath = req.files?.idDocument ? `/uploads/idDocument/${req.files.idDocument[0].filename}` : undefined;

        // If ID document is updated, reset verification status
        let verificationData = {};
        if (idDocumentPath) {
            verificationData = {
                verificationStatus: 'PENDING',
                isVerified: false
            };
        }

        const updated = await prisma.employer.update({
            where: { id },
            data: {
                contactName,
                address,
                familySize: familySize ? parseInt(familySize) : undefined,
                profilePhoto: profilePhotoPath,
                idDocument: idDocumentPath,
                ...verificationData
            }
        });

        res.json(updated);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getEmployerProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const employer = await prisma.employer.findUnique({
            where: { id },
            select: {
                id: true,
                contactName: true,
                employerType: true,
                address: true,
                createdAt: true,
                tier: true
            }
        });
        res.json(employer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
