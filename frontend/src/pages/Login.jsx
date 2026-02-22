import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { User, Briefcase, ShieldCheck, Lock, Mail, Phone, ArrowRight, MessageSquare } from 'lucide-react';
import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const Login = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('seeker'); // seeker, employer, admin
    const [loginMethod, setLoginMethod] = useState('password'); // password, phone
    const [formData, setFormData] = useState({
        identifier: '', // email or phone
        password: '',
        username: '', // for admin
        phone: '',
        otp: ''
    });
    const [verificationId, setVerificationId] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (loginMethod === 'phone' && !window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': (response) => {
                    console.log('Recaptcha verified');
                }
            });
        }
    }, [loginMethod]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setError('');
        setFormData({ identifier: '', password: '', username: '', phone: '', otp: '' });
        setVerificationId(null);
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const appVerifier = window.recaptchaVerifier;
            const confirmationResult = await signInWithPhoneNumber(auth, formData.phone, appVerifier);
            setVerificationId(confirmationResult);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginWithOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await verificationId.confirm(formData.otp);
            const idToken = await result.user.getIdToken();

            // Send idToken to backend to exchange for local JWT
            await authService.loginWithFirebase({ idToken, role: activeTab });

            if (activeTab === 'seeker') navigate('/dashboard/seeker');
            else if (activeTab === 'employer') navigate('/dashboard/employer');
        } catch (err) {
            setError(t('invalid_otp'));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let credentials = {};
            if (activeTab === 'admin') {
                credentials = { username: formData.username, password: formData.password };
            } else {
                credentials = { identifier: formData.identifier, password: formData.password };
            }

            await authService.login(credentials, activeTab);

            if (activeTab === 'seeker') navigate('/dashboard/seeker');
            else if (activeTab === 'employer') navigate('/dashboard/employer');
            else if (activeTab === 'admin') navigate('/admin');

        } catch (err) {
            const backendError = err.response?.data?.error || err.response?.data?.message;
            setError(backendError || t('login_failed'));
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

                {activeTab !== 'admin' && (
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <button
                            onClick={() => setLoginMethod('password')}
                            style={{ flex: 1, padding: '8px', borderRadius: '8px', border: loginMethod === 'password' ? '2px solid var(--primary)' : '1px solid #ddd', background: 'white' }}
                        >
                            {t('password')}
                        </button>
                        <button
                            onClick={() => setLoginMethod('phone')}
                            style={{ flex: 1, padding: '8px', borderRadius: '8px', border: loginMethod === 'phone' ? '2px solid var(--primary)' : '1px solid #ddd', background: 'white' }}
                        >
                            {t('phone_otp')}
                        </button>
                    </div>
                )}

                {error && (
                    <div style={{ background: '#ffeeee', color: '#cc0000', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                {loginMethod === 'phone' && activeTab !== 'admin' ? (
                    <form onSubmit={verificationId ? handleLoginWithOTP : handleSendOTP}>
                        {!verificationId ? (
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>{t('phone_number')}</label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                                        placeholder="+251911..."
                                    />
                                </div>
                                <div id="recaptcha-container"></div>
                                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '20px' }} disabled={loading}>
                                    {loading ? t('sending') : t('send_otp')}
                                </button>
                            </div>
                        ) : (
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>{t('enter_otp')}</label>
                                <div style={{ position: 'relative' }}>
                                    <MessageSquare size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                    <input
                                        type="text"
                                        name="otp"
                                        value={formData.otp}
                                        onChange={handleChange}
                                        required
                                        style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                                        placeholder="123456"
                                    />
                                </div>
                                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '20px' }} disabled={loading}>
                                    {loading ? t('verifying') : t('verify_otp')}
                                </button>
                            </div>
                        )}
                    </form>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>
                                {activeTab === 'admin' ? t('username') : t('email_or_phone')}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                <input
                                    type={activeTab === 'admin' ? 'text' : 'text'}
                                    name={activeTab === 'admin' ? 'username' : 'identifier'}
                                    value={activeTab === 'admin' ? formData.username : formData.identifier}
                                    onChange={handleChange}
                                    required
                                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                                    placeholder={activeTab === 'admin' ? t('enter_username') : t('identifier_placeholder')}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>{t('password')}</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
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

                <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#666' }}>
                    {t('no_account')} <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>{t('register')}</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
