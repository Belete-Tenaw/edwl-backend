import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { useTranslation } from 'react-i18next';
import { validateAndFormatPhone } from '../utils/validation';
import authService from '../services/authService';

/**
 * SmartAuth Component
 * Handles unified authentication: Email + Password or Phone + Password.
 * Firebase OTP and reCAPTCHA have been removed intentionally for reliability.
 */
export const SmartAuth = ({ activeTab, onSuccess, onError }) => {
    const { t } = useTranslation();
    
    // Diagnostic log to verify translation loading in production
    useEffect(() => {
        console.log('SmartAuth: Translations active?', t('phone_placeholder') !== 'phone_placeholder');
    }, [t]);

    // State: 'idle' | 'email' | 'phone'
    const [authMethod, setAuthMethod] = useState('idle');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        onError('');

        try {
            let loginIdentifier = identifier;

            // If phone method, we validate and format it first
            if (authMethod === 'phone') {
                const validation = validateAndFormatPhone(identifier);
                if (!validation.isValid) throw new Error(validation.error);
                loginIdentifier = validation.formatted;
            }

            console.log(`SmartAuth: Attempting login for [${authMethod}] method:`, loginIdentifier);
            
            // Both methods now use standard identifier + password
            const credentials = { identifier: loginIdentifier, password };
            await authService.login(credentials, activeTab);
            
            console.log('SmartAuth: Login successful');
            onSuccess(activeTab);
            
        } catch (error) {
            console.error('SmartAuth Error:', error);
            
            // Map common error patterns to translated messages with robust fallbacks
            let errorMessage = '';
            const apiError = error.response?.data?.error || error.response?.data?.message;
            
            if (apiError === 'Invalid credentials' || error.message === 'Invalid credentials') {
                errorMessage = t('invalid_credentials', 'Invalid email/phone or password. Please check and try again.');
            } else if (error.message.includes('Invalid phone number')) {
                errorMessage = t('invalid_phone', 'Please enter a valid phone number (e.g. 09... or +251...)');
            } else {
                errorMessage = apiError || error.message || t('auth_error', 'Authentication failed. Please try again.');
            }
            
            onError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container w-full">
            {/* Primary Selection: Step 1 */}
            {authMethod === 'idle' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <button 
                        onClick={() => setAuthMethod('email')} 
                        className="btn-primary" 
                        style={{ padding: '14px', borderRadius: '10px', fontWeight: '600' }}
                    >
                        {t('continue_with_email', 'Continue with Email')}
                    </button>
                    <button 
                        onClick={() => setAuthMethod('phone')} 
                        className="btn-secondary" 
                        style={{ padding: '14px', borderRadius: '10px', border: '1px solid #ccc', fontWeight: '600', background: 'white' }}
                    >
                        {t('continue_with_phone', 'Continue with Phone Number')}
                    </button>
                </div>
            )}

            {/* Input Form: Step 2 */}
            {authMethod !== 'idle' && (
                <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                    <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                        {authMethod === 'email' ? t('email_placeholder', 'Email Address') : t('phone_placeholder', 'Phone Number')}
                    </label>
                    <input
                        type={authMethod === 'email' ? 'email' : 'tel'}
                        placeholder={authMethod === 'email' ? t('email_placeholder', 'Email Address') : (t('phone_hint', 'Enter Phone (e.g. 09...)'))}
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                        required
                        disabled={loading}
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
                    />

                    <button 
                        type="submit" 
                        className="btn-primary" 
                        style={{ padding: '14px', borderRadius: '10px', marginTop: '10px', fontSize: '1rem', fontWeight: '700' }} 
                        disabled={loading}
                    >
                        {loading ? t('logging_in', 'Logging in...') : t('login', 'Login')}
                    </button>

                    <button 
                        type="button" 
                        onClick={() => { setAuthMethod('idle'); onError(''); }} 
                        style={{ fontSize: '0.85rem', color: '#666', background: 'none', border: 'none', cursor: 'pointer', marginTop: '5px' }}
                    >
                        ← {t('change_login_method', 'Change login method')}
                    </button>
                </form>
            )}
        </div>
    );
};
