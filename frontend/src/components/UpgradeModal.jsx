import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Lock, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UpgradeModal = ({ onClose, targetTier = 'PLATINUM' }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '30px', maxWidth: '400px', width: '90%', textAlign: 'center', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <X size={20} color="#999" />
                </button>

                <div style={{ width: '70px', height: '70px', background: '#FFF5F0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <Lock size={30} color="#FF4500" />
                </div>

                <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#111' }}>{t('upgrade_modal_title')}</h2>
                <p style={{ color: '#555', lineHeight: '1.5', marginBottom: '25px' }}>
                    {t('upgrade_modal_msg')}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                        onClick={() => navigate('/pricing')}
                        className="btn-primary"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: '#FF4500', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}
                    >
                        <Rocket size={18} /> {t('upgrade_now')}
                    </button>
                    <button
                        onClick={onClose}
                        style={{ width: '100%', background: 'transparent', border: '1px solid #ddd', padding: '12px', borderRadius: '8px', color: '#666', cursor: 'pointer' }}
                    >
                        {t('close')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;
