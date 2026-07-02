const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Test-mode mock implementations to avoid dependence on Firebase in unit tests.
if (process.env.NODE_ENV === 'test') {
    exports.uploadFileToFirebase = async (file, folder, isPublic = false) => {
        if (!file) throw new Error('No file provided');
        const extension = path.extname(file.originalname || 'file.bin') || '.bin';
        const filename = `${folder}/${uuidv4()}${extension}`;
        const publicUrl = `https://test.storage.local/${filename}`;
        const signedUrl = `https://test.storage.local/signed/${filename}`;
        return isPublic ? { storagePath: filename, publicUrl } : { storagePath: filename, signedUrl };
    };

    exports.getSignedUrlForFile = async (storagePath, expiresInMinutes = 15) => {
        if (!storagePath) return null;
        if (storagePath.startsWith('http')) return storagePath;
        return `https://test.storage.local/signed/${storagePath}`;
    };
} else {
    const { storage } = require('../utils/firebaseAdmin');
    const bucket = storage.bucket();

    const defaultUpload = async (file, folder, isPublic = false) => {
        if (!file || !file.buffer) throw new Error('No file buffer provided');

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
                const [signedUrl] = await fileRef.getSignedUrl({
                    action: 'read',
                    expires: '01-01-2100'
                });
                return { storagePath: filename, publicUrl: signedUrl };
            }
        } else {
            const [signedUrl] = await fileRef.getSignedUrl({
                action: 'read',
                expires: Date.now() + 15 * 60 * 1000
            });
            return { storagePath: filename, signedUrl };
        }
    };

    const defaultGetSignedUrl = async (storagePath, expiresInMinutes = 15) => {
        if (!storagePath) return null;
        if (storagePath.startsWith('http')) return storagePath;
        const fileRef = bucket.file(storagePath);
        const [signedUrl] = await fileRef.getSignedUrl({
            action: 'read',
            expires: Date.now() + expiresInMinutes * 60 * 1000
        });
        return signedUrl;
    };

    exports.uploadFileToFirebase = defaultUpload;
    exports.getSignedUrlForFile = defaultGetSignedUrl;
}
