import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Lock, Rocket, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const UpgradeModal = ({ onClose, targetTier = 'PLATINUM' }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', msg: '' }); // 'success' | 'error'

    const handleActivateCode = async (e) => {
        e.preventDefault();
        if (!code.trim()) return;

        setLoading(true);
        setStatus({ type: '', msg: '' });

        try {
            const res = await api.post('/payments/activate-code', { code: code.trim().toUpperCase() });
            setStatus({ type: 'success', msg: t('activation_success') || 'Subscription activated! Refreshing...' });
            
            // Success optimization: Update local storage if backend returns new user data
            if (res.data.user) {
                localStorage.setItem('user', JSON.stringify(res.data.user));
            }

            // Delayed close to show success message
            setTimeout(() => {
                onClose();
                window.location.reload(); // Hard refresh to update tier globally
            }, 2000);
        } catch (err) {
            console.error('Activation error:', err);
            setStatus({ 
                type: 'error', 
                msg: err.response?.data?.error || t('activation_failed') || 'Invalid or expired code.' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '30px', maxWidth: '400px', width: '90%', textAlign: 'center', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <X size={20} color="#999" />
                </button>

                <div style={{ width: '70px', height: '70px', background: status.type === 'success' ? '#ECFDF5' : '#FFF5F0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', transition: 'background 0.3s' }}>
                    {status.type === 'success' ? <CheckCircle size={30} color="#10B981" /> : <Lock size={30} color="#FF4500" />}
                </div>

                <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#111' }}>
                    {status.type === 'success' ? (t('activated') || 'Activated!') : t('upgrade_modal_title')}
                </h2>
                
                <p style={{ color: '#555', lineHeight: '1.5', marginBottom: '25px' }}>
                    {status.msg || (targetTier === 'GOLD' 
                        ? (t('upgrade_gold_msg') || 'Unlocking contact details and ID documents requires a Gold or Platinum subscription.') 
                        : (t('upgrade_platinum_msg') || 'Viewing Police and Health records requires a Platinum upgrade.'))}
                </p>

                {status.type !== 'success' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {/* Activation Code Input Area */}
                        <form onSubmit={handleActivateCode} style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b', marginBottom: '8px', textAlign: 'left' }}>
                                {t('have_code') || 'HAVE AN ACTIVATION CODE?'}
                            </label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input 
                                    type="text" 
                                    placeholder={t('enter_code_hint') || 'e.g. EDWL-GOLD-XXXX'}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', textTransform: 'uppercase' }}
                                    disabled={loading}
                                />
                                <button 
                                    type="submit"
                                    disabled={loading || !code.trim()}
                                    style={{ padding: '8px 15px', borderRadius: '8px', background: '#334155', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
                                >
                                    {loading ? '...' : (t('activate') || 'Activate')}
                                </button>
                            </div>
                            {status.type === 'error' && (
                                <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                                    <AlertCircle size={12} /> {status.msg}
                                </div>
                            )}
                        </form>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '5px 0' }}>
                            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{t('or') || 'OR'}</span>
                            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                        </div>

                        <button
                            onClick={() => navigate('/pricing')}
                            className="btn-primary"
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: '#FF4500', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}
                        >
                            <Rocket size={18} /> {t('upgrade_now')}
                        </button>
                        <button
                            onClick={onClose}
                            style={{ width: '100%', background: 'transparent', border: 'none', padding: '8px', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem' }}
                        >
                            {t('maybe_later') || 'Maybe later'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpgradeModal;

