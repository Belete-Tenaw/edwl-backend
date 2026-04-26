import React, { useState } from 'react';
import { FileText, Check, Clock, AlertTriangle, ShieldCheck, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import ReviewForm from './ReviewForm';

const DigitalContractViewer = ({ contract, userRole, onUpdate }) => {
    const { t } = useTranslation();
    const [signing, setSigning] = useState(false);
    const [showReview, setShowReview] = useState(false);

    const handleSign = async () => {
        if (!window.confirm("By clicking confirm, you are digitally signing this contract and agreeing to all terms and conditions.")) return;
        
        setSigning(true);
        try {
            await api.put(`/contracts/${contract.id}/sign`);
            alert("Contract signed successfully!");
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error("Signing error:", err);
            alert("Failed to sign contract.");
        } finally {
            setSigning(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return '#10b981';
            case 'SIGNED_BY_SEEKER': return '#3b82f6';
            case 'ACTIVE_WITH_ESCROW': return '#8b5cf6';
            case 'PENDING_SEEKER_SIGNATURE': return '#f59e0b';
            default: return '#6b7280';
        }
    };

    return (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <div style={{ background: '#f8fafc', padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', color: 'var(--primary)' }}>
                        <FileText size={20} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{contract.jobPost?.title || 'Employment Contract'}</h3>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>ID: {contract.id.substring(0, 8)}...</div>
                    </div>
                </div>
                <div style={{ 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    background: `${getStatusColor(contract.status)}15`, 
                    color: getStatusColor(contract.status),
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    border: `1px solid ${getStatusColor(contract.status)}30`
                }}>
                    {contract.status.replace(/_/g, ' ')}
                </div>
            </div>

            <div style={{ padding: '25px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ padding: '15px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #dcfce7' }}>
                        <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>Employer</div>
                        <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{contract.employer?.contactName}</div>
                        <div style={{ fontSize: '0.85rem', color: '#166534' }}>{contract.employer?.phone}</div>
                    </div>
                    <div style={{ padding: '15px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #dbeafe' }}>
                        <div style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>Worker</div>
                        <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{contract.jobSeeker?.fullName}</div>
                        <div style={{ fontSize: '0.85rem', color: '#1e40af' }}>{contract.jobSeeker?.phone}</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Salary / Wage</div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)' }}>{contract.salaryAmount} ETB</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Start Date</div>
                        <div style={{ fontWeight: 'bold' }}>{new Date(contract.startDate).toLocaleDateString()}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Job Type</div>
                        <div style={{ fontWeight: 'bold' }}>{contract.jobType || 'Standard'}</div>
                    </div>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '10px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldCheck size={18} color="var(--primary)" /> Terms & Conditions
                    </h4>
                    <div style={{ 
                        background: '#f9fafb', 
                        padding: '15px', 
                        borderRadius: '10px', 
                        fontSize: '0.9rem', 
                        lineHeight: '1.6', 
                        color: '#475569',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        border: '1px solid #e5e7eb'
                    }}>
                        {contract.termsConditions || "No specific terms provided. Standard labor laws of Ethiopia apply."}
                    </div>
                </div>

                {userRole === 'seeker' && contract.status === 'PENDING_SEEKER_SIGNATURE' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '12px', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
                            <p style={{ fontSize: '0.8rem', color: '#92400e', margin: 0 }}>
                                Please review all terms carefully. Once signed, this contract is legally binding between you and the employer.
                            </p>
                        </div>
                        <button 
                            onClick={handleSign}
                            disabled={signing}
                            className="btn-primary" 
                            style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        >
                            {signing ? 'SIGNING...' : <><Check size={20} /> SIGN DIGITALLY</>}
                        </button>
                    </div>
                )}

                {contract.status === 'SIGNED_BY_SEEKER' && (
                    <div style={{ textAlign: 'center', padding: '15px', background: '#f0fdf4', borderRadius: '10px', color: '#166534', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Check size={20} /> Signed on {new Date(contract.signedAt).toLocaleDateString()}
                    </div>
                )}

                {contract.status === 'COMPLETED' && (
                    <div style={{ marginTop: '20px' }}>
                        {!showReview ? (
                            <button 
                                onClick={() => setShowReview(true)}
                                style={{ width: '100%', padding: '12px', background: 'white', border: '2px solid var(--primary)', color: 'var(--primary)', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                <Star size={18} /> LEAVE A REVIEW
                            </button>
                        ) : (
                            <ReviewForm 
                                targetId={userRole === 'employer' ? contract.jobSeekerId : contract.employerId}
                                targetType={userRole === 'employer' ? 'seeker' : 'employer'}
                                contractId={contract.id}
                                onSuccess={() => {
                                    setShowReview(false);
                                    if (onUpdate) onUpdate();
                                }}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DigitalContractViewer;
