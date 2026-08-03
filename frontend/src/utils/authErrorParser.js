export const parseAuthError = (error, context = 'auth') => {
    const apiError = error?.response?.data?.error || error?.response?.data?.message;
    const status = error?.response?.status;
    const rawMessage = apiError || error?.message || 'An unexpected error occurred.';
    const text = String(rawMessage || '').trim();
    const lower = text.toLowerCase();

    const result = {
        messageKey: 'unexpected_error',
        messageDefault: text || 'An unexpected error occurred. Please try again.',
        isDuplicate: false,
        duplicateField: null
    };

    if (status === 401 || lower.includes('invalid credentials')) {
        result.messageKey = 'invalid_credentials';
        result.messageDefault = 'Invalid email/phone or password. Please check and try again.';
        return result;
    }

    if (status === 403 && lower.includes('suspended')) {
        result.messageKey = 'account_suspended';
        result.messageDefault = 'Your account has been suspended. Please contact support.';
        return result;
    }

    if (status === 429 || lower.includes('too many attempts') || lower.includes('rate limit')) {
        result.messageKey = 'too_many_attempts';
        result.messageDefault = 'Too many attempts. Please wait a few minutes and try again.';
        return result;
    }

    if (status === 409 || lower.includes('already registered') || lower.includes('already exists')) {
        result.isDuplicate = true;
        if (error?.response?.data?.duplicateField === 'phone' || lower.includes('phone')) {
            result.duplicateField = 'phone';
            result.messageKey = 'duplicate_phone_msg';
            result.messageDefault = 'This phone number is already registered. Please log in or reset your password.';
        } else if (error?.response?.data?.duplicateField === 'email' || lower.includes('email')) {
            result.duplicateField = 'email';
            result.messageKey = 'duplicate_email_msg';
            result.messageDefault = 'This email address is already registered. Please log in or reset your password.';
        } else {
            result.messageKey = 'duplicate_account_msg';
            result.messageDefault = 'An account already exists with this information. Please log in or reset your password.';
        }
        return result;
    }

    if (lower.includes('password must be at least 6') || lower.includes('at least 6 characters')) {
        result.messageKey = 'password_length_error';
        result.messageDefault = 'Password must be at least 6 characters long. Please choose a stronger password.';
        return result;
    }

    if (lower.includes('invalid phone number') || lower.includes('invalid ethiopian number') || lower.includes('phone number format')) {
        result.messageKey = 'invalid_phone_format';
        result.messageDefault = 'Invalid phone number format. Use 09... for local or +countrycode... for international phone numbers.';
        return result;
    }

    if (lower.includes('profile photo and id document')) {
        result.messageKey = 'missing_profile_photo_id_document';
        result.messageDefault = 'Profile photo and ID document are required for registration. Please upload both to continue.';
        return result;
    }

    if (lower.includes('must accept terms')) {
        result.messageKey = 'must_accept_terms';
        result.messageDefault = 'You must agree to the Terms & Conditions to register.';
        return result;
    }

    if (status === 400 && context === 'register') {
        result.messageKey = 'form_review_try_again';
        result.messageDefault = `${text} Please review the form and try again.`;
        return result;
    }

    if (status >= 500) {
        result.messageKey = 'server_error';
        result.messageDefault = 'Something went wrong on our side. Please try again later.';
        return result;
    }

    // Fall back to the backend message or a generic guidance message.
    result.messageKey = 'unexpected_error';
    result.messageDefault = text || 'An unexpected error occurred. Please try again.';
    return result;
};
