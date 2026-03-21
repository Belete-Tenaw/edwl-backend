const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

const normalizeEmail = (email) => {
    return email ? email.toLowerCase().trim() : null;
};

const normalizePhone = (phone) => {
    if (!phone) return null;
    const trimmed = phone.trim().replace(/\s+/g, '');
    
    // Ethiopia specific normalization
    if (/^(09|07)\d{8}$/.test(trimmed)) {
        return '+251' + trimmed.substring(1);
    } else if (/^\+251[79]\d{8}$/.test(trimmed)) {
        return trimmed;
    } else if (/^\+\d{7,15}$/.test(trimmed)) {
        return trimmed;
    }
    return trimmed; // Return as is if it doesn't match specific rules but is already in some + format
};

const hasRequiredFields = (obj, fields) => {
    const missing = [];
    fields.forEach(field => {
        if (!obj[field] || (typeof obj[field] === 'string' && obj[field].trim() === '')) {
            missing.push(field);
        }
    });
    return missing;
};

module.exports = {
    isValidEmail,
    normalizeEmail,
    normalizePhone,
    hasRequiredFields
};
