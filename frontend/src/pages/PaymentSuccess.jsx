import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader } from 'lucide-react';
import api from '../services/api';
import authService from '../services/authService';

const PaymentSuccess = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [verifying, setVerifying] = useState(true);
    const [error, setError] = useState(null);
    const txRef = searchParams.get('ref');

    useEffect(() => {
        const verifyPayment = async () => {
            if (!txRef) {
                setVerifying(false);
                return;
            }

            try {
                // Call complete/webhook logic again just in case the webhook was slow
                await api.post('/payments/complete', { tx_ref: txRef, status: 'success' });
                
                // Refresh local user data to show new tier immediately
                const user = authService.getCurrentUser();
                if (user) {
                    const profileRes = await api.get(user.role === 'JOB_SEEKER' ? `/seekers/${user.id}` : `/employers/${user.id}`);
                    // Minimal refresh of localStorage (simplified)
                    const updatedUser = { ...user, tier: profileRes.data.tier, isSubscribed: true };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }
            } catch (err) {
                console.warn('Verification check failed (webhook might still be processing):', err.message);
                // We don't block the UI here because the webhook usually wins
            } finally {
                setVerifying(false);
            }
        };

        verifyPayment();
    }, [txRef]);

    if (verifying) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
                <Loader className="spin" size={48} color="var(--primary)" style={{ margin: '0 auto 20px' }} />
                <h2>{t('finalizing_payment') || 'Finalizing your payment...'}</h2>
                <p>{t('please_wait_msg') || 'Please wait while we activate your subscription.'}</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ textAlign: 'center', padding: '100px 20px', maxWidth: '600px' }}>
            <div style={{ background: '#f0fdf4', padding: '40px', borderRadius: '24px', border: '1px solid #dcfce7' }}>
                <CheckCircle size={80} color="#10b981" style={{ margin: '0 auto 20px' }} />
                <h1 style={{ color: '#166534', marginBottom: '10px' }}>{t('payment_received') || 'Payment Received!'}</h1>
                <p style={{ color: '#15803d', fontSize: '1.1rem', marginBottom: '30px' }}>
                    {t('subscription_activated_msg') || 'Your premium subscription has been successfully activated. Enjoy full access to EDWL!'}
                </p>
                
                {txRef && (
                    <div style={{ background: 'white', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', color: '#666', marginBottom: '30px', border: '1px solid #eee' }}>
                        Reference: <code>{txRef}</code>
                    </div>
                )}

                <div style={{ display: 'grid', gap: '15px' }}>
                    <button 
                        onClick={() => navigate('/')}
                        className="btn-primary"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                    >
                        {t('go_to_home')} <ArrowRight size={18} />
                    </button>
                    <button 
                        onClick={() => {
                            const user = authService.getCurrentUser();
                            navigate(user?.role === 'JOB_SEEKER' ? '/dashboard/seeker' : '/dashboard/employer');
                        }}
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {t('view_dashboard') || 'Go to Dashboard'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
