import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { useTranslation } from 'react-i18next'; // Global standard localization ready
import { validateAndFormatPhone } from '../utils/validation';
import authService from '../services/authService';

export const SmartAuth = ({ activeTab, onSuccess, onError }) => {
    const { t } = useTranslation();
    const auth = getAuth();

    // State: 'idle' | 'email' | 'phone'
    const [authMethod, setAuthMethod] = useState('idle');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const setUpRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
        }
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        onError('');

        try {
            if (authMethod === 'email') {
                const credentials = { identifier, password };
                await authService.login(credentials, activeTab);
                onSuccess(activeTab);
            } else if (authMethod === 'phone' && !confirmationResult) {
                // Phone Auth - Send OTP
                const validation = validateAndFormatPhone(identifier);
                if (!validation.isValid) throw new Error(validation.error);

                setUpRecaptcha();
                const result = await signInWithPhoneNumber(auth, validation.formatted, window.recaptchaVerifier);
                setConfirmationResult(result);
            } else if (authMethod === 'phone' && confirmationResult) {
                // Phone Auth - Verify OTP
                const result = await confirmationResult.confirm(otp);
                const idToken = await result.user.getIdToken();

                // Send idToken to backend to exchange for local JWT
                await authService.loginWithFirebase({ idToken, role: activeTab });
                onSuccess(activeTab);
            }
        } catch (error) {
            onError(error.response?.data?.error || error.response?.data?.message || t('auth_error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container w-full">
            {authMethod === 'idle' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <button onClick={() => setAuthMethod('email')} className="btn-primary" style={{ padding: '12px', borderRadius: '8px' }}>
                        {t('continue_with_email')}
                    </button>
                    <button onClick={() => setAuthMethod('phone')} className="btn-secondary" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}>
                        {t('continue_with_phone')}
                    </button>
                </div>
            )}

            {authMethod !== 'idle' && (
                <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                    <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                        {authMethod === 'email' ? t('email_placeholder') : t('phone_placeholder')}
                    </label>
                    <input
                        type={authMethod === 'email' ? 'email' : 'tel'}
                        placeholder={authMethod === 'email' ? t('email_placeholder') : '+251911...'}
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                        required
                    />

                    {authMethod === 'email' && (
                        <>
                            <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>{t('password_placeholder') || t('password')}</label>
                            <input
                                type="password"
                                placeholder={t('password')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                                required
                            />
                        </>
                    )}

                    {authMethod === 'phone' && confirmationResult && (
                        <>
                            <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>{t('otp_placeholder') || t('enter_otp')}</label>
                            <input
                                type="text"
                                placeholder="123456"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                                required
                            />
                        </>
                    )}

                    <div id="recaptcha-container"></div>

                    <button type="submit" className="btn-primary" style={{ padding: '12px', borderRadius: '8px', marginTop: '10px' }} disabled={loading}>
                        {authMethod === 'phone' && !confirmationResult ? (loading ? t('sending') : t('send_otp')) : (loading ? t('logging_in') : t('sign_in'))}
                    </button>

                    <button type="button" onClick={() => { setAuthMethod('idle'); setConfirmationResult(null); }} style={{ fontSize: '0.85rem', color: '#666', background: 'none', border: 'none', cursor: 'pointer', marginTop: '5px' }}>
                        ← {t('change_login_method') || t('back')}
                    </button>
                </form>
            )}
        </div>
    );
};
