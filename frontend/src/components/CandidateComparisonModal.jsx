import React from 'react';
import { X, Check, XCircle, Shield, Award, MapPin, Briefcase, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CandidateComparisonModal = ({ candidates, onClose }) => {
    const { t } = useTranslation();

    if (!candidates || candidates.length === 0) return null;

    const features = [
        { key: 'match_score', label: 'Match Score', icon: <Award size={18} /> },
        { key: 'experienceYears', label: 'Experience', icon: <Briefcase size={18} /> },
        { key: 'expectedSalary', label: 'Expected Salary', icon: <DollarSign size={18} /> },
        { key: 'preferredLocation', label: 'Location', icon: <MapPin size={18} /> },
        { key: 'behaviorScore', label: 'Reliability', icon: <Shield size={18} /> },
        { key: 'isFaydaVerified', label: 'ID Verified', icon: <Check size={18} /> },
    ];

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '20px' }}>
            <div style={{ background: 'var(--white)', width: '100%', maxWidth: '900px', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', animation: 'scaleUp 0.3s ease' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--secondary)' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--navy)' }}>Candidate Comparison</h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}><X size={24} /></button>
                </div>

                <div style={{ overflowX: 'auto', padding: '24px' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '15px', color: 'var(--text-light)' }}>Feature</th>
                                {candidates.map(c => (
                                    <th key={c.id} style={{ padding: '15px', minWidth: '200px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#eee', overflow: 'hidden' }}>
                                                {c.profilePhoto && <img src={c.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                            </div>
                                            <span style={{ fontSize: '1rem', fontWeight: '800' }}>{c.fullName || c.full_name}</span>
                                            <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', background: 'var(--primary-glow)', color: 'var(--primary)' }}>{c.tier}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {features.map(f => (
                                <tr key={f.key} style={{ background: 'hsla(210, 40%, 95%, 0.5)', borderRadius: '12px' }}>
                                    <td style={{ padding: '15px', fontWeight: '700', color: 'var(--navy)', borderRadius: '12px 0 0 12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {f.icon} {f.label}
                                        </div>
                                    </td>
                                    {candidates.map(c => (
                                        <td key={`${c.id}-${f.key}`} style={{ padding: '15px', textAlign: 'center' }}>
                                            {f.key === 'match_score' ? (
                                                <div style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--primary)' }}>{c[f.key] || 0}%</div>
                                            ) : f.key === 'isFaydaVerified' ? (
                                                c[f.key] ? <Check size={20} color="#10b981" /> : <XCircle size={20} color="#ef4444" />
                                            ) : (
                                                <span style={{ fontWeight: '600' }}>{c[f.key] || 'N/A'}</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ padding: '24px', textAlign: 'center', background: '#f8fafc' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '0' }}>
                        * Selection is based on current profile data and AI matching logic.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CandidateComparisonModal;
