import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Briefcase, ArrowRight } from 'lucide-react';
import logo from '../assets/logo_integrated.png';
import heroBg from '../assets/hero-bg.jpg';

const Home = () => {
    const { t } = useTranslation();

    return (
        <div className="home-page">
            <header className="hero" style={{
                padding: '140px 0',
                background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${heroBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                color: 'white',
                minHeight: '700px',
                display: 'flex',
                alignItems: 'center'
            }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '20px', color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>{t('welcome')}</h1>
                    <p style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.9)', marginBottom: '40px', maxWidth: '800px', margin: '0 auto 40px', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                        {t('hero_title')}
                    </p>
                    <button className="btn-primary" style={{ fontSize: '1.2rem', padding: '15px 40px' }} onClick={() => window.location.href = '/register'}>
                        {t('get_started')} <ArrowRight size={20} style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
                    </button>
                </div>
            </header>

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
