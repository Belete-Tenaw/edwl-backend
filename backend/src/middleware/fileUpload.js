/**
 * ========================================
 * Secure File Upload Middleware
 * ========================================
 * Implements file validation, scanning, and security checks
 */

const fileType = require('file-type');
const { UPLOAD_CONFIG, sanitizeErrorMessage } = require('../config/security');

/**
 * Validate file upload
 * Checks: size, MIME type, extension, magic bytes
 */
const validateFileUpload = async (req, res, next) => {
  if (!req.file) {
    return next();  // No file attached, continue
  }

  const file = req.file;

  // 1. Check file size
  if (file.size > UPLOAD_CONFIG.maxFileSize) {
    return res.status(400).json({
      error: `File too large. Maximum size is ${UPLOAD_CONFIG.maxFileSize / 1024 / 1024}MB`,
      code: 'FILE_TOO_LARGE',
    });
  }

  // 2. Check file extension
  const fileExtension = `.${file.originalname.split('.').pop()}`.toLowerCase();
  if (!UPLOAD_CONFIG.allowedExtensions.includes(fileExtension)) {
    return res.status(400).json({
      error: `File type not allowed. Allowed types: ${UPLOAD_CONFIG.allowedExtensions.join(', ')}`,
      code: 'FILE_TYPE_NOT_ALLOWED',
    });
  }

  // 3. Check MIME type
  if (!UPLOAD_CONFIG.allowedMimeTypes.includes(file.mimetype)) {
    return res.status(400).json({
      error: 'Invalid file type detected',
      code: 'INVALID_MIME_TYPE',
    });
  }

  // 4. Check magic bytes (file signature)
  try {
    const type = await fileType.fromBuffer(file.buffer);
    
    if (!type) {
      return res.status(400).json({
        error: 'Could not determine file type. File may be corrupted.',
        code: 'INVALID_FILE_FORMAT',
      });
    }

    // Verify MIME type matches magic bytes
    if (!UPLOAD_CONFIG.allowedMimeTypes.includes(type.mime)) {
      return res.status(400).json({
        error: 'File signature does not match declared type',
        code: 'FILE_SIGNATURE_MISMATCH',
      });
    }

    // Attach validated type to request
    file.validatedMimeType = type.mime;
  } catch (error) {
    console.error('File type detection error:', error);
    return res.status(500).json({
      error: 'Could not validate file',
      code: 'FILE_VALIDATION_ERROR',
    });
  }

  // 5. Check for suspicious content
  if (containsSuspiciousContent(file.originalname)) {
    return res.status(400).json({
      error: 'File name contains suspicious characters',
      code: 'SUSPICIOUS_FILENAME',
    });
  }

  // Mark file as validated
  req.file.validated = true;
  next();
};

/**
 * Check filename for suspicious content
 */
function containsSuspiciousContent(filename) {
  const suspiciousPatterns = [
    /\.exe$|\.bat$|\.cmd$|\.com$/i,  // Executables
    /\.dll$|\.sys$|\.drv$/i,         // System files
    /\.vbs$|\.js$|\.jse$/i,          // Scripts (except JSON)
    /\.\.\//,                         // Path traversal
    /[<>:"|?*]/,                     // Invalid filename chars
    /^\.+$/,                         // Only dots
  ];

  return suspiciousPatterns.some(pattern => pattern.test(filename));
}

/**
 * Sanitize filename for storage
 */
const sanitizeFilename = (originalname) => {
  return originalname
    .replace(/[^a-zA-Z0-9._-]/g, '_')  // Replace invalid chars
    .replace(/\.+/g, '.')               // Remove multiple dots
    .substring(0, 255);                 // Limit length
};

/**
 * Generate secure filename with timestamp
 */
const generateSecureFilename = (originalname) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const ext = originalname.split('.').pop();
  const sanitized = sanitizeFilename(originalname.substring(0, 100));
  
  return `${timestamp}-${random}-${sanitized}`;
};

/**
 * Validate multiple file uploads
 */
const validateMultipleFileUploads = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  // Check total file count
  if (req.files.length > 10) {
    return res.status(400).json({
      error: 'Too many files. Maximum 10 files per upload.',
      code: 'TOO_MANY_FILES',
    });
  }

  // Validate each file
  for (const file of req.files) {
    try {
      const type = await fileType.fromBuffer(file.buffer);
      
      if (!type || !UPLOAD_CONFIG.allowedMimeTypes.includes(type.mime)) {
        return res.status(400).json({
          error: `File "${file.originalname}" has invalid type`,
          code: 'INVALID_FILE_IN_BATCH',
        });
      }

      if (containsSuspiciousContent(file.originalname)) {
        return res.status(400).json({
          error: `File "${file.originalname}" has suspicious name`,
          code: 'SUSPICIOUS_FILENAME_IN_BATCH',
        });
      }

      file.validated = true;
    } catch (error) {
      return res.status(400).json({
        error: `Could not validate file "${file.originalname}"`,
        code: 'FILE_VALIDATION_ERROR',
      });
    }
  }

  next();
};

/**
 * Virus scan placeholder (integrate with ClamAV, VirusTotal, etc.)
 */
const scanFileForVirus = async (fileBuffer, filename) => {
  // TODO: Integrate with ClamAV or VirusTotal API
  // For now, return mock implementation
  console.log(`Scanning file: ${filename}`);
  
  // In production, call actual virus scanner:
  // const isSafe = await clamav.scan(fileBuffer);
  // if (!isSafe) throw new Error('File contains malware');
  
  return true;
};

/**
 * Error handler for file upload errors
 */
const handleFileUploadError = (error, req, res, next) => {
  if (error.code === 'FILE_TOO_LARGE') {
    return res.status(400).json({
      error: 'File is too large',
      code: 'FILE_TOO_LARGE',
    });
  }

  if (error.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      error: 'Too many files uploaded',
      code: 'LIMIT_FILE_COUNT',
    });
  }

  res.status(500).json({
    error: sanitizeErrorMessage(error),
    code: 'UPLOAD_ERROR',
  });
};

module.exports = {
  validateFileUpload,
  validateMultipleFileUploads,
  sanitizeFilename,
  generateSecureFilename,
  scanFileForVirus,
  handleFileUploadError,
  containsSuspiciousContent,
};
