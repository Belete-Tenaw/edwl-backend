import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { User, Briefcase, ShieldCheck, Lock, Mail, Phone, ArrowRight } from 'lucide-react';

const Login = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('seeker'); // seeker, employer, admin
    const [formData, setFormData] = useState({
        identifier: '', // email or phone
        password: '',
        username: '' // for admin
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setError('');
        setFormData({ identifier: '', password: '', username: '' });
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

            // Redirect based on role
            if (activeTab === 'seeker') navigate('/dashboard/seeker');
            else if (activeTab === 'employer') navigate('/dashboard/employer');
            else if (activeTab === 'admin') navigate('/admin');

        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
            <div className="card" style={{ width: '100%', maxWidth: '450px', padding: '40px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--primary)' }}>{t('login')}</h2>

                {/* Tabs */}
                <div className="tabs-container" style={{ display: 'flex', marginBottom: '30px', background: '#f0f0f0', borderRadius: '12px', padding: '5px' }}>
                    <button
                        type="button"
                        onClick={() => handleTabChange('seeker')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            background: activeTab === 'seeker' ? 'white' : 'transparent',
                            color: activeTab === 'seeker' ? 'var(--primary)' : '#666',
                            boxShadow: activeTab === 'seeker' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
                            borderRadius: '8px',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '0.9rem'
                        }}
                    >
                        <User size={16} /> {t('worker')}
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange('employer')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            background: activeTab === 'employer' ? 'white' : 'transparent',
                            color: activeTab === 'employer' ? 'var(--primary)' : '#666',
                            boxShadow: activeTab === 'employer' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
                            borderRadius: '8px',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '0.9rem'
                        }}
                    >
                        <Briefcase size={16} /> {t('employer')}
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange('admin')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            background: activeTab === 'admin' ? 'white' : 'transparent',
                            color: activeTab === 'admin' ? 'var(--primary)' : '#666',
                            boxShadow: activeTab === 'admin' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
                            borderRadius: '8px',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '0.9rem'
                        }}
                    >
                        <ShieldCheck size={16} /> {t('admin')}
                    </button>
                </div>

                {error && (
                    <div style={{ background: '#ffeeee', color: '#cc0000', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {activeTab === 'admin' ? (
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>{t('username')}</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                                    placeholder={t('enter_username')}
                                />
                            </div>
                        </div>
                    ) : (
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>{t('email_or_phone')}</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                <input
                                    type="text"
                                    name="identifier"
                                    value={formData.identifier}
                                    onChange={handleChange}
                                    required
                                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                                    placeholder={t('identifier_placeholder')}
                                />
                            </div>
                        </div>
                    )}

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

                <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#666' }}>
                    Don't have an account? <a href="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>{t('register')}</a>
                </div>
            </div>
        </div>
    );
};

export default Login;
