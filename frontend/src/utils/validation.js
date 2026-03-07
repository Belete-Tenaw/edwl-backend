/**
 * Utility for intelligent phone number validation and formatting.
 * Specifically optimized for the Ethiopian context while supporting international numbers.
 */

export const validateAndFormatPhone = (phone) => {
    if (!phone) return { isValid: false, formatted: '', error: 'Phone number is required' };

    const trimmed = phone.trim().replace(/\s+/g, '');

    // Ethiopian Mobile Numbers: 09... or 07... (9 digits after prefix)
    const ethiopianLocalRegex = /^(09|07)\d{8}$/;

    // Ethiopian International: +2519... or +2517...
    const ethiopianIntlRegex = /^\+251[79]\d{8}$/;

    // General International: Must start with + and have 7-15 digits
    const generalIntlRegex = /^\+\d{7,15}$/;

    if (ethiopianLocalRegex.test(trimmed)) {
        // Convert 09... to +2519...
        return {
            isValid: true,
            formatted: '+251' + trimmed.substring(1),
            type: 'ETHIOPIAN_LOCAL'
        };
    }

    if (ethiopianIntlRegex.test(trimmed)) {
        return {
            isValid: true,
            formatted: trimmed,
            type: 'ETHIOPIAN_INTL'
        };
    }

    if (generalIntlRegex.test(trimmed)) {
        return {
            isValid: true,
            formatted: trimmed,
            type: 'INTERNATIONAL'
        };
    }

    // Error cases
    if (trimmed.startsWith('0') && !ethiopianLocalRegex.test(trimmed)) {
        return { isValid: false, error: 'Invalid Ethiopian number. Format: 09... or 07... (10 digits)' };
    }

    if (!trimmed.startsWith('+') && !trimmed.startsWith('0')) {
        return { isValid: false, error: 'Use 09... for local or +countrycode... for international' };
    }

    return { isValid: false, error: 'Invalid phone number format' };
};
