import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { Plus, Table, Search, Copy, Check, Filter, Trash2, Shield, Calendar, Clock, Zap, Cpu } from 'lucide-react';

const PremiumCodeFactory = () => {
    const { t } = useTranslation();
    const [codes, setCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [params, setParams] = useState({
        codeType: 'TIME_EXTENSION',
        tierUpgrade: 'SILVER_ACCESS',
        durationDays: 30,
        count: 5
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [copiedCode, setCopiedCode] = useState(null);

    useEffect(() => {
        fetchCodes();
    }, [statusFilter]);

    const fetchCodes = async () => {
        setLoading(true);
        try {
            const queryParams = { 
                code: searchTerm,
                status: statusFilter === 'ALL' ? undefined : statusFilter
            };
            const res = await api.get('/admin/codes', { params: queryParams });
            setCodes(res.data.codes);
        } catch (err) {
            console.error("Failed to fetch codes", err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            await api.post('/admin/codes/generate', params);
            alert(`Generated ${params.count} codes successfully!`);
            fetchCodes();
        } catch (err) {
            console.error("Generation failed", err);
            alert("Failed to generate codes: " + (err.response?.data?.error || err.message));
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <div style={{ color: 'white' }}>
            <style>{`
                .glass-card {
                    background: rgba(30, 41, 59, 0.5);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    padding: 32px;
                }
                .glow-btn {
                    background: #38bdf8;
                    color: #0f172a;
                    border: none;
                    padding: 14px 28px;
                    border-radius: 16px;
                    font-weight: 900;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 10px 20px rgba(56, 189, 248, 0.2);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .glow-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 30px rgba(56, 189, 248, 0.3);
                }
                .input-dark {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 12px 16px;
                    border-radius: 12px;
                    color: white;
                    outline: none;
                }
                .input-dark:focus { border-color: #38bdf8; }
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Cpu size={28} color="#38bdf8" /> Revenue Code Forge
                    </h2>
                    <p style={{ color: '#94a3b8', marginTop: '4px' }}>Secure bulk generation for platform monetization.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <select className="input-dark" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="ALL">All Statuses</option>
                        <option value="UNUSED">Active Codes</option>
                        <option value="USED">Redeemed</option>
                        <option value="EXPIRED">Expired</option>
                    </select>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input className="input-dark" style={{ paddingLeft: '44px', width: '280px' }} placeholder="Search codes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '32px' }}>
                {/* Generation Form */}
                <div className="glass-card" style={{ alignSelf: 'start' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Zap size={20} color="#f59e0b" /> Mint New Codes
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#64748b', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Utility Type</label>
                            <select className="input-dark" style={{ width: '100%' }} value={params.codeType} onChange={(e) => setParams({...params, codeType: e.target.value})}>
                                <option value="TIME_EXTENSION">Premium Subscription</option>
                                <option value="TRUST_UPGRADE">Verification Tier Upgrade</option>
                            </select>
                        </div>

                        {params.codeType === 'TRUST_UPGRADE' ? (
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#64748b', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Target Verification</label>
                                <select className="input-dark" style={{ width: '100%' }} value={params.tierUpgrade} onChange={(e) => setParams({...params, tierUpgrade: e.target.value})}>
                                    <option value="SILVER_ACCESS">Silver Tier</option>
                                    <option value="GOLD_ACCESS">Gold Tier</option>
                                    <option value="PLATINUM_ACCESS">Platinum Tier</option>
                                </select>
                            </div>
                        ) : (
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#64748b', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Duration (Days)</label>
                                <input type="number" className="input-dark" style={{ width: '100%' }} value={params.durationDays} onChange={(e) => setParams({...params, durationDays: parseInt(e.target.value)})} />
                            </div>
                        )}

                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#64748b', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Batch Quantity</label>
                            <input type="number" className="input-dark" style={{ width: '100%' }} value={params.count} onChange={(e) => setParams({...params, count: parseInt(e.target.value)})} min="1" max="100" />
                        </div>

                        <button className="glow-btn" style={{ width: '100%', marginTop: '16px' }} onClick={handleGenerate} disabled={generating}>
                            {generating ? 'PROCESSING...' : <><Zap size={18} fill="currentColor" /> FORGE BATCH</>}
                        </button>
                    </div>
                </div>

                {/* Inventory Table */}
                <div className="glass-card">
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Table size={20} color="#38bdf8" /> Security Inventory
                    </h3>
                    
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase' }}>Security Key</th>
                                    <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase' }}>Utility</th>
                                    <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase' }}>Value</th>
                                    <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '16px', textAlign: 'center' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '60px', opacity: 0.5 }}><Clock size={32} style={{ animation: 'spin 2s linear infinite' }} /></td></tr>
                                ) : codes.map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' }}>
                                        <td style={{ padding: '16px' }}>
                                            <code style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '8px 14px', borderRadius: '10px', fontWeight: '900', letterSpacing: '1px' }}>{item.code}</code>
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.9rem', color: '#94a3b8' }}>
                                            {item.codeType === 'TIME_EXTENSION' ? 'Subscription' : 'Tier Upgrade'}
                                        </td>
                                        <td style={{ padding: '16px', fontWeight: '900' }}>
                                            {item.codeType === 'TIME_EXTENSION' ? `${item.durationDays}D` : item.tierUpgrade?.split('_')[0]}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ 
                                                padding: '6px 14px', borderRadius: '40px', fontSize: '0.7rem', fontWeight: '900',
                                                background: item.status === 'UNUSED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: item.status === 'UNUSED' ? '#10b981' : '#ef4444',
                                                border: `1px solid ${item.status === 'UNUSED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                                            }}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            <button onClick={() => handleCopy(item.code)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', color: copiedCode === item.code ? '#10b981' : '#94a3b8' }}>
                                                {copiedCode === item.code ? <Check size={20} /> : <Copy size={20} />}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PremiumCodeFactory;

