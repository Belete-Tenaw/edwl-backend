import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Briefcase, Users } from 'lucide-react';

const Home = () => {
    const { t } = useTranslation();

    return (
        <div className="home-page">
            <header className="hero" style={{ padding: '80px 0', background: 'white' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '20px', color: 'var(--primary)' }}>{t('welcome')}</h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-light)', marginBottom: '40px', maxWidth: '800px', margin: '0 auto 40px' }}>
                        {t('hero_title')}
                    </p>
                    <button className="btn-primary" style={{ fontSize: '1.1rem' }}>
                        {t('get_started')} <ArrowRight size={18} style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
                    </button>
                </div>
            </header>

            <section className="features container" style={{ padding: '60px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                <div className="card" style={{ textAlign: 'center' }}>
                    <Users size={48} color="var(--primary)" style={{ marginBottom: '20px' }} />
                    <h3>{t('for_workers')}</h3>
                    <p>{t('premium_msg')}</p>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                    <Briefcase size={48} color="var(--primary)" style={{ marginBottom: '20px' }} />
                    <h3>{t('for_employers')}</h3>
                    <p>{t('premium_msg')}</p>
                </div>
            </section>
        </div>
    );
};

export default Home;
