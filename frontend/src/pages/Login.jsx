import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import { User, Briefcase, ShieldCheck, Lock, Mail, Phone, ArrowRight, MessageSquare, LogIn, KeyRound } from 'lucide-react';
import { auth } from '../firebase';
import { SmartAuth } from '../components/SmartAuth';
import { parseAuthError } from '../utils/authErrorParser';

const Login = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('seeker'); // seeker, employer, admin
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ identifier: '', password: '' });

    // Show polite duplicate banner when redirected from Register with ?duplicate=1
    const searchParams = new URLSearchParams(location.search);
    const isDuplicateRedirect = searchParams.get('duplicate') === '1';
    const duplicateField = searchParams.get('field') || '';
    const initialIdentifier = searchParams.get('identifier') || '';
    const initialRole = searchParams.get('role') || '';

    useEffect(() => {
        if (initialIdentifier) {
            setFormData(prev => ({ ...prev, identifier: initialIdentifier }));
        }
    }, [initialIdentifier]);

    useEffect(() => {
        if (initialRole && ['seeker', 'employer', 'admin'].includes(initialRole)) {
            setActiveTab(initialRole);
        }
    }, [initialRole]);


    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setError('');
        setFormData({ identifier: '', password: '' });
    };

    const handleLoginSuccess = (role) => {
        const redirect = new URLSearchParams(location.search).get('redirect');
        if (redirect) {
            navigate(`/${redirect}`);
            return;
        }
        
        if (role === 'seeker') navigate('/dashboard/seeker');
        else if (role === 'employer') navigate('/dashboard/employer');
        else if (role === 'admin') navigate('/admin');
    };

    const handleAdminSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authService.login({ identifier: formData.identifier, password: formData.password }, 'admin');
            navigate('/admin');
        } catch (err) {
            const parsed = parseAuthError(err, 'login');
            setError(t(parsed.messageKey, parsed.messageDefault));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
            <div className="card" style={{ width: '100%', maxWidth: '450px', padding: '40px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--primary)' }}>{t('login')}</h2>

                <div className="tabs-container" style={{ display: 'flex', marginBottom: '30px', background: '#f0f0f0', borderRadius: '12px', padding: '5px' }}>
                    {['seeker', 'employer', 'admin'].map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => handleTabChange(tab)}
                            style={{
                                flex: 1,
                                padding: '10px',
                                background: activeTab === tab ? 'white' : 'transparent',
                                color: activeTab === tab ? 'var(--primary)' : '#666',
                                borderRadius: '8px',
                                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '0.9rem',
                                border: 'none', cursor: 'pointer', boxShadow: activeTab === tab ? '0 2px 5px rgba(0,0,0,0.1)' : 'none'
                            }}
                        >
                            {tab === 'seeker' ? <User size={16} /> : tab === 'employer' ? <Briefcase size={16} /> : <ShieldCheck size={16} />}
                            {t(tab === 'seeker' ? 'worker' : tab)}
                        </button>
                    ))}
                </div>

                {/* Polite duplicate account banner — shown when redirected from Register */}
                {isDuplicateRedirect && (
                    <div className="duplicate-banner">
                        <h4>⚠️ {t('duplicate_account_title') || 'Account Already Exists'}</h4>
                        <p style={{ marginBottom: '10px' }}>
                            {duplicateField === 'phone'
                                ? (t('duplicate_phone_msg') || 'This phone number is already registered in EDWL.')
                                : (t('duplicate_email_msg') || 'This email address is already registered in EDWL.')}
                        </p>
                        <p style={{ marginBottom: '10px' }}>
                            {t('duplicate_account_guidance') || 'If this is your account, please log in. If you forgot your password, you can reset it.'}
                        </p>
                        {initialIdentifier && (
                            <p style={{ marginBottom: '10px', fontWeight: '500', color: '#333' }}>
                                {t('duplicate_account_banner_note') || 'We found an existing account for the identifier you entered. Please log in with that email or phone number.'}
                            </p>
                        )}
                    </div>
                )}

                {error && (
                    <div style={{ background: '#ffeeee', color: '#cc0000', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                {activeTab !== 'admin' ? (
                    <SmartAuth activeTab={activeTab} onSuccess={handleLoginSuccess} onError={setError} initialIdentifier={initialIdentifier} />
                ) : (
                    <form onSubmit={handleAdminSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>
                                {t('username_or_email') || 'Username or Email'}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                <input
                                    type="text"
                                    name="identifier"
                                    value={formData.identifier}
                                    onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                                    placeholder={t('enter_username_or_email') || 'Enter username or email'}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>{t('password')}</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                                    placeholder={t('password')}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
                            disabled={loading}
                        >
                            {loading ? t('logging_in') : t('login')} <ArrowRight size={18} />
                        </button>
                    </form>
                )}

                {/* Forgot Password link */}
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <Link
                        to="/forgot-password"
                        id="forgot-password-link"
                        style={{ color: '#666', fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                        <KeyRound size={14} />
                        {t('forgot_password') || 'Forgot Password?'}
                    </Link>
                </div>

                {/* Create account nudge */}
                <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem', color: '#666', borderTop: '1px solid #eee', paddingTop: '16px' }}>
                    {t('no_account')}{' '}
                    <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
                        {t('register')}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
