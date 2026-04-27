import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Target, TrendingUp, Users, Ticket, CheckCircle, BarChart3, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import BackButton from '../../components/BackButton';

const MarketingDashboard = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMarketingStats();
    }, []);

    const fetchMarketingStats = async () => {
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data.metrics.marketingStats);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch marketing stats', err);
            setError(err.response?.data?.error || 'Failed to fetch data');
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading marketing engine data...</div>;
    if (error) return <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>Error: {error}</div>;

    const StatCard = ({ icon: Icon, title, value, subtitle, gradient }) => (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '25px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
        }}>
            <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                background: gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                flexShrink: 0
            }}>
                <Icon size={30} />
            </div>
            <div>
                <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {title}
                </h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a', margin: '5px 0' }}>
                    {value}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                    {subtitle}
                </div>
            </div>
        </div>
    );

    return (
        <div className="container" style={{ padding: '30px 20px', maxWidth: '1200px', margin: '0 auto' }}>
            <BackButton fallback="/admin" label="Back to Admin Panel" />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                <div style={{ width: '50px', height: '50px', background: 'linear-gradient(135deg, #FF4500 0%, #ff8533 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Target size={26} color="white" />
                </div>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#1e293b' }}>Automated LTV Marketing</h1>
                    <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Monitor autonomous re-engagement campaigns targeting stalled employers.</p>
                </div>
            </div>

            <div style={{ 
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
                borderRadius: '16px', 
                padding: '25px', 
                color: 'white', 
                marginBottom: '30px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem' }}>
                        <TrendingUp size={20} color="#38bdf8" /> 
                        Money While You Sleep Engine
                    </h2>
                    <p style={{ margin: '10px 0 0 0', color: '#94a3b8', fontSize: '0.95rem' }}>
                        The backend node-cron runs daily at 11:00 AM, automatically identifying 7-day inactive Free-tier employers and dispatching unique 'COMEBACK' promo codes via Telegram.
                    </p>
                </div>
                <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '10px 20px', borderRadius: '30px', color: '#38bdf8', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    <span className="pulse-dot" style={{ display: 'inline-block', width: '8px', height: '8px', background: '#38bdf8', borderRadius: '50%', marginRight: '8px' }}></span>
                    Active & Running
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <StatCard 
                    icon={Ticket}
                    title="Promo Codes Sent"
                    value={stats?.promoCodesSent || 0}
                    subtitle={<><TrendingUp size={14} /> Total stalled users reached</>}
                    gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                />
                
                <StatCard 
                    icon={CheckCircle}
                    title="Codes Redeemed"
                    value={stats?.promoCodesUsed || 0}
                    subtitle={<><Users size={14} /> Employers successfully reactivated</>}
                    gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                />

                <StatCard 
                    icon={BarChart3}
                    title="Conversion Rate"
                    value={`${stats?.conversionRate || 0}%`}
                    subtitle={<><AlertCircle size={14} /> Campaign Effectiveness</>}
                    gradient="linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)"
                />
            </div>
            
            <div style={{ marginTop: '40px', textAlign: 'center', padding: '30px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                <h3 style={{ color: '#475569', margin: '0 0 10px 0' }}>Estimated Generated LTV Revenue</h3>
                <div style={{ fontSize: '3rem', fontWeight: '900', color: '#0f172a' }}>
                    {((stats?.promoCodesUsed || 0) * 500).toLocaleString()} <span style={{ fontSize: '1.5rem', color: '#64748b' }}>ETB</span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '10px 0 0 0' }}>
                    *Based on minimum Silver Tier renewal cost of 500 ETB.
                </p>
            </div>
        </div>
    );
};

export default MarketingDashboard;
