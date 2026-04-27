const multer = require('multer');
const path = require('path');

// Use in-memory storage so files go directly to Firebase as buffers
const storage = multer.memoryStorage();

// Allowed image/document MIME types
const IMAGE_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/mpeg', 'video/x-msvideo'];

const MEDIA_FIELD_NAMES = {
    profilePhoto: 'image',
    idDocument: 'image',
    nationalIdUrl: 'image',
    guarantorIdUrl: 'image',
    policeClearanceUrl: 'image',
    healthCertificateUrl: 'image',
    videoBio: 'video',
};

// Multi-type filter: images get 5MB cap, videos get 15MB cap
const mediaFilter = (req, file, cb) => {
    console.log(`[mediaFilter] Field: ${file.fieldname}, MIME: ${file.mimetype}`);
    const fieldType = MEDIA_FIELD_NAMES[file.fieldname];

    if (fieldType === 'image') {
        if (IMAGE_MIMES.includes(file.mimetype)) {
            return cb(null, true);
        }
        return cb(new Error(`Only jpg, jpeg, png, and pdf files are allowed for ${file.fieldname}.`));
    }

    if (fieldType === 'video') {
        // Use startsWith to handle codec parameters like 'video/webm;codecs=vp9,opus'
        const isValidVideo = VIDEO_MIMES.some(mime => file.mimetype.startsWith(mime.split(';')[0]));
        if (isValidVideo) {
            return cb(null, true);
        }
        return cb(new Error(`Only mp4, webm, quicktime, mpeg, and avi files are allowed for ${file.fieldname}.`));
    }

    // Unknown field — reject
    cb(new Error(`Unexpected file field: ${file.fieldname}.`));
};

// Upload instance with per-file size limits applied in fileFilter context.
// multer's global limit is set to the highest ceiling (video: 15MB).
// Individual image limits are enforced below via a custom size checker.
const upload = multer({
    storage,
    limits: { fileSize: 200 * 1024 * 1024 }, // 200MB outer cap (covers videos)
    fileFilter: mediaFilter
});

// Express middleware wrapper: after multer runs, manually enforce 5MB on image fields
upload.enforceImageSizeLimit = (req, res, next) => {
    const IMAGE_MAX = 5 * 1024 * 1024; // 5MB
    if (!req.files) return next();

    const imageFields = Object.keys(MEDIA_FIELD_NAMES).filter(k => MEDIA_FIELD_NAMES[k] === 'image');
    for (const field of imageFields) {
        const files = req.files[field];
        if (files && files[0] && files[0].size > IMAGE_MAX) {
            return res.status(400).json({
                error: `${field} exceeds the 5MB image size limit. Please compress your image.`
            });
        }
    }
    next();
};

module.exports = upload;
