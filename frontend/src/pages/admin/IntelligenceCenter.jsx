import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { TrendingUp, Users, Briefcase, DollarSign, MapPin, Search, Activity, ShieldCheck, Zap } from 'lucide-react';

const IntelligenceCenter = () => {
    const { t } = useTranslation();
    const [trends, setTrends] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ role: 'NANNY', city: 'Addis Ababa' });

    useEffect(() => {
        fetchTrends();
    }, [filters]);

    const fetchTrends = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/ai/market/trends?role=${filters.role}&city=${filters.city}`);
            setTrends(response.data);
        } catch (error) {
            console.error('Error fetching trends:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '40px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Intelligence Center</h1>
                    <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>Global Market Analytics & Predictive Pricing Engine</p>
                </div>
                <div className="glass" style={{ display: 'flex', gap: '15px', padding: '15px', borderRadius: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '800' }}>
                        <Zap size={20} className="ai-pulse" /> Live Feed Active
                    </div>
                </div>
            </div>

            {/* FILTERS */}
            <div className="glass" style={{ padding: '25px', borderRadius: '20px', display: 'flex', gap: '20px', marginBottom: '40px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontWeight: '700', marginBottom: '10px', fontSize: '0.9rem' }}>Service Category</label>
                    <select 
                        value={filters.role} 
                        onChange={(e) => setFilters({...filters, role: e.target.value})}
                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'white' }}
                    >
                        <option value="NANNY">Nanny & Childcare</option>
                        <option value="HOUSEKEEPER">Housekeeping</option>
                        <option value="COOK">Professional Chef</option>
                        <option value="DRIVER">Private Driver</option>
                    </select>
                </div>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontWeight: '700', marginBottom: '10px', fontSize: '0.9rem' }}>Regional Market</label>
                    <select 
                        value={filters.city} 
                        onChange={(e) => setFilters({...filters, city: e.target.value})}
                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'white' }}
                    >
                        <option value="Addis Ababa">Addis Ababa (HQ)</option>
                        <option value="Dire Dawa">Dire Dawa</option>
                        <option value="Bahir Dar">Bahir Dar</option>
                        <option value="Hawassa">Hawassa</option>
                    </select>
                </div>
                <button className="btn-primary" style={{ height: '48px', padding: '0 30px' }} onClick={fetchTrends}>
                    <Search size={20} /> Update Intelligence
                </button>
            </div>

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
                    {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '200px' }} />)}
                </div>
            ) : trends && (
                <div style={{ animation: 'fadeInUp 0.6s var(--transition)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px', marginBottom: '40px' }}>
                        <div className="card" style={{ padding: '30px' }}>
                            <DollarSign size={32} color="var(--primary)" style={{ marginBottom: '15px' }} />
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Avg Market Salary</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--navy)' }}>{trends.averageSalary} ETB</div>
                            <div style={{ color: '#16a34a', fontSize: '0.85rem', fontWeight: '700', marginTop: '10px' }}>
                                <TrendingUp size={14} style={{ display: 'inline' }} /> +12.4% this month
                            </div>
                        </div>
                        <div className="card" style={{ padding: '30px' }}>
                            <Activity size={32} color="var(--accent)" style={{ marginBottom: '15px' }} />
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Demand Score</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--navy)' }}>{Math.round(trends.demandScore * 100)}/100</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '10px' }}>Critical Supply Shortage</div>
                        </div>
                        <div className="card" style={{ padding: '30px' }}>
                            <Users size={32} color="#7c3aed" style={{ marginBottom: '15px' }} />
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Active Pool</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--navy)' }}>{trends.activeSeekers}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '10px' }}>Verified Candidates</div>
                        </div>
                        <div className="card" style={{ padding: '30px' }}>
                            <Briefcase size={32} color="var(--primary-light)" style={{ marginBottom: '15px' }} />
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Open Positions</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--navy)' }}>{trends.openJobs}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '10px' }}>Pending Hires</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
                        <div className="glass" style={{ padding: '40px', borderRadius: '25px' }}>
                            <h2 style={{ marginBottom: '30px' }}>AI Pricing Recommendation</h2>
                            <div style={{ background: 'white', borderRadius: '20px', padding: '30px', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <span style={{ fontWeight: '700' }}>Competitive Range</span>
                                    <span style={{ color: 'var(--primary)', fontWeight: '900' }}>{trends.suggestedPriceRange.min} - {trends.suggestedPriceRange.max} ETB</span>
                                </div>
                                <div style={{ height: '12px', background: 'var(--secondary)', borderRadius: '6px', position: 'relative', marginBottom: '30px' }}>
                                    <div style={{ position: 'absolute', left: '40%', right: '20%', height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--primary-light))', borderRadius: '6px' }}></div>
                                    <div style={{ position: 'absolute', left: '55%', top: '-8px', width: '4px', height: '28px', background: 'var(--accent)', borderRadius: '2px' }}></div>
                                </div>
                                <div style={{ display: 'flex', gap: '15px', background: 'var(--primary-glow)', padding: '20px', borderRadius: '15px' }}>
                                    <ShieldCheck size={24} color="var(--primary)" />
                                    <div>
                                        <div style={{ fontWeight: '800', fontSize: '0.9rem', marginBottom: '4px' }}>Optimal Retention Rate</div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text)', opacity: 0.8 }}>
                                            Setting the salary at <strong>6,200 ETB</strong> is predicted to increase worker retention by 34% in the <strong>{filters.city}</strong> market.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass" style={{ padding: '40px', borderRadius: '25px' }}>
                            <h2 style={{ marginBottom: '30px' }}>Market Sentiment</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {[
                                    { label: 'Worker Satisfaction', val: 88, color: 'var(--primary)' },
                                    { label: 'Employer Confidence', val: 92, color: 'var(--primary-light)' },
                                    { label: 'Payment Reliability', val: 97, color: '#16a34a' }
                                ].map(item => (
                                    <div key={item.label}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '700', marginBottom: '8px' }}>
                                            <span>{item.label}</span>
                                            <span>{item.val}%</span>
                                        </div>
                                        <div style={{ height: '8px', background: 'var(--secondary)', borderRadius: '4px' }}>
                                            <div style={{ height: '100%', width: `${item.val}%`, background: item.color, borderRadius: '4px' }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntelligenceCenter;
