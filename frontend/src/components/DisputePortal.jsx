import React, { useState } from 'react';
import { AlertTriangle, Send, CheckCircle, ShieldAlert, Info, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useToast } from './Toast';

const DisputePortal = ({ contractId, onClose }) => {
    const { t } = useTranslation();
    const addToast = useToast();
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post(`/api/contracts/${contractId}/dispute`, {
                reason,
                description
            });
            setIsSubmitted(true);
            addToast(t('dispute_submitted_toast') || 'Dispute submitted successfully', 'success');
        } catch (err) {
            console.error("Dispute submission failed:", err);
            addToast(err.response?.data?.error || 'Failed to submit dispute', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 40px' }}>
                <div style={{ width: '100px', height: '100px', background: 'hsla(45, 100%, 50%, 0.1)', borderRadius: '50%', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                    <ShieldAlert size={48} />
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--navy)', marginBottom: '16px' }}>{t('dispute_filed')}</h2>
                <p style={{ color: 'var(--text-light)', marginBottom: '40px', lineHeight: '1.6', fontSize: '1.05rem' }}>{t('dispute_filed_desc')}</p>
                <button 
                    onClick={onClose} 
                    className="btn-primary" 
                    style={{ width: '100%', height: '54px', borderRadius: '14px', fontSize: '1.1rem', fontWeight: '800' }}
                >
                    {t('return_to_agreement')}
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ padding: '12px', background: 'hsla(0, 100%, 50%, 0.1)', borderRadius: '14px', color: '#ef4444' }}>
                        <AlertTriangle size={28} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', color: 'var(--navy)' }}>{t('file_a_dispute')}</h2>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>Case ID: {contractId.split('-')[0].toUpperCase()}</p>
                    </div>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', fontSize: '0.95rem', color: 'var(--navy)' }}>{t('primary_reason')}</label>
                    <select 
                        required
                        value={reason} 
                        onChange={(e) => setReason(e.target.value)}
                        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontSize: '1rem', fontWeight: '600', color: 'var(--navy)' }}
                    >
                        <option value="">{t('select_reason_placeholder') || 'Select a reason...'}</option>
                        <option value="PAYMENT_ISSUE">{t('dispute_reason_payment')}</option>
                        <option value="BEHAVIOR_ISSUE">{t('dispute_reason_behavior')}</option>
                        <option value="SCOPE_MISMATCH">{t('dispute_reason_scope')}</option>
                        <option value="NO_SHOW">{t('dispute_reason_attendance')}</option>
                        <option value="OTHER">{t('dispute_reason_other')}</option>
                    </select>
                </div>

                <div style={{ marginBottom: '32px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', fontSize: '0.95rem', color: 'var(--navy)' }}>{t('detailed_description')}</label>
                    <textarea 
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t('dispute_placeholder') || "Please provide as much detail as possible..."}
                        style={{ width: '100%', minHeight: '180px', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', resize: 'vertical', fontSize: '1rem', lineHeight: '1.5' }}
                    />
                </div>

                <div style={{ padding: '18px', background: '#fff7ed', borderRadius: '14px', border: '1px solid #ffedd5', color: '#9a3412', fontSize: '0.9rem', display: 'flex', gap: '12px', marginBottom: '40px', lineHeight: '1.5' }}>
                    <Info size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ margin: 0, fontWeight: '500' }}>{t('dispute_freeze_msg')}</p>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        style={{ flex: 1, height: '54px', borderRadius: '14px', background: 'white', border: '1.5px solid #e2e8f0', cursor: 'pointer', fontWeight: '800', color: '#64748b', fontSize: '1rem' }}
                    >
                        {t('cancel')}
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ flex: 1, height: '54px', borderRadius: '14px', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1rem', boxShadow: '0 8px 16px -4px rgba(239, 68, 68, 0.3)' }}
                    >
                        {loading ? t('submitting') : <><Send size={20} /> {t('submit_dispute')}</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DisputePortal;
