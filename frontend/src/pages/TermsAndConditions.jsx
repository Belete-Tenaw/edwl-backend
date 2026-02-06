import React from 'react';
import BackButton from '../components/BackButton';
import { useTranslation } from 'react-i18next';

const TermsAndConditions = () => {
    const { t } = useTranslation();

    return (
        <div style={{ background: '#f9f9f9', minHeight: '100vh' }}>
            <div className="container" style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
                <BackButton />
                <h1 style={{ color: 'var(--primary)', marginBottom: '20px', fontSize: '2rem' }}>{t('terms_title')}</h1>

                <div className="card" style={{ padding: '30px', lineHeight: '1.7', color: '#444' }}>
                    <p style={{ marginBottom: '15px' }}>{t('privacy_intro', { date: new Date().toLocaleDateString() })}</p>

                    <h2 style={{ fontSize: '1.4rem', color: '#333', marginTop: '20px', marginBottom: '10px' }}>{t('terms_1_title')}</h2>
                    <p>{t('terms_1_text')}</p>

                    <h2 style={{ fontSize: '1.4rem', color: '#333', marginTop: '20px', marginBottom: '10px' }}>{t('terms_2_title')}</h2>
                    <p>{t('terms_2_text')}</p>

                    <h2 style={{ fontSize: '1.4rem', color: '#333', marginTop: '20px', marginBottom: '10px' }}>{t('terms_3_title')}</h2>
                    <p>{t('terms_3_text')}</p>

                    <h2 style={{ fontSize: '1.4rem', color: '#333', marginTop: '20px', marginBottom: '10px' }}>{t('terms_4_title')}</h2>
                    <p>{t('terms_4_text')}</p>

                    <h2 style={{ fontSize: '1.4rem', color: '#333', marginTop: '20px', marginBottom: '10px' }}>{t('terms_5_title')}</h2>
                    <p>{t('terms_5_text')}</p>

                    <h2 style={{ fontSize: '1.4rem', color: '#333', marginTop: '20px', marginBottom: '10px' }}>{t('terms_6_title')}</h2>
                    <p>{t('terms_6_text')} support@edwl.com</p>
                </div>
            </div>
        </div>
    );
};

export default TermsAndConditions;
