import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, Bot, CreditCard, RefreshCw, Send, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import api from '../../services/api';

const money = (value) => `${Number(value || 0).toLocaleString()} ETB`;

const priorityColor = {
    HIGH: '#ef4444',
    MEDIUM: '#f59e0b',
    LOW: '#10b981'
};

const scoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 55) return '#f59e0b';
    return '#ef4444';
};

const MetricCard = ({ icon: Icon, label, value, subtext, color = '#38bdf8' }) => (
    <div style={{ background: 'rgba(15, 23, 42, 0.72)', border: '1px solid rgba(148, 163, 184, 0.16)', borderRadius: '12px', padding: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>{label}</div>
            <Icon size={18} color={color} />
        </div>
        <div style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: 900 }}>{value}</div>
        {subtext && <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '6px' }}>{subtext}</div>}
    </div>
);

const OwnerAutopilot = () => {
    const [brief, setBrief] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    const fetchBrief = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/admin/owner-autopilot');
            setBrief(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load owner autopilot brief.');
        } finally {
            setLoading(false);
        }
    };

    const sendDigest = async () => {
        setSending(true);
        setError('');
        try {
            const res = await api.post('/admin/owner-autopilot/send');
            setBrief(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send digest.');
        } finally {
            setSending(false);
        }
    };

    useEffect(() => {
        fetchBrief();
    }, []);

    if (loading) {
        return (
            <div style={{ padding: '40px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <RefreshCw size={18} /> Loading owner autopilot...
            </div>
        );
    }

    if (!brief) {
        return (
            <div style={{ background: '#7f1d1d', color: 'white', padding: '18px', borderRadius: '12px' }}>
                {error || 'Owner autopilot is unavailable.'}
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gap: '22px' }}>
            {error && (
                <div style={{ background: '#7f1d1d', color: 'white', padding: '14px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertTriangle size={18} /> {error}
                </div>
            )}

            <section style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(2, 6, 23, 0.96))', border: '1px solid rgba(148, 163, 184, 0.18)', borderRadius: '14px', padding: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(56, 189, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bot size={28} color="#38bdf8" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, color: 'white', fontSize: '1.35rem' }}>Owner Autopilot</h3>
                            <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
                                {new Date(brief.generatedAt).toLocaleString()}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800 }}>Sleep Score</div>
                            <div style={{ color: scoreColor(brief.sleepScore), fontSize: '2rem', fontWeight: 900 }}>{brief.sleepScore}/100</div>
                        </div>
                        <button onClick={fetchBrief} style={{ border: '1px solid rgba(148, 163, 184, 0.25)', background: 'transparent', color: '#f8fafc', borderRadius: '10px', padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
                            <RefreshCw size={16} /> Refresh
                        </button>
                        <button onClick={sendDigest} disabled={sending} style={{ border: 'none', background: '#10b981', color: '#052e16', borderRadius: '10px', padding: '10px 14px', cursor: sending ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 900 }}>
                            <Send size={16} /> {sending ? 'Sending...' : 'Send Digest'}
                        </button>
                    </div>
                </div>
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <MetricCard icon={CreditCard} label="24h Revenue" value={money(brief.revenue.revenue24h)} subtext={`7d ${money(brief.revenue.revenue7d)}`} color="#10b981" />
                <MetricCard icon={Activity} label="Automation Share" value={`${brief.revenue.automatedShare}%`} subtext={`${money(brief.revenue.automatedRevenue)} automated`} color="#38bdf8" />
                <MetricCard icon={Users} label="Premium Conversion" value={`${brief.marketplace.conversionRate}%`} subtext={`${brief.marketplace.premiumEmployers}/${brief.marketplace.totalEmployers} employers`} color="#8b5cf6" />
                <MetricCard icon={ShieldCheck} label="Trust Queue" value={brief.trust.pendingVerificationCount} subtext={`${brief.trust.overdueVerificationCount} overdue, ${brief.trust.openDisputes} disputes`} color="#f59e0b" />
            </div>

            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.72)', border: '1px solid rgba(148, 163, 184, 0.16)', borderRadius: '12px', padding: '18px' }}>
                    <h4 style={{ color: '#f8fafc', margin: '0 0 16px 0' }}>Action Queue</h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {brief.actions.length === 0 ? (
                            <div style={{ color: '#94a3b8', padding: '16px', border: '1px dashed rgba(148, 163, 184, 0.3)', borderRadius: '10px' }}>No urgent action queue.</div>
                        ) : brief.actions.map(action => (
                            <div key={action.key} style={{ border: '1px solid rgba(148, 163, 184, 0.14)', borderLeft: `4px solid ${priorityColor[action.priority] || '#38bdf8'}`, borderRadius: '10px', padding: '14px', background: 'rgba(2, 6, 23, 0.55)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
                                    <strong style={{ color: '#f8fafc' }}>{action.title}</strong>
                                    <span style={{ color: priorityColor[action.priority] || '#38bdf8', fontSize: '0.72rem', fontWeight: 900 }}>{action.priority}</span>
                                </div>
                                <div style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '6px' }}>{action.impact}</div>
                                <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{action.ownerAction}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'grid', gap: '18px' }}>
                    <div style={{ background: 'rgba(15, 23, 42, 0.72)', border: '1px solid rgba(148, 163, 184, 0.16)', borderRadius: '12px', padding: '18px' }}>
                        <h4 style={{ color: '#f8fafc', margin: '0 0 14px 0' }}>Retention</h4>
                        <div style={{ color: '#cbd5e1', display: 'grid', gap: '10px', fontSize: '0.9rem' }}>
                            <div>Expiring employers: <strong>{brief.retention.expiringEmployers}</strong></div>
                            <div>Expiring seekers: <strong>{brief.retention.expiringSeekers}</strong></div>
                            <div>Inactive free employers: <strong>{brief.retention.inactiveFreeEmployers.length}</strong></div>
                            <div>Comeback conversion: <strong>{brief.retention.comebackCodes.conversionRate}%</strong></div>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(15, 23, 42, 0.72)', border: '1px solid rgba(148, 163, 184, 0.16)', borderRadius: '12px', padding: '18px' }}>
                        <h4 style={{ color: '#f8fafc', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp size={18} /> Demand Shortages</h4>
                        <div style={{ display: 'grid', gap: '8px' }}>
                            {brief.marketplace.demandShortages.length === 0 ? (
                                <div style={{ color: '#94a3b8', fontSize: '0.86rem' }}>No shortage location detected.</div>
                            ) : brief.marketplace.demandShortages.map(item => (
                                <div key={item.location} style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', fontSize: '0.88rem' }}>
                                    <span>{item.location}</span>
                                    <strong style={{ color: '#f59e0b' }}>+{item.shortage}</strong>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default OwnerAutopilot;
