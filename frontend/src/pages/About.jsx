import React from 'react';
import { useTranslation } from 'react-i18next';
import { Target, Heart, Shield, Award } from 'lucide-react';

const About = () => {
    const { t } = useTranslation();

    return (
        <div className="about-page">
            <header className="page-header" style={{
                background: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("/assets/about-hero.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                padding: '100px 20px',
                color: 'white',
                textAlign: 'center'
            }}>
                <div className="container">
                    <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>{t('about_us')}</h1>
                    <p style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto' }}>
                        {t('about_intro')}
                    </p>
                </div>
            </header>

            <section className="container" style={{ padding: '80px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ color: 'var(--primary)', marginBottom: '24px' }}>{t('who_we_are')}</h2>
                        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#444', marginBottom: '20px' }}>
                            {t('about_intro')}
                        </p>
                        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#444' }}>
                            {t('about_goal')}
                        </p>
                    </div>
                    <div style={{ background: '#f9f9f9', padding: '40px', borderRadius: '20px' }}>
                        <h3 style={{ marginBottom: '20px' }}>{t('our_purpose')}</h3>
                        <p style={{ color: '#666', marginBottom: '20px' }}>{t('our_purpose_intro')}</p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ display: 'flex', gap: '12px', marginBottom: '15px' }}>
                                <Target size={20} color="var(--primary)" />
                                <span>{t('our_purpose_1')}</span>
                            </li>
                            <li style={{ display: 'flex', gap: '12px', marginBottom: '15px' }}>
                                <Heart size={20} color="var(--primary)" />
                                <span>{t('our_purpose_2')}</span>
                            </li>
                            <li style={{ display: 'flex', gap: '12px', marginBottom: '15px' }}>
                                <Shield size={20} color="var(--primary)" />
                                <span>{t('our_purpose_3')}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            <section style={{ background: '#f4f4f4', padding: '80px 20px' }}>
                <div className="container">
                    <h2 style={{ textAlign: 'center', marginBottom: '50px' }}>{t('what_we_do')}</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                        {[1, 2, 3].map((num) => (
                            <div key={num} className="card" style={{ padding: '30px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '20px',
                                    fontWeight: 'bold'
                                }}>{num}</div>
                                <p style={{ color: '#444', fontWeight: '500' }}>{t(`what_we_do_${num}`)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '40px' }}>{t('our_role')}</h2>
                <div style={{ maxWidth: '900px', margin: '0 auto', fontSize: '1.2rem', color: '#555', lineHeight: '1.6' }}>
                    <p>{t('our_role_desc')}</p>
                </div>
            </section>
        </div>
    );
};

export default About;
