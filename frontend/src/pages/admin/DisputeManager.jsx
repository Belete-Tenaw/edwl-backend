import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Gavel, CheckCircle, XCircle, MessageSquare, ShieldAlert, Cpu } from 'lucide-react';
import api from '../../services/api';

const DisputeManager = () => {
    const { t } = useTranslation();
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

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

    const handleResolve = async (id, resolution, status) => {
        try {
            setProcessingId(id);
            await api.post(`/admin/disputes/${id}/resolve`, { resolution, status });
            alert('Dispute resolved successfully!');
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

    if (loading) return <div style={{ padding: '20px' }}>{t('loading_disputes') || 'Loading disputes...'}</div>;

    return (
        <div style={{ padding: '20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0 }}>{t('active_disputes') || 'Active Escrow Disputes'}</h3>
                <button onClick={fetchDisputes} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}>🔄 {t('refresh')}</button>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
                {disputes.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '12px', border: '1px dashed #ddd' }}>
                        <Gavel size={48} color="#ddd" style={{ marginBottom: '16px' }} />
                        <p style={{ color: '#666' }}>{t('no_open_disputes') || 'No open disputes found.'}</p>
                    </div>
                ) : (
                    disputes.map(dispute => (
                        <div key={dispute.id} className="card" style={{ borderLeft: '4px solid #ef4444', position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <ShieldAlert size={18} color="#ef4444" />
                                        <h4 style={{ margin: 0 }}>{dispute.reason}</h4>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>
                                        Contract ID: {dispute.contractId} | Open Since: {new Date(dispute.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', background: dispute.status === 'OPEN' ? '#fee2e2' : '#dcfce7', color: dispute.status === 'OPEN' ? '#b91c1c' : '#15803d', fontWeight: 'bold' }}>
                                        {dispute.status}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Parties Involved</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{dispute.contract.employer.contactName}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Employer</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{dispute.contract.jobSeeker.fullName}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Job Seeker</div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Reporter</div>
                                    <div style={{ fontSize: '0.85rem' }}>
                                        {dispute.reporterEmp ? dispute.reporterEmp.contactName : dispute.reporterJS.fullName} 
                                        <span style={{ color: '#94a3b8', marginLeft: '5px' }}>({dispute.reporterEmp ? 'Employer' : 'Worker'})</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: '#fffbeb', padding: '15px', borderRadius: '8px', border: '1px solid #fef3c7', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <MessageSquare size={16} color="#d97706" />
                                    <strong style={{ fontSize: '0.85rem' }}>Description:</strong>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#92400e', lineHeight: '1.4' }}>{dispute.description}</p>
                            </div>

                            {/* AI MEDIATION SECTION */}
                            <div style={{ background: '#f0f9ff', padding: '20px', borderRadius: '12px', border: '1px solid #bae6fd', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Cpu size={20} color="#0284c7" />
                                        <strong style={{ fontSize: '1rem', color: '#0369a1' }}>EDWL AI Mediation Engine</strong>
                                    </div>
                                    {!dispute.autoMediated && (
                                        <button 
                                            onClick={() => handleRunAI(dispute.id)}
                                            disabled={processingId === dispute.id}
                                            style={{ padding: '6px 12px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}
                                        >
                                            {processingId === dispute.id ? 'Analyzing...' : 'Run Analysis'}
                                        </button>
                                    )}
                                </div>

                                {dispute.autoMediated ? (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                            <div style={{ height: '8px', flex: 1, background: '#e0f2fe', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', background: '#0ea5e9', width: `${dispute.aiConfidenceScore}%` }} />
                                            </div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#0369a1' }}>{dispute.aiConfidenceScore}% Confidence</span>
                                        </div>
                                        <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e0f2fe' }}>
                                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#0c4a6e', fontStyle: 'italic' }}>
                                                "{dispute.aiSuggestedResolution}"
                                            </p>
                                        </div>
                                        <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                                            <button 
                                                onClick={() => handleResolve(dispute.id, dispute.aiSuggestedResolution, 'RESOLVED')}
                                                style={{ flex: 1, padding: '10px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                            >
                                                <CheckCircle size={18} /> Apply Suggestion
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    const res = prompt('Enter manual resolution details:');
                                                    if (res) handleResolve(dispute.id, res, 'RESOLVED');
                                                }}
                                                style={{ padding: '10px 20px', background: 'white', border: '1px solid #bae6fd', color: '#0369a1', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                                            >
                                                Manual
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>AI analysis not yet performed for this dispute. Run analysis to retrieve chat history and behavior metrics.</p>
                                )}
                            </div>

                            {dispute.status !== 'OPEN' && dispute.resolution && (
                                <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <CheckCircle size={16} color="#16a34a" />
                                        <strong style={{ fontSize: '0.85rem', color: '#166534' }}>Final Resolution:</strong>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#14532d' }}>{dispute.resolution}</p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DisputeManager;
