import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Key } from 'lucide-react';

const Activate = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            await api.post('/payments/activate-code', { code });
            setSuccess(t('subscription_activated_success') || 'Subscription activated successfully!');
            setTimeout(() => {
                const role = user?.role;
                if (role === 'EMPLOYER') navigate('/dashboard/employer');
                else if (role === 'JOB_SEEKER') navigate('/dashboard/seeker');
                else navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || t('invalid_code'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '80px 20px', display: 'flex', justifyContent: 'center' }}>
            <div className="card" style={{ maxWidth: '450px', width: '100%', textAlign: 'center', padding: '40px' }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#fff0e6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px'
                }}>
                    <Key size={30} color="var(--primary)" />
                </div>

                <h2 style={{ marginBottom: '10px' }}>{t('enter_code')}</h2>
                <p style={{ color: '#666', marginBottom: '30px' }}>{t('premium_msg')}</p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="EDWL-XXXX-XXXX"
                        style={{
                            width: '100%',
                            padding: '15px',
                            borderRadius: '10px',
                            border: '1px solid #ddd',
                            fontSize: '1.2rem',
                            textAlign: 'center',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            marginBottom: '20px'
                        }}
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        required
                    />

                    {error && <div style={{ color: 'red', marginBottom: '15px', fontSize: '0.9rem' }}>{error}</div>}
                    {success && <div style={{ color: 'green', marginBottom: '15px', fontSize: '0.9rem' }}>{success}</div>}

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%', padding: '15px' }}
                        disabled={loading}
                    >
                        {loading ? '...' : t('activate')}
                    </button>
                </form>

                <div style={{ marginTop: '30px', fontSize: '0.9rem', color: '#666' }}>
                    {t('contact_telegram')}
                </div>
            </div>
        </div>
    );
};

export default Activate;
