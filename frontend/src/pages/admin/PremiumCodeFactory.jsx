import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { Plus, Table, Search, Copy, Check, Filter, Trash2, Shield, Calendar, Clock } from 'lucide-react';

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
        <div style={{ padding: '0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}>
                    <Shield size={28} /> Premium Code Factory
                </h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div className="input-with-icon" style={{ position: 'relative' }}>
                        <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff' }}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="UNUSED">Unused (Active)</option>
                            <option value="USED">Used</option>
                            <option value="EXPIRED">Expired</option>
                        </select>
                    </div>
                    <div className="input-with-icon" style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                        <input 
                            type="text" 
                            placeholder="Search codes..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && fetchCodes()}
                            style={{ padding: '10px 15px 10px 40px', borderRadius: '8px', border: '1px solid #ddd', width: '250px' }}
                        />
                    </div>
                    <button className="btn-primary" onClick={fetchCodes} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Filter size={18} /> Filter
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '30px' }}>
                {/* Generation Form */}
                <div className="card" style={{ alignSelf: 'start', padding: '25px', borderRadius: '15px' }}>
                    <h3 style={{ marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                        <Plus size={20} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Bulk Generation
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Code Type</label>
                            <select 
                                value={params.codeType} 
                                onChange={(e) => setParams({...params, codeType: e.target.value})}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                            >
                                <option value="TIME_EXTENSION">Time Extension (Subscription)</option>
                                <option value="TRUST_UPGRADE">Trust Upgrade (Tier Change)</option>
                            </select>
                        </div>

                        {params.codeType === 'TRUST_UPGRADE' ? (
                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Target Tier</label>
                                <select 
                                    value={params.tierUpgrade} 
                                    onChange={(e) => setParams({...params, tierUpgrade: e.target.value})}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                                >
                                    <option value="SILVER_ACCESS">Silver</option>
                                    <option value="GOLD_ACCESS">Gold</option>
                                    <option value="PLATINUM_ACCESS">Platinum</option>
                                </select>
                            </div>
                        ) : (
                            <div>
                                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Duration (Days)</label>
                                <input 
                                    type="number" 
                                    value={params.durationDays} 
                                    onChange={(e) => setParams({...params, durationDays: parseInt(e.target.value)})}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                                />
                            </div>
                        )}

                        <div>
                            <label style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Number of Codes</label>
                            <input 
                                type="number" 
                                value={params.count} 
                                onChange={(e) => setParams({...params, count: parseInt(e.target.value)})}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                                min="1"
                                max="100"
                            />
                        </div>

                        <button 
                            className="btn-primary" 
                            style={{ marginTop: '10px', padding: '14px', borderRadius: '10px', fontSize: '1rem' }} 
                            onClick={handleGenerate}
                            disabled={generating}
                        >
                            {generating ? 'Generating...' : '⚡ Generate Secure Codes'}
                        </button>
                    </div>
                </div>

                {/* Node D: Quick-Issue Panel */}
                <div className="card" style={{ alignSelf: 'start', padding: '25px', borderRadius: '15px', background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                    <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1' }}>
                        <Clock size={20} /> {t('quick_issue_code')}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '20px' }}>Instant 30-day code for support chat.</p>
                    
                    <button 
                        className="btn-primary" 
                        style={{ width: '100%', padding: '12px', background: '#0284c7' }}
                        onClick={async () => {
                            try {
                                const res = await api.post('/admin/codes/generate', {
                                    codeType: 'TIME_EXTENSION',
                                    durationDays: 30,
                                    count: 1
                                });
                                const newCode = res.data.codes[0].code;
                                handleCopy(newCode); 
                                alert(`Code ${newCode} generated!\n\nYou can now copy the full message below.`);
                                fetchCodes();
                            } catch (err) {
                                alert("Failed to quick-issue code");
                            }
                        }}
                    >
                        ⚡ Generate & Copy Code
                    </button>

                    <div style={{ marginTop: '20px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>Quick-Copy Template:</label>
                        <div style={{ 
                            padding: '15px', 
                            background: 'white', 
                            borderRadius: '12px', 
                            fontSize: '0.9rem', 
                            marginTop: '8px',
                            border: '1px solid #e0f2fe',
                            color: '#1e293b',
                            lineHeight: '1.5',
                            fontFamily: 'system-ui'
                        }}>
                            {codes.length > 0 && codes[0].status === 'UNUSED' ? (
                                <>
                                    Thank you for your payment. Your <b>{codes[0].durationDays}D Premium Code</b> is: <br/>
                                    <span style={{ color: '#0369a1', fontWeight: 'bold', fontSize: '1.1rem' }}>{codes[0].code}</span><br/>
                                    Enter it here: {window.location.origin}/activate
                                </>
                            ) : (
                                <span style={{ color: '#94a3b8' }}>Generate a code to see the template...</span>
                            )}
                        </div>
                        <button 
                            className="btn-primary" 
                            style={{ 
                                width: '100%', 
                                marginTop: '12px', 
                                background: '#334155', 
                                fontSize: '0.9rem',
                                padding: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                            onClick={() => {
                                if (codes.length > 0 && codes[0].status === 'UNUSED') {
                                    const message = `Thank you for your payment. Your ${codes[0].durationDays}D Premium Code is: ${codes[0].code}\n\nEnter it here: ${window.location.origin}/activate`;
                                    navigator.clipboard.writeText(message);
                                    alert("Full message copied to clipboard!");
                                } else {
                                    alert("Please generate a code first.");
                                }
                            }}
                        >
                            <Copy size={18} /> {t('copy_message')}
                        </button>
                    </div>
                </div>

                {/* Inventory Table */}
                <div className="card" style={{ padding: '25px', borderRadius: '15px' }}>
                    <h3 style={{ marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                        <Table size={20} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Code Inventory
                    </h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #f8f9fa' }}>
                                    <th style={{ padding: '16px' }}>Code String</th>
                                    <th style={{ padding: '16px' }}>Type</th>
                                    <th style={{ padding: '16px' }}>Value</th>
                                    <th style={{ padding: '16px' }}>Status</th>
                                    <th style={{ padding: '16px' }}>Expiry</th>
                                    <th style={{ padding: '16px', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}><Clock className="spin" /> Loading inventory...</td></tr>
                                ) : codes.length === 0 ? (
                                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No active codes found matching your criteria.</td></tr>
                                ) : (
                                    codes.map(item => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                                            <td style={{ padding: '16px' }}>
                                                <code style={{ background: '#f0f4f8', color: '#1a365d', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem', fontFamily: 'monospace' }}>{item.code}</code>
                                            </td>
                                            <td style={{ padding: '16px', fontSize: '0.85rem', color: '#4a5568' }}>
                                                {item.codeType === 'TIME_EXTENSION' ? 'Subscription' : 'Tier Upgrade'}
                                            </td>
                                            <td style={{ padding: '16px', fontWeight: 'bold' }}>
                                                {item.codeType === 'TIME_EXTENSION' ? `${item.durationDays}d` : item.tierUpgrade?.replace('_ACCESS', '')}
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{ 
                                                    padding: '6px 12px', 
                                                    borderRadius: '20px', 
                                                    fontSize: '0.75rem', 
                                                    fontWeight: 'bold',
                                                    display: 'inline-block',
                                                    background: item.status === 'UNUSED' ? '#d1fae5' : item.status === 'USED' ? '#fff7ed' : '#fee2e2',
                                                    color: item.status === 'UNUSED' ? '#065f46' : item.status === 'USED' ? '#9a3412' : '#991b1b'
                                                }}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', fontSize: '0.85rem', color: '#718096' }}>
                                                <Calendar size={12} style={{ marginRight: '5px' }} />
                                                {new Date(item.expiresAt).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'center' }}>
                                                <button 
                                                    onClick={() => handleCopy(item.code)}
                                                    className="btn-icon"
                                                    style={{ border: 'none', background: copiedCode === item.code ? '#dcfce7' : '#f4f4f5', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: copiedCode === item.code ? '#10b981' : '#718096', transition: 'all 0.2s' }}
                                                    title="Copy to Clipboard"
                                                >
                                                    {copiedCode === item.code ? <Check size={18} /> : <Copy size={18} />}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PremiumCodeFactory;
