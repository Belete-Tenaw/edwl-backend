import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Briefcase, ArrowRight, LogIn, LayoutDashboard } from 'lucide-react';
import authService from '../services/authService';

import heroBg from '../assets/hero-bg.jpg';

const Home = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [user, setUser] = React.useState(authService.getCurrentUser());

    React.useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
    }, []);

    const handleLogout = () => {
        authService.logout();
        setUser(null);
        window.location.reload();
    };

    return (
        <div className="home-page">
            <header className="hero" style={{
                background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${heroBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed',
                color: 'white',
                minHeight: '700px',
                display: 'flex',
                alignItems: 'center'
            }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '10px', color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>{t('welcome')}</h1>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '20px', textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>
                        "{t('motto')}"
                    </h2>
                    <p style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.9)', marginBottom: '40px', maxWidth: '800px', margin: '0 auto 40px', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                        {t('hero_title')}
                    </p>

                    {/* Hero CTA buttons — Session Aware */}
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {user ? (
                            /* Logged-in State: Primary CTA is Dashboard */
                            <button
                                className="btn-primary"
                                style={{ 
                                    fontSize: '1.2rem', 
                                    padding: '16px 40px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '12px', 
                                    borderRadius: '10px', 
                                    minHeight: '56px',
                                    fontWeight: '700',
                                    backgroundColor: 'white',
                                    color: 'var(--primary)',
                                    boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                                }}
                                onClick={() => navigate(user.role === 'JOB_SEEKER' ? '/dashboard/seeker' : user.role === 'EMPLOYER' ? '/dashboard/employer' : '/admin')}
                                id="hero-dashboard-btn"
                            >
                                <LayoutDashboard size={24} />
                                {t('go_to_dashboard') || t('dashboard')} <ArrowRight size={22} />
                            </button>
                        ) : (
                            /* Logged-out State: Register + Prominent Login */
                            <>
                                <button
                                    className="btn-primary"
                                    style={{ 
                                        fontSize: '1.2rem', 
                                        padding: '16px 44px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '12px', 
                                        borderRadius: '10px', 
                                        minHeight: '56px',
                                        fontWeight: '700',
                                        boxShadow: '0 10px 25px rgba(255, 69, 0, 0.4)',
                                        border: 'none'
                                    }}
                                    onClick={() => navigate('/register')}
                                    id="hero-register-btn"
                                >
                                    {t('create_free_account') || 'Create Free Account'} <ArrowRight size={24} />
                                </button>

                                <Link
                                    to="/login"
                                    className="btn-login"
                                    style={{ 
                                        fontSize: '1.2rem', 
                                        padding: '16px 44px',
                                        gap: '12px', 
                                        minHeight: '56px',
                                        borderRadius: '10px',
                                        fontWeight: '700',
                                        border: 'none'
                                    }}
                                    id="hero-login-btn"
                                >
                                    <LogIn size={24} />
                                    {t('login')}
                                </Link>
                            </>
                        )}

                        {/* Language toggle */}
                        <button
                            onClick={() => {
                                const newLang = i18n.language === 'en' ? 'am' : 'en';
                                i18n.changeLanguage(newLang);
                            }}
                            style={{
                                fontSize: '1rem',
                                padding: '14px 24px',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.5)',
                                color: 'white',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                backdropFilter: 'blur(5px)',
                                fontWeight: '500',
                                minHeight: '52px'
                            }}
                        >
                            {i18n.language === 'en' ? 'አማርኛ' : 'English'}
                        </button>
                    </div>

                    {/* Guest nudge link */}
                    {!user && (
                        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', marginTop: '20px' }}>
                            {t('returning_user') || 'Already have an account?'}{' '}
                            <Link to="/login" style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '600', textDecoration: 'underline' }}>
                                {t('login')}
                            </Link>
                        </p>
                    )}
                </div>
            </header>

            {/* Logged-in nudge: If user is logged in, show a way to sign out and see the login button */}
            {user && (
                <div style={{ background: '#fff9f5', borderBottom: '1px solid #ffe8d9', padding: '15px 0' }}>
                    <div className="container" style={{ textAlign: 'center', fontSize: '1rem', color: '#666' }}>
                        <span>{t('logged_in_as') || 'You are signed in as'}: <strong>{user.username || user.email || 'User'}</strong></span>
                        <button 
                            onClick={handleLogout}
                            style={{ marginLeft: '15px', color: 'var(--primary)', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            {t('logout_to_switch') || 'Log out to sign in as different user'}
                        </button>
                    </div>
                </div>
            )}

            {/* Feature Cards */}
            <section className="features container" style={{ padding: '80px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
                <div className="card" style={{ textAlign: 'center', padding: '40px 30px' }}>
                    <div style={{ background: '#fff0e6', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px' }}>
                        <Users size={36} color="var(--primary)" />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>{t('for_workers')}</h3>
                    <p style={{ color: '#666' }}>{t('for_workers_desc')}</p>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '40px 30px' }}>
                    <div style={{ background: '#e1f5fe', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px' }}>
                        <Briefcase size={36} color="#0284c7" />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>{t('for_employers')}</h3>
                    <p style={{ color: '#666' }}>{t('for_employers_desc')}</p>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '40px 30px' }}>
                    <div style={{ background: '#e8f5e9', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px' }}>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    </div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>{t('safety_trust')}</h3>
                    <p style={{ color: '#666' }}>{t('safety_trust_desc')}</p>
                </div>
            </section>

            {/* How it Works */}
            <section style={{ background: '#f9fafb', padding: '80px 0' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '60px', color: '#333' }}>{t('how_it_works')}</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', textAlign: 'left' }}>
                        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ color: 'var(--primary)', marginBottom: '20px' }}>1. {t('register_profile')}</h3>
                            <p style={{ color: '#666' }}>{t('step1_desc')}</p>
                        </div>
                        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ color: '#0284c7', marginBottom: '20px' }}>2. {t('search_connect')}</h3>
                            <p style={{ color: '#666' }}>{t('step2_desc')}</p>
                        </div>
                        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ color: '#2e7d32', marginBottom: '20px' }}>3. {t('hire_verify')}</h3>
                            <p style={{ color: '#666' }}>{t('step3_desc')}</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
