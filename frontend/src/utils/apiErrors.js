export const getFriendlyApiError = (error, t, fallbackKey = 'auth_error') => {
    const apiError = error?.response?.data?.error || error?.response?.data?.message;
    const status = error?.response?.status;

    if (status === 401 || apiError === 'Invalid credentials') {
        return t('invalid_credentials', 'Invalid email/phone or password. Please check and try again.');
    }

    if (status === 409) {
        return apiError || t('duplicate_account_title', 'Account already exists.');
    }

    if (status === 413) {
        return t('upload_too_large', 'The file is too large. Please choose a smaller photo, document, or video.');
    }

    if (status === 429) {
        return t('too_many_requests', 'Too many attempts. Please wait a few minutes and try again.');
    }

    if (!error?.response) {
        return t(
            'secure_connection_unavailable',
            'EDWL could not reach the secure service. Please check your internet connection, refresh, and try again.'
        );
    }

    return apiError || error?.message || t(fallbackKey, 'Something went wrong. Please try again.');
};

export const isConnectionError = (error) => !error?.response;
