import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MapPin, Briefcase, User, MessageSquare, Star, Shield, Phone, FileText, Activity, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import authService from '../services/authService';
import UpgradeModal from './UpgradeModal';

const WorkerProfileModal = ({ worker, onClose }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [targetTier, setTargetTier] = useState('GOLD');
    const user = authService.getCurrentUser();

    // Constant for your backend URL to ensure images load from Render, not Firebase
    const BACKEND_URL = 'https://edwl-backend.onrender.com';

    const handleContact = () => {
        navigate('/messages', {
            state: {
                startChatWith: worker.id,
                userType: 'JOB_SEEKER',
                context: `Inquiry from Employer`
            }
        });
    };

    const handleRestrictedAction = (tier) => {
        setTargetTier(tier);
        setShowUpgradeModal(true);
    };

    if (!worker) return null;

    const isSilver = user?.tier === 'SILVER' || user?.tier === 'FREEMIUM';
    const isGold = user?.tier === 'GOLD';
    const isPlatinum = user?.tier === 'PLATINUM';

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
            <div className="card" style={{ width: '90%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', padding: '0' }}>

                {/* Header Background */}
                <div style={{ height: '100px', background: 'linear-gradient(135deg, var(--primary) 0%, #ff8533 100%)', borderRadius: '12px 12px 0 0' }}></div>

                <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', padding: '5px', cursor: 'pointer', zIndex: 10 }}>
                    <X size={20} color="white" />
                </button>

                <div style={{ padding: '0 30px 30px' }}>
                    <div style={{ textAlign: 'center', marginTop: '-60px', marginBottom: '20px' }}>
                        <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'white', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '4px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                            {/* FIXED IMAGE LOGIC: Prepend Backend URL and check for 'undefined' string */}
                            {worker.profilePhoto && worker.profilePhoto !== 'undefined' ? (
                                <img
                                    src={worker.profilePhoto.startsWith('http') ? worker.profilePhoto : `${BACKEND_URL}${worker.profilePhoto}`}
                                    alt={worker.fullName}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <User size={60} color="#999" />
                            )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <h2 style={{ color: '#111', margin: 0, fontSize: '1.6rem' }}>{worker.fullName}</h2>
                            {worker.badge === 'PLATINUM' && (
                                <div title="Platinum Verified" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)', color: 'white', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                    <Shield size={14} fill="white" /> PLATINUM
                                </div>
                            )}
                            {worker.badge === 'GOLD' && (
                                <div title="Gold Verified" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f59e0b', color: 'white', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                    <Shield size={14} fill="white" /> GOLD
                                </div>
                            )}
                            {worker.badge === 'SILVER' && (
                                <div title="Silver Verified" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#94a3b8', color: 'white', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                    <Shield size={14} fill="white" /> SILVER
                                </div>
                            )}
                        </div>
                        <p style={{ color: '#666', marginTop: '5px' }}>{worker.age} {t('years_old')} • {worker.gender === 'FEMALE' ? t('female') : t('male')}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                        <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>{t('phone_number')}</div>
                            <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Phone size={14} color="#64748b" />
                                {worker.phone === '********' ? (
                                    <span onClick={() => handleRestrictedAction('GOLD')} style={{ color: '#f59e0b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Lock size={12} /> {t('gold_required') || 'Gold Access'}
                                    </span>
                                ) : worker.phone}
                            </div>
                        </div>
                        <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>{t('national_id_fayda')}</div>
                            <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileText size={14} color="#64748b" />
                                {worker.nationalIdFayda === '********' || !worker.nationalIdFayda ? (
                                    <span onClick={() => handleRestrictedAction('GOLD')} style={{ color: '#f59e0b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Lock size={12} /> {t('gold_required')}
                                    </span>
                                ) : worker.nationalIdFayda}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', marginBottom: '25px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '5px' }}>{t('experience')}</div>
                            <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{worker.experienceYears} {t('years')}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '5px' }}>{t('expected_salary')}</div>
                            <div style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--primary)' }}>{worker.expectedSalary} <small>ETB</small></div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '5px' }}>{t('location')}</div>
                            <div style={{ fontWeight: '600' }}>{worker.preferredLocation}</div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '25px', padding: '20px', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '15px', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Shield size={18} /> {t('legal_health_assurance') || 'Legal & Health Assurance'}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                                    <Activity size={16} color="#0369a1" /> {t('police_clearance')}
                                </div>
                                {worker.badge === 'PLATINUM' && isPlatinum ? (
                                    <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 'bold' }}>✓ Verified</span>
                                ) : (
                                    <button onClick={() => handleRestrictedAction('PLATINUM')} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #0369a1', background: 'transparent', color: '#0369a1', fontSize: '0.75rem', cursor: 'pointer' }}>
                                        {t('view_platinum') || 'Platinum Required'}
                                    </button>
                                )}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                                    <Activity size={16} color="#0369a1" /> {t('health_certificate')}
                                </div>
                                {worker.badge === 'PLATINUM' && isPlatinum ? (
                                    <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 'bold' }}>✓ Verified</span>
                                ) : (
                                    <button onClick={() => handleRestrictedAction('PLATINUM')} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #0369a1', background: 'transparent', color: '#0369a1', fontSize: '0.75rem', cursor: 'pointer' }}>
                                        {t('view_platinum')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>{t('about_me')}</h3>
                        <p style={{ lineHeight: '1.6', color: '#444', fontSize: '0.95rem' }}>{worker.bio || "No bio provided."}</p>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>{t('skills')}</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {worker.skills.map(skill => (
                                <span key={skill} style={{ background: '#f1f5f9', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', color: '#475569', border: '1px solid #e2e8f0' }}>
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                        <button onClick={onClose} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
                            {t('close')}
                        </button>
                        <button
                            className="btn-primary"
                            onClick={handleContact}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 25px', background: '#FF4500', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            <MessageSquare size={18} /> {t('contact_worker')}
                        </button>
                    </div>
                </div>
            </div>

            {showUpgradeModal && (
                <UpgradeModal
                    targetTier={targetTier}
                    onClose={() => setShowUpgradeModal(false)}
                />
            )}
        </div>
    );
};

export default WorkerProfileModal;