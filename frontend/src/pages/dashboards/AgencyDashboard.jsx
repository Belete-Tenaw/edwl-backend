import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { 
    Users, 
    Briefcase, 
    TrendingUp, 
    Shield, 
    Plus, 
    Search, 
    Filter, 
    MoreVertical, 
    ExternalLink, 
    CheckCircle, 
    Clock, 
    AlertCircle,
    DollarSign,
    BarChart3,
    Settings,
    Bell,
    MapPin,
    Zap,
    Cpu
} from 'lucide-react';
import authService from '../../services/authService';
import api from '../../services/api';
import BackButton from '../../components/BackButton';

const AgencyDashboard = () => {
    const { t } = useTranslation();
    const user = authService.getCurrentUser();
    const [activeTab, setActiveTab] = useState('fleet');
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFleet = async () => {
            try {
                const response = await api.get('/agencies/fleet');
                const normalized = response.data.workers.map(w => ({
                    id: w.id,
                    name: w.fullName,
                    status: w.escrowContracts?.length > 0 ? 'MATCHED' : 'AVAILABLE',
                    rating: w.rating,
                    experience: `${w.experienceYears} ${t('years')}`,
                    earnings: w.escrowContracts?.reduce((acc, curr) => acc + curr.amount, 0) || 0,
                    lastActive: t('recently') || 'Recently'
                }));
                setWorkers(normalized);
            } catch (err) {
                console.error('Failed to fetch fleet:', err);
                // Mock data for premium demo
                setWorkers([
                    { id: '1', name: 'Almaz Tadesse', status: 'MATCHED', rating: 4.9, experience: '5 years', earnings: 12500, lastActive: '2 min ago' },
                    { id: '2', name: 'Sara Kebede', status: 'AVAILABLE', rating: 4.7, experience: '3 years', earnings: 8400, lastActive: '1 hour ago' },
                    { id: '3', name: 'Mulu Solomon', status: 'MATCHED', rating: 4.8, experience: '8 years', earnings: 15200, lastActive: 'Recently' },
                    { id: '4', name: 'Hanna Alemu', status: 'DISPUTED', rating: 4.2, experience: '2 years', earnings: 3100, lastActive: 'Just now' },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchFleet();
    }, []);

    const stats = [
        { label: 'Total Fleet', value: workers.length, icon: Users, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.1)' },
        { label: 'Active Matches', value: workers.filter(w => w.status === 'MATCHED').length, icon: Briefcase, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
        { label: 'Fleet Revenue', value: `${workers.reduce((acc, w) => acc + w.earnings, 0).toLocaleString()} ETB`, icon: DollarSign, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
        { label: 'Reliability', value: '98.4%', icon: Zap, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
    ];

    return (
        <div style={{ background: '#020617', minHeight: '100vh', color: '#f8fafc', fontFamily: "'Outfit', sans-serif" }}>
            <Helmet>
                <title>Agency AaaS | EDWL Premium Dashboard</title>
            </Helmet>

            <style>{`
                .glass-panel {
                    background: rgba(30, 41, 59, 0.7);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    padding: 32px;
                }
                .sidebar-item { 
                    display: flex; align-items: center; gap: 12px; padding: 14px 20px; border-radius: 16px; cursor: pointer; 
                    transition: all 0.3s; color: #94a3b8; font-weight: 700; margin-bottom: 8px; 
                }
                .sidebar-item.active { background: rgba(56, 189, 248, 0.1); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.2); }
                .sidebar-item:hover:not(.active) { background: rgba(255, 255, 255, 0.05); color: white; }
                
                .stat-card { 
                    background: rgba(30, 41, 59, 0.4); border-radius: 24px; padding: 24px; border: 1px solid rgba(255,255,255,0.05);
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .stat-card:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.1); }
                
                .worker-row { 
                    background: rgba(255, 255, 255, 0.02); border-radius: 20px; padding: 16px 24px; border: 1px solid rgba(255,255,255,0.05); 
                    margin-bottom: 12px; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 0.5fr; align-items: center; transition: all 0.3s; 
                }
                .worker-row:hover { background: rgba(255, 255, 255, 0.05); border-color: #38bdf8; transform: scale(1.005); }
                
                .status-badge { padding: 6px 14px; border-radius: 40px; font-size: 0.7rem; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
            `}</style>

            <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '40px' }}>
                
                {/* SIDEBAR */}
                <aside style={{ height: 'calc(100vh - 80px)', position: 'sticky', top: '40px' }}>
                    <div className="glass-panel" style={{ height: '100%', padding: '24px' }}>
                        <div style={{ padding: '0 8px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#38bdf8', marginBottom: '8px' }}>
                                <Cpu size={20} />
                                <span style={{ fontWeight: '900', letterSpacing: '2px', fontSize: '0.8rem' }}>EDWL AGENTIC</span>
                            </div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'white' }}>{user?.name || 'AaaS Portal'}</div>
                        </div>
                        
                        <nav>
                            <div className={`sidebar-item ${activeTab === 'fleet' ? 'active' : ''}`} onClick={() => setActiveTab('fleet')}>
                                <Users size={20} /> Fleet Core
                            </div>
                            <div className={`sidebar-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
                                <BarChart3 size={20} /> Intelligence
                            </div>
                            <div className={`sidebar-item ${activeTab === 'escrow' ? 'active' : ''}`} onClick={() => setActiveTab('escrow')}>
                                <Shield size={20} /> Escrow Hub
                            </div>
                            <div className={`sidebar-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                                <Settings size={20} /> Enterprise API
                            </div>
                        </nav>

                        <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
                            <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #020617)', borderRadius: '20px', padding: '20px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                                <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: '900', marginBottom: '12px' }}>FLEET CAPACITY</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '4px' }}>82%</div>
                                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                                    <div style={{ width: '82%', height: '100%', background: '#38bdf8', boxShadow: '0 0 10px #38bdf8' }} />
                                </div>
                                <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '12px', lineHeight: 1.5 }}>
                                    Upgrade to <b>Enterprise</b> for unlimited fleet slots.
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main>
                    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                        <div>
                            <h1 style={{ fontSize: '2.2rem', fontWeight: '900', marginBottom: '8px' }}>Agency Command Center</h1>
                            <p style={{ color: '#94a3b8' }}>Real-time monitoring and AI-driven fleet optimization.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button className="glass-panel" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '10px', color: 'white', cursor: 'pointer' }}>
                                <Bell size={20} />
                            </button>
                            <button style={{ 
                                background: '#38bdf8', color: '#0f172a', border: 'none', padding: '12px 28px', borderRadius: '16px', fontWeight: '900', 
                                display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', boxShadow: '0 10px 20px rgba(56, 189, 248, 0.2)' 
                            }}>
                                <Plus size={20} strokeWidth={3} /> Onboard Worker
                            </button>
                        </div>
                    </header>

                    {/* STATS GRID */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '48px' }}>
                        {stats.map((s, i) => (
                            <div key={i} className="stat-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <div style={{ width: '48px', height: '48px', background: s.bg, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <s.icon size={24} color={s.color} />
                                    </div>
                                    <TrendingUp size={18} color="#10b981" />
                                </div>
                                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'white', marginBottom: '4px' }}>{s.value}</div>
                                <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* FLEET LIST */}
                    <div className="glass-panel" style={{ padding: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: '900' }}>Fleet Management</h2>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ position: 'relative' }}>
                                    <Search size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input type="text" placeholder="Search workers..." style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 20px 12px 44px', borderRadius: '12px', color: 'white', width: '280px' }} />
                                </div>
                                <button className="sidebar-item" style={{ margin: 0, padding: '12px 20px' }}>
                                    <Filter size={18} /> Filter
                                </button>
                            </div>
                        </div>

                        <div style={{ padding: '0 24px 16px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 0.5fr', fontSize: '0.75rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            <div>Worker Identity</div>
                            <div>Current Status</div>
                            <div>AI Trust</div>
                            <div>Total Revenue</div>
                            <div></div>
                        </div>

                        {workers.map((worker) => (
                            <div key={worker.id} className="worker-row">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ 
                                        width: '48px', height: '48px', borderRadius: '14px', 
                                        background: 'linear-gradient(135deg, #38bdf8, #1e3a8a)', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.2rem' 
                                    }}>
                                        {worker.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '800', color: 'white', fontSize: '1rem' }}>{worker.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{worker.experience} · {worker.lastActive}</div>
                                    </div>
                                </div>
                                <div>
                                    <span className="status-badge" style={{ 
                                        background: worker.status === 'MATCHED' ? 'rgba(16, 185, 129, 0.1)' : worker.status === 'AVAILABLE' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        color: worker.status === 'MATCHED' ? '#10b981' : worker.status === 'AVAILABLE' ? '#38bdf8' : '#ef4444',
                                        border: `1px solid ${worker.status === 'MATCHED' ? 'rgba(16, 185, 129, 0.2)' : worker.status === 'AVAILABLE' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                                    }}>
                                        {worker.status}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: '900' }}>
                                    <Star size={16} fill="#f59e0b" /> {worker.rating}
                                </div>
                                <div style={{ fontWeight: '900', color: 'white', fontSize: '1rem' }}>
                                    {worker.earnings.toLocaleString()} <small style={{ color: '#64748b' }}>ETB</small>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'white'} onMouseOut={e => e.currentTarget.style.color = '#64748b'}>
                                        <MoreVertical size={24} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ACTIVITY & LIVE PRESENCE */}
                    <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px' }}>
                        <div className="glass-panel">
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '24px' }}>Live Activity</h3>
                            {[
                                { icon: CheckCircle, color: '#10b981', text: 'Contract signed: Almaz T.', time: '2m ago' },
                                { icon: Clock, color: '#38bdf8', text: 'Payout initiated: 42k ETB', time: '5h ago' },
                                { icon: AlertCircle, color: '#ef4444', text: 'Dispute opened: Sara K.', time: '1d ago' },
                            ].map((act, i) => (
                                <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'flex-start' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px' }}>
                                        <act.icon size={20} color={act.color} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.95rem', fontWeight: '700' }}>{act.text}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{act.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 1 }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '4px' }}>Fleet Presence</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '0.75rem', fontWeight: '900' }}>
                                    <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }} />
                                    LIVE TRACKING ACTIVE
                                </div>
                            </div>
                            <div style={{ height: '240px', background: 'rgba(0,0,0,0.2)', borderRadius: '20px', marginTop: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                <MapPin size={48} color="#38bdf8" style={{ animation: 'float 3s infinite ease-in-out' }} />
                                <div style={{ position: 'absolute', width: '150px', height: '150px', border: '2px solid rgba(56, 189, 248, 0.1)', borderRadius: '50%', animation: 'ping 2s infinite' }} />
                                <p style={{ position: 'absolute', bottom: '20px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700' }}>
                                    Addis Ababa, Central Region Monitoring
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AgencyDashboard;

