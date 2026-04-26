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
        <div className="home-page app">
            <header className="hero hero-enhanced">
                <div className="container hero-content-grid">
                    <div className="hero-text-area reveal">
                        <h1 className="hero-title">
                            <span className="gradient-text">{t('welcome')}</span>
                        </h1>
                        <h2 className="hero-subtitle">
                           {t('motto')}
                        </h2>
                        <p className="hero-description">
                            {t('hero_title')}
                        </p>

                        {/* Hero CTA buttons — Session Aware */}
                        <div className="hero-cta-group delay-1">
                            {user ? (
                                <button
                                    className="btn-primary btn-hero-main"
                                    onClick={() => navigate(user.role === 'JOB_SEEKER' ? '/dashboard/seeker' : user.role === 'EMPLOYER' ? '/dashboard/employer' : '/admin')}
                                    id="hero-dashboard-btn"
                                >
                                    <LayoutDashboard size={20} />
                                    {t('go_to_dashboard') || t('dashboard')} <ArrowRight size={20} />
                                </button>
                            ) : (
                                <>
                                    <button
                                        className="btn-primary btn-hero-main"
                                        onClick={() => navigate('/register')}
                                        id="hero-register-btn"
                                    >
                                        {t('create_free_account') || 'Create Free Account'} <ArrowRight size={22} />
                                    </button>

                                    <Link
                                        to="/login"
                                        className="btn-login btn-hero-secondary"
                                        id="hero-login-btn"
                                    >
                                        <LogIn size={20} />
                                        {t('login')}
                                    </Link>
                                </>
                            )}
                        </div>

                        {!user && (
                            <p className="hero-guest-nudge delay-2">
                                {t('returning_user') || 'Already have an account?'}{' '}
                                <Link to="/login" className="login-link">
                                    {t('login')}
                                </Link>
                            </p>
                        )}
                    </div>

                    <div className="hero-visual-area reveal delay-1 desktop-only">
                        {/* A premium glass card to show a "Trust Score" preview or similar */}
                        <div className="glass-card trust-preview">
                            <div className="trust-badge-large">
                                <Users size={40} className="trust-icon" />
                            </div>
                            <h3>{t('verified_trust') || 'Reliability First'}</h3>
                            <p>{t('trust_desc_short') || 'Connecting verified talent with verified employers.'}</p>
                            <div className="trust-stat-row">
                                <div className="trust-stat">
                                    <span className="stat-value">5k+</span>
                                    <span className="stat-label">Verified</span>
                                </div>
                                <div className="trust-stat">
                                    <span className="stat-value">98%</span>
                                    <span className="stat-label">Success</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <style>{`
                .hero-enhanced {
                    background: radial-gradient(circle at 70% 30%, hsla(180, 100%, 25%, 0.1) 0%, transparent 70%),
                                linear-gradient(135deg, hsl(210, 40%, 98%) 0%, hsl(210, 40%, 94%) 100%);
                    min-height: 85vh;
                    display: flex;
                    align-items: center;
                    position: relative;
                    overflow: hidden;
                    padding: 80px 0;
                }

                .hero-enhanced::before {
                    content: '';
                    position: absolute;
                    top: -10%; right: -10%;
                    width: 40%; height: 60%;
                    background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%);
                    z-index: 0;
                    filter: blur(60px);
                }

                .hero-content-grid {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    gap: 60px;
                    align-items: center;
                    position: relative;
                    z-index: 1;
                }

                .hero-title {
                    font-size: clamp(2.5rem, 6vw, 4.5rem);
                    line-height: 1.1;
                    margin-bottom: 16px;
                }

                .hero-subtitle {
                    font-size: clamp(1.4rem, 3vw, 2rem);
                    color: var(--navy);
                    font-weight: 600;
                    margin-bottom: 24px;
                    opacity: 0.9;
                }

                .hero-description {
                    font-size: 1.2rem;
                    color: var(--text-light);
                    max-width: 540px;
                    margin-bottom: 40px;
                }

                .hero-cta-group {
                    display: flex;
                    gap: 20px;
                    flex-wrap: wrap;
                }

                .btn-hero-main {
                    padding: 16px 48px;
                    font-size: 1.1rem;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .btn-hero-secondary {
                    padding: 16px 40px;
                    font-size: 1.1rem;
                }

                .hero-guest-nudge {
                    margin-top: 24px;
                    color: var(--text-light);
                    font-size: 0.95rem;
                }

                .login-link {
                    color: var(--primary);
                    font-weight: 700;
                    text-decoration: none;
                    border-bottom: 2px solid var(--primary-glow);
                }

                .glass-card {
                    background: rgba(255, 255, 255, 0.4);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--glass-border);
                    border-radius: 24px;
                    padding: 40px;
                    box-shadow: var(--shadow-lg);
                }

                .trust-preview {
                    text-align: center;
                    max-width: 400px;
                    margin: 0 auto;
                    transform: perspective(1000px) rotateY(-5deg);
                }

                .trust-badge-large {
                    width: 80px;
                    height: 80px;
                    background: var(--primary);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 24px;
                    box-shadow: var(--shadow-primary);
                }

                .trust-stat-row {
                    display: flex;
                    justify-content: space-around;
                    margin-top: 32px;
                    padding-top: 24px;
                    border-top: 1px solid var(--primary-glow);
                }

                .stat-value {
                    display: block;
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: var(--primary);
                }

                .stat-label {
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: var(--text-light);
                }

                @media (max-width: 992px) {
                    .hero-content-grid {
                        grid-template-columns: 1fr;
                        text-align: center;
                    }
                    .hero-description {
                        margin-left: auto;
                        margin-right: auto;
                    }
                    .hero-cta-group {
                        justify-content: center;
                    }
                }
            `}</style>
            
            {/* Keeping language toggle clean in Navbar, but here for consistency if needed */}


            {/* Logged-in nudge: If user is logged in, show a way to sign out and see the login button */}
            {user && (
                <div style={{ background: '#f0f9f9', borderBottom: '1px solid #e0f2f2', padding: '15px 0' }}>
                    <div className="container" style={{ textAlign: 'center', fontSize: '1rem', color: 'var(--text-light)' }}>
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

            {/* Impact Stats Ticker */}
            <section style={{ background: 'white', padding: '30px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px', textAlign: 'center' }}>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>5,000+</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('verified_workers') || 'Verified Workers'}</div>
                    </div>
                    <div style={{ width: '1px', background: '#eee' }} className="desktop-only"></div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0284c7' }}>1,200+</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('active_employers') || 'Active Employers'}</div>
                    </div>
                    <div style={{ width: '1px', background: '#eee' }} className="desktop-only"></div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: '#2e7d32' }}>98%</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('match_rate') || 'Match Success'}</div>
                    </div>
                </div>
            </section>

            {/* Feature Cards */}
            <section className="features container" style={{ padding: '80px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
                <div className="card" style={{ textAlign: 'center', padding: '40px 30px' }}>
                    <div style={{ background: 'rgba(0, 128, 128, 0.05)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px' }}>
                        <Users size={36} color="var(--primary)" />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>{t('for_workers')}</h3>
                    <p style={{ color: 'var(--text-light)' }}>{t('for_workers_desc')}</p>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '40px 30px' }}>
                    <div style={{ background: '#e1f5fe', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px' }}>
                        <Briefcase size={36} color="#0284c7" />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>{t('for_employers')}</h3>
                    <p style={{ color: 'var(--text-light)' }}>{t('for_employers_desc')}</p>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '40px 30px' }}>
                    <div style={{ background: '#e8f5e9', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px' }}>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    </div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>{t('safety_trust')}</h3>
                    <p style={{ color: 'var(--text-light)' }}>{t('safety_trust_desc')}</p>
                </div>
            </section>

            {/* How it Works */}
            <section style={{ background: '#f9fafb', padding: '80px 0' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '60px', color: 'var(--navy)' }}>{t('how_it_works')}</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', textAlign: 'left' }}>
                        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ color: 'var(--primary)', marginBottom: '20px' }}>1. {t('register_profile')}</h3>
                            <p style={{ color: 'var(--text-light)' }}>{t('step1_desc')}</p>
                        </div>
                        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ color: '#0284c7', marginBottom: '20px' }}>2. {t('search_connect')}</h3>
                            <p style={{ color: 'var(--text-light)' }}>{t('step2_desc')}</p>
                        </div>
                        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ color: '#2e7d32', marginBottom: '20px' }}>3. {t('hire_verify')}</h3>
                            <p style={{ color: 'var(--text-light)' }}>{t('step3_desc')}</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
