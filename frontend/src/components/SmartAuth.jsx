import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { validateAndFormatPhone } from '../utils/validation';
import { parseAuthError } from '../utils/authErrorParser';
import authService from '../services/authService';

/**
 * SmartAuth Component
 * Handles unified authentication: Email + Password or Phone + Password.
 * Unified single input field for better UX.
 */
export const SmartAuth = ({ activeTab, onSuccess, onError, initialIdentifier = '' }) => {
    const { t } = useTranslation();
    
    // Diagnostic log to verify translation loading in production
    useEffect(() => {
    }, [t]);

    const [identifier, setIdentifier] = useState(initialIdentifier);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialIdentifier) {
            setIdentifier(initialIdentifier);
        }
    }, [initialIdentifier]);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (onError) onError('');

        try {
            let loginIdentifier = identifier.trim();

            // Check if input looks like a phone number (contains numbers, maybe starts with +)
            // If it doesn't have an '@', assume it's a phone number and validate/format it
            if (!loginIdentifier.includes('@') && /[0-9]/.test(loginIdentifier)) {
                const validation = validateAndFormatPhone(loginIdentifier);
                // We'll let the backend reject it if it's completely invalid, but format if possible
                if (validation.isValid) {
                    loginIdentifier = validation.formatted;
                }
            }

            // Both methods now use standard identifier + password
            const credentials = { identifier: loginIdentifier, password };
            await authService.login(credentials, activeTab);
            
            onSuccess(activeTab);
            
        } catch (error) {
            console.error('SmartAuth Error:', error);
            const parsed = parseAuthError(error, 'login');
            if (onError) onError(t(parsed.messageKey, parsed.messageDefault));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container w-full">
            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                    {t('phone_or_email', 'Phone Number or Email')}
                </label>
                <input
                    type="text"
                    placeholder={t('email_or_phone_placeholder', 'email@example.com or 09...')}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                    required
                    disabled={loading}
                    autoComplete="username"
                />

                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>{t('password_placeholder', 'Password')}</label>
                <input
                    type="password"
                    placeholder={t('password_placeholder', 'Password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                    required
                    disabled={loading}
                    autoComplete="current-password"
                />

                <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ padding: '14px', borderRadius: '10px', marginTop: '10px', fontSize: '1rem', fontWeight: '700' }} 
                    disabled={loading}
                >
                    {loading ? t('logging_in', 'Logging in...') : t('login', 'Login')}
                </button>
            </form>
        </div>
    );
};
