import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Mail, ArrowLeft, CheckCircle, Lock, ShieldCheck, HeartPulse } from 'lucide-react';
import authService from '../services/authService';
import { useToast } from '../components/Toast';
import Seo, { BRAND_EN } from '../components/Seo';

const ForgotPassword = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const addToast = useToast();

    const [identifier, setIdentifier] = useState('');
    const [step, setStep] = useState(1); // 1: Identify, 2: Answer & Reset
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleIdentifyUser = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await authService.forgotPassword(identifier);
            setSecurityQuestion(res.securityQuestion);
            setStep(2);
            addToast(t('user_identified') || 'User identified. Please answer your security question.', 'info');
        } catch (err) {
            const errMsg = err.response?.data?.error || 'User not found. Check your identifier.';
            setError(errMsg);
            addToast(errMsg, 'error');
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
            await authService.resetPassword({ identifier, securityAnswer, newPassword });
            setSuccess(true);
            addToast(t('password_reset_success_toast') || 'Password reset successfully!', 'success');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            const errMsg = err.response?.data?.error || 'Incorrect answer. Please try again.';
            setError(errMsg);
            addToast(errMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <Seo
            title={`Reset Password - ${BRAND_EN}`}
            description="Reset an EDWL account password."
            path="/forgot-password"
            noIndex
        />
        <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
            <div className="card reveal" style={{ width: '100%', maxWidth: '440px', padding: '40px', borderRadius: '24px', boxShadow: 'var(--shadow)' }}>

                {/* Icon Decor */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ 
                        background: success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0, 128, 128, 0.05)', 
                        width: '80px', height: '80px', borderRadius: '50%', 
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' 
                    }}>
                        {success ? <CheckCircle size={36} color="#10b981" /> : <KeyRound size={36} color="var(--primary)" />}
                    </div>
                </div>

                {success ? (
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ color: '#059669', marginBottom: '12px', fontWeight: '800' }}>{t('password_reset_success') || 'Success!'}</h2>
                        <p style={{ color: 'var(--text-light)', marginBottom: '32px' }}>{t('password_reset_msg') || 'Your password has been reset. Redirecting to login...'}</p>
                        <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: '100%', height: '100%', background: '#10b981', animation: 'progress 3s linear forwards' }}></div>
                        </div>
                    </div>
                ) : (
                    <>
                        <h2 style={{ textAlign: 'center', marginBottom: '8px', color: 'var(--text)', fontSize: '1.6rem', fontWeight: '800' }}>
                            {step === 1 ? (t('forgot_password') || 'Forgot Password?') : (t('security_check') || 'Security Check')}
                        </h2>
                        <p style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '1rem', marginBottom: '28px' }}>
                            {step === 1 
                                ? (t('forgot_password_desc') || "Enter your registered phone number or email to locate your account.")
                                : (t('security_confirm_desc') || "Please answer the question you set during registration.")}
                        </p>

                        {error && (
                            <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #fee2e2' }}>
                                {error}
                            </div>
                        )}

                        {step === 1 ? (
                            <form onSubmit={handleIdentifyUser} className="reveal delay-1">
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                                        {t('phone_or_email') || 'Phone Number or Email'}
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input
                                            type="text"
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            required
                                            placeholder={t('email_or_phone_placeholder') || 'email@example.com or +2519...'}
                                            style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }}
                                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn-primary" style={{ width: '100%', minHeight: '52px', fontWeight: '700', borderRadius: '12px' }} disabled={loading}>
                                    {loading ? t('searching') || 'Searching...' : t('identify_btn') || 'Identify Account'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword} className="reveal delay-1">
                                <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(0, 128, 128, 0.03)', borderRadius: '12px', border: '1px solid rgba(0, 128, 128, 0.1)' }}>
                                    <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary)', fontWeight: '700', marginBottom: '8px' }}>
                                        {t('security_question') || 'Security Question'}
                                    </div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text)' }}>
                                        {securityQuestion}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-light)' }}>{t('security_answer') || 'Your Answer'}</label>
                                    <div style={{ position: 'relative' }}>
                                        <ShieldCheck size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input
                                            type="text"
                                            value={securityAnswer}
                                            onChange={(e) => setSecurityAnswer(e.target.value)}
                                            required
                                            placeholder={t('answer_placeholder') || 'Enter your answer here...'}
                                            style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-light)' }}>{t('new_password') || 'New Password'}</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            placeholder="••••••••"
                                            style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '28px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-light)' }}>{t('confirm_password') || 'Confirm Password'}</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            placeholder="••••••••"
                                            style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="btn-primary" style={{ width: '100%', minHeight: '52px', fontWeight: '700', borderRadius: '12px' }} disabled={loading}>
                                    {loading ? t('resetting') || 'Resetting...' : t('reset_password_btn') || 'Reset Password'}
                                </button>
                                
                                <button 
                                    type="button" 
                                    onClick={() => setStep(1)} 
                                    style={{ width: '100%', marginTop: '16px', background: 'none', border: 'none', color: '#64748b', fontSize: '0.9rem', cursor: 'pointer', fontWeight: '600' }}
                                >
                                    {t('try_different_account') || 'Try a different account'}
                                </button>
                            </form>
                        )}

                        <div style={{ textAlign: 'center', marginTop: '28px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                            <Link to="/login" style={{ color: 'var(--primary)', fontSize: '0.95rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
                                <ArrowLeft size={16} />
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
        </>
    );
};

export default ForgotPassword;
