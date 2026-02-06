import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Heart, Users } from 'lucide-react';

const About = () => {
    const { t } = useTranslation();

    return (
        <div style={{ background: '#f9f9f9', minHeight: '100vh' }}>
            <div className="container" style={{ padding: '60px 20px', maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '20px' }}>{t('about_us')}</h1>
                    <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '700px', margin: '0 auto' }}>
                        {t('edwl_full_name')}
                    </p>
                </div>

                <div className="card" style={{ padding: '40px', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#333' }}>{t('who_we_are')}</h2>
                    <p style={{ lineHeight: '1.8', color: '#444', fontSize: '1.1rem', marginBottom: '20px' }}>{t('about_intro')}</p>
                    <p style={{ lineHeight: '1.8', color: '#444', fontSize: '1.1rem' }}>{t('about_goal')}</p>
                </div>

                <div className="card" style={{ padding: '40px', marginBottom: '40px', borderLeft: '5px solid var(--primary)' }}>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#333' }}>{t('what_we_do')}</h2>
                    <p style={{ lineHeight: '1.8', color: '#444', fontSize: '1.1rem', marginBottom: '15px' }}>{t('what_we_do_intro')}</p>
                    <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#444', fontSize: '1.1rem' }}>
                        <li>{t('what_we_do_1')}</li>
                        <li>{t('what_we_do_2')}</li>
                        <li>{t('what_we_do_3')}</li>
                    </ul>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '40px' }}>
                    <div className="card" style={{ padding: '30px' }}>
                        <Heart size={36} color="var(--primary)" style={{ marginBottom: '15px' }} />
                        <h3 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>{t('our_purpose')}</h3>
                        <p style={{ color: '#666', lineHeight: '1.6' }}>{t('our_purpose_intro')}</p>
                        <ul style={{ paddingLeft: '20px', marginTop: '10px', color: '#666', lineHeight: '1.6' }}>
                            <li>{t('our_purpose_1')}</li>
                            <li>{t('our_purpose_2')}</li>
                            <li>{t('our_purpose_3')}</li>
                        </ul>
                    </div>

                    <div className="card" style={{ padding: '30px' }}>
                        <Shield size={36} color="#0284c7" style={{ marginBottom: '15px' }} />
                        <h3 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>{t('our_role')}</h3>
                        <p style={{ color: '#666', lineHeight: '1.6' }}>{t('our_role_desc')}</p>
                    </div>
                </div>

                <div className="card" style={{ padding: '40px', marginBottom: '40px', background: '#333', color: 'white' }}>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: 'white' }}>{t('trust_privacy_safety')}</h2>
                    <p style={{ lineHeight: '1.8', color: '#ddd', fontSize: '1.1rem', marginBottom: '20px' }}>{t('commitment_intro')}</p>
                    <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#ddd', fontSize: '1.1rem', marginBottom: '20px' }}>
                        <li>{t('commitment_1')}</li>
                        <li>{t('commitment_2')}</li>
                        <li>{t('commitment_3')}</li>
                    </ul>
                    <p style={{ lineHeight: '1.8', color: '#ffaaa5', fontSize: '1.0rem', fontStyle: 'italic' }}>{t('safety_advisory')}</p>
                </div>

                <div className="card" style={{ padding: '40px', textAlign: 'center', background: 'linear-gradient(to right, #ff4500, #ff8c00)', color: 'white' }}>
                    <h2 style={{ fontSize: '2.0rem', marginBottom: '20px', color: 'white' }}>{t('our_vision')}</h2>
                    <p style={{ fontSize: '1.3rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>"{t('vision_statement')}"</p>
                </div>
            </div>
        </div>
    );
};

export default About;
