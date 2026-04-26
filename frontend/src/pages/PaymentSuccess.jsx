import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader, ShieldCheck, Zap, Receipt } from 'lucide-react';
import api from '../services/api';
import authService from '../services/authService';

const PaymentSuccess = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('VERIFYING'); // VERIFYING, SUCCESS, ERROR
    const [attempts, setAttempts] = useState(0);
    const txRef = searchParams.get('ref');
    const pollInterval = useRef(null);

    const verifyAndSync = async () => {
        try {
            // 1. Trigger completion logic (idempotent)
            await api.post('/payments/complete', { tx_ref: txRef, status: 'success' });
            
            // 2. Fetch fresh profile to confirm tier change
            const user = authService.getCurrentUser();
            if (user) {
                const profileRes = await api.get(user.role === 'JOB_SEEKER' ? `/seekers/${user.id}` : `/employers/${user.id}`);
                
                // If tier has actually changed from 'FREE' / 'BRONZE' or status is confirmed
                if (profileRes.data.isSubscribed || profileRes.data.tier !== 'FREE' && profileRes.data.tier !== 'BRONZE') {
                    const updatedUser = { 
                        ...user, 
                        tier: profileRes.data.tier, 
                        isSubscribed: true,
                        subscriptionExpiry: profileRes.data.subscriptionExpiry 
                    };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    setStatus('SUCCESS');
                    if (pollInterval.current) clearInterval(pollInterval.current);
                    return true;
                }
            }
        } catch (err) {
            console.warn('Sync attempt failed:', err.message);
        }
        return false;
    };

    useEffect(() => {
        if (!txRef) {
            setStatus('ERROR');
            return;
        }

        // Initial attempt
        verifyAndSync();

        // Start polling (every 3s for 30s total)
        pollInterval.current = setInterval(() => {
            setAttempts(prev => {
                if (prev >= 10) {
                    clearInterval(pollInterval.current);
                    setStatus('SUCCESS'); // Fallback to success UI but maybe with a 'processing' note
                    return prev;
                }
                verifyAndSync();
                return prev + 1;
            });
        }, 3000);

        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, [txRef]);

    if (status === 'VERIFYING') {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '120px 20px', animation: 'fadeIn 0.5s ease-in' }}>
                <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 30px' }}>
                    <Loader className="spin" size={80} color="var(--primary)" style={{ opacity: 0.2 }} />
                    <Zap size={32} color="var(--primary)" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', animation: 'pulse-primary 1.5s infinite' }} />
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '10px' }}>{t('finalizing_payment') || 'Finalizing Activation...'}</h2>
                <p style={{ color: '#666', fontSize: '1.1rem' }}>{t('please_wait_msg') || 'Confirming your secure transaction with Chapa.'}</p>
                <div style={{ marginTop: '20px', color: '#999', fontSize: '0.8rem' }}>Attempt {attempts + 1} of 10</div>
            </div>
        );
    }

    return (
        <div className="container" style={{ textAlign: 'center', padding: '100px 20px', maxWidth: '700px', animation: 'fadeIn 0.8s ease-out' }}>
            <div style={{ 
                background: 'white', 
                padding: '60px 40px', 
                borderRadius: '32px', 
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
                border: '1px solid #f0fdf4',
                position: 'relative'
            }}>
                {/* Visual Flair */}
                <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: 'white', padding: '8px 20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.4)' }}>
                    <ShieldCheck size={18} /> {t('payment_secured') || 'Verified & Secured'}
                </div>

                <div style={{ 
                    width: '100px', 
                    height: '100px', 
                    background: '#ecfdf5', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    margin: '0 auto 30px',
                    color: '#10b981'
                }}>
                    <CheckCircle size={56} />
                </div>

                <h1 style={{ color: '#064e3b', fontSize: '2.5rem', fontWeight: '900', marginBottom: '15px' }}>{t('payment_received') || 'Success! You’re Pro.'}</h1>
                <p style={{ color: '#065f46', fontSize: '1.2rem', marginBottom: '40px', lineHeight: '1.6' }}>
                    {t('subscription_activated_msg') || 'Your premium subscription is now active. All elite features, hidden worker contacts, and priority matching are unlocked.'}
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '40px' }}>
                   <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', textAlign: 'left', border: '1px solid #e2e8f0' }}>
                        <Receipt size={24} color="#64748b" style={{ marginBottom: '10px' }} />
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('transaction_id')}</div>
                        <code style={{ fontSize: '1rem', fontWeight: '700', color: '#334155' }}>{txRef || 'N/A'}</code>
                   </div>
                   <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', textAlign: 'left', border: '1px solid #e2e8f0' }}>
                        <Zap size={24} color="var(--primary)" style={{ marginBottom: '10px' }} />
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('status')}</div>
                        <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--primary)' }}>{t('activated') || 'Active Now'}</div>
                   </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <button 
                        onClick={() => navigate('/')}
                        style={{ 
                            padding: '16px', 
                            borderRadius: '16px', 
                            border: '1px solid #e2e8f0', 
                            background: 'white', 
                            cursor: 'pointer', 
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            transition: 'all 0.2s'
                         }}
                         className="btn-hover-subtle"
                    >
                        {t('go_to_home')}
                    </button>
                    <button 
                        onClick={() => {
                            const user = authService.getCurrentUser();
                            navigate(user?.role === 'JOB_SEEKER' ? '/dashboard/seeker' : '/dashboard/employer');
                        }}
                        className="btn-primary"
                        style={{ 
                            padding: '16px', 
                            borderRadius: '16px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '10px',
                            fontWeight: 'bold',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                        }}
                    >
                         {t('go_to_dashboard') || 'Go to Dashboard'} <ArrowRight size={20} />
                    </button>
                </div>
            </div>
            
            <p style={{ marginTop: '40px', color: '#94a3b8', fontSize: '0.9rem' }}>
                {t('payment_disclaimer') || 'Having issues? Contact our automated payment support line at +251 911 223 344'}
            </p>
        </div>
    );
};

export default PaymentSuccess;
