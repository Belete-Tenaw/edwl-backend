import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { User, Briefcase, ShieldCheck, Lock, Mail, Phone, ArrowRight, MessageSquare } from 'lucide-react';
import { auth } from '../firebase';
import { SmartAuth } from '../components/SmartAuth';

const Login = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('seeker'); // seeker, employer, admin
    const handleLoginSuccess = (role) => {
        if (role === 'seeker') navigate('/dashboard/seeker');
        else if (role === 'employer') navigate('/dashboard/employer');
        else if (role === 'admin') navigate('/admin');
    };

    const handleAdminSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authService.login({ username: formData.username, password: formData.password }, 'admin');
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || t('login_failed'));
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

                {error && (
                    <div style={{ background: '#ffeeee', color: '#cc0000', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                {activeTab !== 'admin' ? (
                    <SmartAuth activeTab={activeTab} onSuccess={handleLoginSuccess} onError={setError} />
                ) : (
                    <form onSubmit={handleAdminSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>
                                {t('username')}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                                    placeholder={t('enter_username')}
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

                <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#666' }}>
                    {t('no_account')} <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>{t('register')}</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
