const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage
const storage = multer.memoryStorage();

// File filter for images and PDFs only
const imageFilter = (req, file, cb) => {
    // Allow only jpg, jpeg, png, and pdf
    const allowedExtensions = /jpeg|jpg|png|pdf/;
    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedExtensions.test(file.mimetype) ||
        file.mimetype === 'application/pdf';

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only jpg, jpeg, png, and pdf files are allowed.'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: imageFilter
});

module.exports = upload;
