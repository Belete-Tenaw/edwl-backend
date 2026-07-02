/**
 * ========================================
 * Input Validation Utility (v2.0)
 * ========================================
 * Comprehensive validation for all user inputs
 * Prevents: SQL injection, XSS, path traversal, etc.
 */

const { sanitizeInput } = require('../config/security');

/**
 * Validation Rules Registry
 */
const VALIDATION_RULES = {
  // Email validation
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 254,
    errorMessage: 'Invalid email address'
  },

  // Phone validation (Ethiopian format)
  phone: {
    pattern: /^(\+251|0)?9\d{8}$/,
    maxLength: 13,
    errorMessage: 'Invalid phone number. Use format: 0912345678 or +251912345678'
  },

  // Username (alphanumeric, dash, underscore)
  username: {
    pattern: /^[a-zA-Z0-9_-]{3,32}$/,
    maxLength: 32,
    minLength: 3,
    errorMessage: 'Username must be 3-32 characters (alphanumeric, dash, underscore)'
  },

  // UUID v4
  uuid: {
    pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    errorMessage: 'Invalid UUID format'
  },

  // URL
  url: {
    pattern: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
    maxLength: 2048,
    errorMessage: 'Invalid URL'
  },

  // Date (YYYY-MM-DD)
  date: {
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    errorMessage: 'Invalid date format. Use YYYY-MM-DD'
  },

  // Amharic text
  amharic: {
    pattern: /[\u1200-\u137F]/,
    maxLength: 500,
    errorMessage: 'Invalid Amharic text'
  },

  // English text (letters, numbers, spaces, basic punctuation)
  englishText: {
    pattern: /^[a-zA-Z0-9\s.,!?-]*$/,
    maxLength: 500,
    errorMessage: 'Invalid English text. No special characters allowed'
  },

  // Numeric
  numeric: {
    pattern: /^\d+$/,
    errorMessage: 'Must be numeric'
  },

  // Currency (Ethiopian Birr)
  currency: {
    pattern: /^\d+(\.\d{2})?$/,
    errorMessage: 'Invalid currency format. Use: 123.45'
  },

  // ID Number (Passport, ID card)
  idNumber: {
    pattern: /^[A-Z0-9]{6,20}$/,
    errorMessage: 'Invalid ID number format'
  },

  // Job title
  jobTitle: {
    pattern: /^[a-zA-Z\s]{3,100}$/,
    maxLength: 100,
    errorMessage: 'Invalid job title'
  },

  // Skills (comma-separated)
  skills: {
    pattern: /^[a-zA-Z,\s]+$/,
    maxLength: 500,
    errorMessage: 'Invalid skills format. Use comma-separated values'
  },
};

/**
 * Validate input against a rule
 * @param {string} value - Value to validate
 * @param {string} ruleName - Name of validation rule
 * @returns {object} { valid: boolean, error?: string }
 */
function validateByRule(value, ruleName) {
  if (!VALIDATION_RULES[ruleName]) {
    throw new Error(`Validation rule not found: ${ruleName}`);
  }

  const rule = VALIDATION_RULES[ruleName];

  // Check required
  if (!value) {
    return { valid: false, error: `${ruleName} is required` };
  }

  // Check type
  if (typeof value !== 'string' && typeof value !== 'number') {
    return { valid: false, error: `${ruleName} must be string or number` };
  }

  // Convert to string if number
  const strValue = String(value).trim();

  // Check length
  if (rule.minLength && strValue.length < rule.minLength) {
    return { valid: false, error: `${ruleName} too short. Minimum ${rule.minLength} characters` };
  }

  if (rule.maxLength && strValue.length > rule.maxLength) {
    return { valid: false, error: `${ruleName} too long. Maximum ${rule.maxLength} characters` };
  }

  // Check pattern
  if (rule.pattern && !rule.pattern.test(strValue)) {
    return { valid: false, error: rule.errorMessage };
  }

  return { valid: true };
}

/**
 * Validate email
 */
function validateEmail(email) {
  return validateByRule(email, 'email');
}

/**
 * Validate phone (Ethiopian)
 */
function validatePhone(phone) {
  return validateByRule(phone, 'phone');
}

/**
 * Validate password strength
 */
function validatePasswordStrength(password) {
  const errors = [];

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Must contain lowercase letters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Must contain uppercase letters');
  }

  if (!/\d/.test(password)) {
    errors.push('Must contain numbers');
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Must contain special characters (!@#$%^&*)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate UUID
 */
function validateUUID(uuid) {
  return validateByRule(uuid, 'uuid');
}

/**
 * Validate URL
 */
function validateURL(url) {
  return validateByRule(url, 'url');
}

/**
 * Validate date format
 */
function validateDate(date) {
  const result = validateByRule(date, 'date');

  if (result.valid) {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return { valid: false, error: 'Invalid date' };
    }
  }

  return result;
}

/**
 * Validate age (must be at least minAge)
 */
function validateAge(birthDate, minAge = 18) {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  if (age < minAge) {
    return { valid: false, error: `Must be at least ${minAge} years old` };
  }

  return { valid: true };
}

/**
 * Sanitize and validate profile data
 */
function validateProfileData(data) {
  const errors = {};

  if (data.email) {
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.valid) {
      errors.email = emailValidation.error;
    }
  }

  if (data.phone) {
    const phoneValidation = validatePhone(data.phone);
    if (!phoneValidation.valid) {
      errors.phone = phoneValidation.error;
    }
  }

  if (data.firstName) {
    const first = sanitizeInput(data.firstName);
    if (first.length < 2) {
      errors.firstName = 'First name too short';
    }
  }

  if (data.lastName) {
    const last = sanitizeInput(data.lastName);
    if (last.length < 2) {
      errors.lastName = 'Last name too short';
    }
  }

  if (data.jobTitle) {
    const jobValidation = validateByRule(data.jobTitle, 'jobTitle');
    if (!jobValidation.valid) {
      errors.jobTitle = jobValidation.error;
    }
  }

  if (data.skills && Array.isArray(data.skills)) {
    if (data.skills.length > 20) {
      errors.skills = 'Maximum 20 skills allowed';
    }
  }

  if (data.bio) {
    if (data.bio.length > 500) {
      errors.bio = 'Bio too long. Maximum 500 characters';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate job post data
 */
function validateJobPostData(data) {
  const errors = {};

  if (!data.title || data.title.length < 5) {
    errors.title = 'Job title too short. Minimum 5 characters';
  }

  if (!data.description || data.description.length < 20) {
    errors.description = 'Description too short. Minimum 20 characters';
  }

  if (data.salary) {
    const salaryValidation = validateByRule(data.salary, 'currency');
    if (!salaryValidation.valid) {
      errors.salary = salaryValidation.error;
    }
  }

  if (!data.location || data.location.length < 3) {
    errors.location = 'Invalid location';
  }

  if (!data.jobType || !['Full-time', 'Part-time', 'Contract'].includes(data.jobType)) {
    errors.jobType = 'Invalid job type';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Sanitize batch data
 */
function sanitizeBatch(data) {
  const sanitized = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(v => typeof v === 'string' ? sanitizeInput(v) : v);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

module.exports = {
  VALIDATION_RULES,
  validateByRule,
  validateEmail,
  validatePhone,
  validatePasswordStrength,
  validateUUID,
  validateURL,
  validateDate,
  validateAge,
  validateProfileData,
  validateJobPostData,
  sanitizeBatch,
};
