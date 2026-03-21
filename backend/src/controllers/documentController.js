const prisma = require('../utils/prisma');
const { decrypt } = require('../services/encryptionService');
const fs = require('fs');
const path = require('path');

exports.viewDocument = async (req, res) => {
    try {
        const { type, filename } = req.params;
        const userId = req.user.id;
        const role = req.user.role;

        // Security Check: Only Admin or the owner can view (for now)
        // More complex logic for Platinum Employers will be added later
        const isAllowed = role === 'ADMIN';

        if (!isAllowed) {
            // Check if it's the owner
            const seeker = await prisma.jobSeeker.findUnique({ where: { id: userId } });
            if (!seeker || !seeker.idDocument || !seeker.idDocument.includes(filename)) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }

        const filePath = path.join(__dirname, `../../uploads/${type}/${filename}`);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        const encryptedBuffer = fs.readFileSync(filePath);
        const decryptedBuffer = decrypt(encryptedBuffer);

        // Determine content type
        const ext = path.extname(filename).toLowerCase();
        let contentType = 'application/octet-stream';
        if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.png') contentType = 'image/png';
        else if (ext === '.pdf') contentType = 'application/pdf';

        res.setHeader('Content-Type', contentType);
        res.send(decryptedBuffer);
    } catch (error) {
        console.error('Error viewing document:', error);
        res.status(500).json({ error: 'Failed to stream document' });
    }
};
