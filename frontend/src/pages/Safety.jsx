import React from 'react';
import { useTranslation } from 'react-i18next';
import BackButton from '../components/BackButton';
import { AlertTriangle, Lock, Phone } from 'lucide-react';

const Safety = () => {
    const { t } = useTranslation();

    return (
        <div style={{ background: '#f9f9f9', minHeight: '100vh' }}>
            <div className="container" style={{ padding: '60px 20px', maxWidth: '900px', margin: '0 auto' }}>
                <BackButton />
                <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '40px', textAlign: 'center' }}>{t('safety_guidelines')}</h1>

                <div className="card" style={{ background: '#fff3e0', borderLeft: '5px solid #ff9800', padding: '20px', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'start' }}>
                        <AlertTriangle color="#f57c00" size={24} style={{ flexShrink: 0, marginTop: '5px' }} />
                        <div>
                            <h3 style={{ color: '#e65100', marginBottom: '10px' }}>{t('important_notice')}</h3>
                            <p style={{ color: '#bf360c' }}>
                                {t('platform_disclaimer')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '30px', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>{t('safe_hiring_tips')}</h2>
                    <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#444' }}>
                        <li style={{ marginBottom: '10px' }}><strong>{t('request_id_title')}:</strong> {t('request_id_desc')}</li>
                        <li style={{ marginBottom: '10px' }}><strong>{t('public_meeting_title')}:</strong> {t('public_meeting_desc')}</li>
                        <li style={{ marginBottom: '10px' }}><strong>{t('clear_contracts_title')}:</strong> {t('clear_contracts_desc')}</li>
                        <li style={{ marginBottom: '10px' }}><strong>{t('no_upfront_fees_title')}:</strong> {t('no_upfront_fees_desc')}</li>
                    </ul>
                </div>

                <div className="card" style={{ padding: '30px', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>{t('data_privacy')}</h2>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
                        <Lock size={24} color="var(--primary)" />
                        <p style={{ color: '#444' }}>{t('data_privacy_desc')}</p>
                    </div>
                </div>

                <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>{t('report_issues')}</h2>
                    <p style={{ marginBottom: '20px', color: '#666' }}>{t('report_desc')}</p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#fee2e2', color: '#b91c1c', padding: '10px 20px', borderRadius: '30px', fontWeight: 'bold' }}>
                        <Phone size={20} /> Support: +251 900 000 000
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Safety;
