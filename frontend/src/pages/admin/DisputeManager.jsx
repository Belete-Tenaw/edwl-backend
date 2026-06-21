import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Gavel, CheckCircle, MessageSquare, ShieldAlert, Cpu } from 'lucide-react';
import api from '../../services/api';

const DisputeManager = () => {
    const { t } = useTranslation();
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [customSplits, setCustomSplits] = useState({});
    const [manualNotes, setManualNotes] = useState({});

    const fetchDisputes = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/disputes');
            setDisputes(response.data);
        } catch (err) {
            console.error('Failed to fetch disputes', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDisputes();
    }, []);

    const parseSplit = (text) => {
        if (!text) return { worker: 50, employer: 50 };
        const match = text.match(/\[SPLIT:\s*(\d+)\/(\d+)\]/i);
        if (match) {
            return {
                worker: parseInt(match[1], 10),
                employer: parseInt(match[2], 10)
            };
        }
        return { worker: 50, employer: 50 };
    };

    const cleanSuggestion = (text) => {
        if (!text) return "";
        return text.replace(/\[SPLIT:\s*\d+\/\d+\]/i, '').trim();
    };

    const handleResolve = async (id, resolution, status, workerPercent, employerPercent) => {
        try {
            setProcessingId(id);
            await api.post(`/admin/disputes/${id}/resolve`, { 
                resolution, 
                status,
                workerPercent: parseInt(workerPercent),
                employerPercent: parseInt(employerPercent)
            });
            alert('Dispute resolved and Escrow Split successfully executed!');
            fetchDisputes();
        } catch (err) {
            alert('Failed to resolve dispute');
        } finally {
            setProcessingId(null);
        }
    };

    const handleRunAI = async (disputeId) => {
        try {
            setProcessingId(disputeId);
            await api.post('/mediation/mediate', { disputeId });
            fetchDisputes();
        } catch (err) {
            alert('Failed to run AI Mediation');
        } finally {
            setProcessingId(null);
        }
    };

    const handleSliderChange = (disputeId, workerVal) => {
        setCustomSplits(prev => ({
            ...prev,
            [disputeId]: {
                worker: workerVal,
                employer: 100 - workerVal
            }
        }));
    };

    const handleNotesChange = (disputeId, text) => {
        setManualNotes(prev => ({
            ...prev,
            [disputeId]: text
        }));
    };

    if (loading) return <div style={{ padding: '20px', color: '#94a3b8' }}>{t('loading_disputes') || 'Loading disputes...'}</div>;

    return (
        <div style={{ padding: '20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, color: 'white', fontWeight: '900' }}>{t('active_disputes') || 'Active Escrow Disputes'}</h3>
                <button onClick={fetchDisputes} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>🔄 {t('refresh')}</button>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
                {disputes.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <Gavel size={48} color="#64748b" style={{ marginBottom: '16px' }} />
                        <p style={{ color: '#94a3b8' }}>{t('no_open_disputes') || 'No open disputes found.'}</p>
                    </div>
                ) : (
                    disputes.map(dispute => {
                        const defaultSplit = parseSplit(dispute.aiSuggestedResolution);
                        const currentSplit = customSplits[dispute.id] || defaultSplit;
                        const noteText = manualNotes[dispute.id] || '';
                        
                        const contractAmount = dispute.contract?.salary || 0;
                        const workerAmount = Math.round((contractAmount * currentSplit.worker) / 100);
                        const employerAmount = Math.round((contractAmount * currentSplit.employer) / 100);

                        return (
                            <div key={dispute.id} className="card" style={{ 
                                background: 'rgba(30, 41, 59, 0.4)', 
                                border: '1px solid rgba(255,255,255,0.05)', 
                                borderLeft: '4px solid #ef4444', 
                                padding: '24px',
                                borderRadius: '20px',
                                position: 'relative' 
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <ShieldAlert size={18} color="#ef4444" />
                                            <h4 style={{ margin: 0, color: 'white', fontWeight: '800' }}>{dispute.reason}</h4>
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                                            Contract ID: {dispute.contractId} | Open Since: {new Date(dispute.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '0.72rem', padding: '4px 10px', borderRadius: '20px', background: dispute.status === 'OPEN' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: dispute.status === 'OPEN' ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>
                                            {dispute.status}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '0.72rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Parties Involved</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'white' }}>{dispute.contract?.employer?.contactName}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Employer</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'white' }}>{dispute.contract?.jobSeeker?.fullName}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Job Seeker</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '0.72rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Reporter</div>
                                        <div style={{ fontSize: '0.85rem', color: 'white' }}>
                                            {dispute.reporterEmp ? dispute.reporterEmp.contactName : dispute.reporterJS?.fullName} 
                                            <span style={{ color: '#94a3b8', marginLeft: '5px' }}>({dispute.reporterEmp ? 'Employer' : 'Worker'})</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.1)', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <MessageSquare size={16} color="#f59e0b" />
                                        <strong style={{ fontSize: '0.8rem', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1px' }}>Dispute Statement</strong>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#f8fafc', lineHeight: '1.5' }}>{dispute.description}</p>
                                </div>

                                {/* AI MEDIATION SECTION */}
                                <div style={{ background: 'rgba(56, 189, 248, 0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(56, 189, 248, 0.15)', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Cpu size={20} color="#38bdf8" />
                                            <strong style={{ fontSize: '0.95rem', color: '#38bdf8', letterSpacing: '0.5px' }}>EDWL AI Mediation Engine</strong>
                                        </div>
                                        <button 
                                            onClick={() => handleRunAI(dispute.id)}
                                            disabled={processingId === dispute.id}
                                            style={{ padding: '6px 14px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '900', cursor: 'pointer', transition: 'opacity 0.2s' }}
                                            onMouseOver={e => e.currentTarget.style.opacity = '0.8'}
                                            onMouseOut={e => e.currentTarget.style.opacity = '1'}
                                        >
                                            {processingId === dispute.id ? 'Analyzing...' : dispute.aiSuggestedResolution ? 'Re-run Analysis' : 'Run Analysis'}
                                        </button>
                                    </div>

                                    {dispute.aiSuggestedResolution ? (
                                        <>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                                <div style={{ height: '6px', flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', background: '#38bdf8', width: `${dispute.aiConfidenceScore * 100}%`, boxShadow: '0 0 8px #38bdf8' }} />
                                                </div>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#38bdf8' }}>{Math.round(dispute.aiConfidenceScore * 100)}% Confidence</span>
                                            </div>
                                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.02)', marginBottom: '20px' }}>
                                                <p style={{ margin: 0, fontSize: '0.88rem', color: '#e2e8f0', fontStyle: 'italic', lineHeight: 1.5 }}>
                                                    "{cleanSuggestion(dispute.aiSuggestedResolution)}"
                                                </p>
                                            </div>

                                            {/* INTERACTIVE ESCROW SPLIT SLIDER */}
                                            <div style={{ background: 'rgba(255,255,255,0.01)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)', marginBottom: '20px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                    <span>Worker Payout</span>
                                                    <span>Employer Refund</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '900', color: 'white', marginBottom: '12px' }}>
                                                    <span style={{ color: '#10b981' }}>{currentSplit.worker}% ({workerAmount.toLocaleString()} ETB)</span>
                                                    <span style={{ color: '#f59e0b' }}>{currentSplit.employer}% ({employerAmount.toLocaleString()} ETB)</span>
                                                </div>
                                                <input 
                                                    type="range" 
                                                    min="0" 
                                                    max="100" 
                                                    value={currentSplit.worker} 
                                                    onChange={(e) => handleSliderChange(dispute.id, parseInt(e.target.value))}
                                                    style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }} 
                                                />
                                            </div>

                                            {/* MANUAL NOTES */}
                                            <div style={{ marginBottom: '20px' }}>
                                                <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>Resolution Notes / Justification</label>
                                                <textarea 
                                                    placeholder="Provide final resolution notes explaining the decision..."
                                                    value={noteText}
                                                    onChange={(e) => handleNotesChange(dispute.id, e.target.value)}
                                                    style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', color: 'white', fontSize: '0.85rem', minHeight: '80px', fontFamily: 'inherit' }}
                                                />
                                            </div>

                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <button 
                                                    onClick={() => handleResolve(
                                                        dispute.id, 
                                                        noteText || cleanSuggestion(dispute.aiSuggestedResolution), 
                                                        'RESOLVED', 
                                                        currentSplit.worker, 
                                                        currentSplit.employer
                                                    )}
                                                    disabled={processingId === dispute.id}
                                                    style={{ flex: 1, padding: '12px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 8px 16px rgba(56, 189, 248, 0.2)' }}
                                                >
                                                    <CheckCircle size={18} /> Execute Escrow Split
                                                </button>
                                                {dispute.status === 'OPEN' && (
                                                    <button 
                                                        onClick={() => {
                                                            // Set split back to AI suggestion
                                                            setCustomSplits(prev => ({
                                                                ...prev,
                                                                [dispute.id]: defaultSplit
                                                            }));
                                                        }}
                                                        style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}
                                                    >
                                                        Reset to AI
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>AI mediation analysis not yet performed for this dispute. Run analysis to extract chat logs and compile suggestion model.</p>
                                    )}
                                </div>

                                {dispute.status !== 'OPEN' && dispute.resolution && (
                                    <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                            <CheckCircle size={16} color="#10b981" />
                                            <strong style={{ fontSize: '0.8rem', color: '#10b981', textTransform: 'uppercase', letterSpacing: '1px' }}>Final Resolution Logged</strong>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#f8fafc', lineHeight: 1.5 }}>{dispute.resolution}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default DisputeManager;
