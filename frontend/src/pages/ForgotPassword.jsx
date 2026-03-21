import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Mail, ArrowLeft, CheckCircle, Lock, ShieldCheck } from 'lucide-react';
import authService from '../services/authService';

const ForgotPassword = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState('');
    const [step, setStep] = useState(1); // 1: Request, 2: Reset
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleRequestReset = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authService.forgotPassword(identifier);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send reset code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError(t('passwords_do_not_match') || 'Passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            setError(t('password_too_short') || 'Password must be at least 6 characters');
            return;
        }

        setError('');
        setLoading(true);

        try {
            await authService.resetPassword({ identifier, token, newPassword });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password. Check your code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
            <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>

                {/* Icon */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ background: '#fff0e6', width: '72px', height: '72px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                        {success ? <CheckCircle size={32} color="#2e7d32" /> : <KeyRound size={32} color="var(--primary)" />}
                    </div>
                </div>

                {success ? (
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ color: '#2e7d32', marginBottom: '12px' }}>{t('password_reset_success') || 'Success!'}</h2>
                        <p style={{ color: '#666', marginBottom: '24px' }}>{t('password_reset_msg') || 'Your password has been reset. Redirecting to login...'}</p>
                        <div className="loading-bar" style={{ height: '4px', background: '#eee', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: '100%', height: '100%', background: '#2e7d32', animation: 'progress 3s linear' }}></div>
                        </div>
                    </div>
                ) : (
                    <>
                        <h2 style={{ textAlign: 'center', marginBottom: '8px', color: 'var(--primary)', fontSize: '1.5rem' }}>
                            {step === 1 ? (t('forgot_password') || 'Forgot Password?') : (t('reset_password_title') || 'Reset Password')}
                        </h2>
                        <p style={{ textAlign: 'center', color: '#666', fontSize: '0.95rem', marginBottom: '28px' }}>
                            {step === 1 
                                ? (t('forgot_password_desc') || "Enter your registered phone number or email to receive a reset code.")
                                : (t('reset_password_desc') || "Enter the 6-character code sent to you and choose a new password.")}
                        </p>

                        {error && (
                            <div style={{ background: '#ffeeee', color: '#cc0000', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center' }}>
                                {error}
                            </div>
                        )}

                        {step === 1 ? (
                            <form onSubmit={handleRequestReset}>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>
                                        {t('phone_or_email') || 'Phone Number or Email'}
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                        <input
                                            type="text"
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            required
                                            placeholder={t('email_or_phone_placeholder') || 'email@example.com or +2519...'}
                                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn-primary" style={{ width: '100%', minHeight: '48px', fontWeight: '700' }} disabled={loading}>
                                    {loading ? t('sending') : t('send_reset_code') || 'Send Reset Code'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword}>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>{t('reset_code') || 'Verification Code'}</label>
                                    <div style={{ position: 'relative' }}>
                                        <ShieldCheck size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                        <input
                                            type="text"
                                            value={token}
                                            onChange={(e) => setToken(e.target.value.toUpperCase())}
                                            required
                                            maxLength={6}
                                            placeholder="XXXXXX"
                                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '4px' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>{t('new_password') || 'New Password'}</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            placeholder="••••••••"
                                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>{t('confirm_password') || 'Confirm New Password'}</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            placeholder="••••••••"
                                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="btn-primary" style={{ width: '100%', minHeight: '48px', fontWeight: '700' }} disabled={loading}>
                                    {loading ? t('resetting') : t('reset_password_btn') || 'Reset Password'}
                                </button>
                                
                                <button 
                                    type="button" 
                                    onClick={() => setStep(1)} 
                                    style={{ width: '100%', marginTop: '12px', background: 'none', border: 'none', color: '#666', fontSize: '0.9rem', cursor: 'pointer' }}
                                >
                                    {t('resend_code') || 'Did not receive code? Try again'}
                                </button>
                            </form>
                        )}

                        <div style={{ textAlign: 'center', marginTop: '24px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                            <Link to="/login" style={{ color: '#666', fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <ArrowLeft size={14} />
                                {t('back_to_login') || 'Back to Login'}
                            </Link>
                        </div>
                    </>
                )}
            </div>
            <style>{`
                @keyframes progress { from { width: 0; } to { width: 100%; } }
            `}</style>
        </div>
    );
};

export default ForgotPassword;
