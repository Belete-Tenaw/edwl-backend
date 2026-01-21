
const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
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
    hasRequiredFields
};
