const { storage } = require('../utils/firebaseAdmin');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const bucket = storage.bucket();

/**
 * Uploads a file buffer to Firebase Storage.
 * @param {Object} file - The multer file object containing buffer, originalname, mimetype.
 * @param {string} folder - The folder prefix (e.g., 'profile-photos', 'legal-docs').
 * @param {boolean} isPublic - Whether the file should be publicly readable.
 * @returns {Promise<Object>} - Returns { storagePath, signedUrl, publicUrl } depending on visibility.
 */
exports.uploadFileToFirebase = async (file, folder, isPublic = false) => {
    if (!file || !file.buffer) throw new Error("No file buffer provided");

    const extension = path.extname(file.originalname);
    const filename = `${folder}/${uuidv4()}${extension}`;
    const fileRef = bucket.file(filename);

    await fileRef.save(file.buffer, {
        metadata: {
            contentType: file.mimetype
        }
    });

    if (isPublic) {
        try {
            await fileRef.makePublic();
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
            return { storagePath: filename, publicUrl };
        } catch (error) {
            console.warn(`[FirebaseStorage] Failed to make ${filename} public:`, error.message);
            // Fallback for buckets where uniform bucket level access disallows makePublic
            const [signedUrl] = await fileRef.getSignedUrl({
                action: 'read',
                expires: '01-01-2100' // Permanent-ish
            });
            return { storagePath: filename, publicUrl: signedUrl };
        }
    } else {
        // Private file, generate a short-lived signed URL for immediate viewing if needed
        const [signedUrl] = await fileRef.getSignedUrl({
            action: 'read',
            expires: Date.now() + 15 * 60 * 1000 // 15 minutes
        });
        return { storagePath: filename, signedUrl };
    }
};

/**
 * Generates a signed URL for a private file.
 * @param {string} storagePath - The Firebase storage path (e.g., 'legal-docs/uuid.pdf').
 * @param {number} expiresInMinutes - Expiration time in minutes.
 * @returns {Promise<string>}
 */
exports.getSignedUrlForFile = async (storagePath, expiresInMinutes = 15) => {
    if (!storagePath) return null;
    if (storagePath.startsWith('http')) return storagePath; // Already full URL
    
    const fileRef = bucket.file(storagePath);
    const [signedUrl] = await fileRef.getSignedUrl({
        action: 'read',
        expires: Date.now() + expiresInMinutes * 60 * 1000
    });
    return signedUrl;
};
