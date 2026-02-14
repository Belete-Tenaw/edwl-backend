import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, FileText } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TermsAndConditions = () => {
    const { t } = useTranslation();

    const sections = Array.from({ length: 15 }, (_, i) => i + 1);

    return (
        <>
            <div className="container" style={{ padding: '40px 20px', maxWidth: '900px' }}>
                <div className="card">
                    <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                            <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '50%' }}>
                                <FileText size={40} color="var(--primary)" />
                            </div>
                        </div>
                        <h1 style={{ color: 'var(--primary)', marginBottom: '10px' }}>{t('terms_title')}</h1>
                        <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>
                            Ethio Domestic Workers Link<br />
                            ኢትዮ የሃገር ውስጥ ሠራተኞች አገናኝ
                        </p>
                        <p style={{ color: '#666', marginTop: '10px' }}>{t('terms_effective_date')}</p>
                        <p style={{ color: '#666' }}>{t('terms_last_updated')}</p>
                        <p style={{ color: '#666', marginTop: '5px' }}>{t('terms_contact_email')}</p>
                    </div>

                    <div className="terms-content">
                        {sections.map((num) => (
                            <div key={num} style={{ marginBottom: '30px' }}>
                                <h3 style={{ color: '#333', marginBottom: '10px', fontSize: '1.2rem', borderLeft: '4px solid var(--primary)', paddingLeft: '10px' }}>
                                    {t(`terms_${num}_title`)}
                                </h3>
                                <div style={{ color: '#555', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                                    {t(`terms_${num}_text`)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eee', textAlign: 'center', fontSize: '0.9rem', color: '#888' }}>
                        <p>Trustworthy Addis - Ethio Domestic Workers Link</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TermsAndConditions;
