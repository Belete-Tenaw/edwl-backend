import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MapPin, Briefcase, User, MessageSquare, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const WorkerProfileModal = ({ worker, onClose }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleContact = () => {
        navigate('/messages', {
            state: {
                startChatWith: worker.id,
                userType: 'JOB_SEEKER',
                context: `Inquiry from Employer`
            }
        });
    };

    if (!worker) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="card" style={{ width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <X size={24} color="#999" />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#eee', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '3px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                        {worker.profilePhoto ? (
                            <img src={worker.profilePhoto} alt={worker.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <User size={60} color="#999" />
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <h2 style={{ color: 'var(--primary)', margin: 0 }}>{worker.fullName}</h2>
                        {worker.isVerified && (
                            <div title={t('verified')} style={{ color: '#0284c7' }}>
                                <Shield size={20} fill="#0284c7" />
                            </div>
                        )}
                    </div>
                    <p style={{ color: '#666', marginTop: '5px' }}>{worker.age} {t('years_old')} • {worker.gender === 'FEMALE' ? t('female') : t('male')}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ padding: '15px', background: '#fafafa', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '5px' }}>{t('verification_status') || 'Status'}</div>
                        <div style={{ fontWeight: '600', color: worker.isVerified ? '#10b981' : '#f59e0b' }}>
                            {worker.isVerified ? t('verified') : t('pending_verification')}
                        </div>
                    </div>
                    <div style={{ padding: '15px', background: '#fafafa', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '5px' }}>{t('experience')}</div>
                        <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Briefcase size={16} /> {worker.experienceYears} {t('years')}
                        </div>
                    </div>
                    <div style={{ padding: '15px', background: '#fafafa', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '5px' }}>{t('location')}</div>
                        <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <MapPin size={16} /> {worker.preferredLocation}
                        </div>
                    </div>
                    <div style={{ padding: '15px', background: '#fafafa', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '5px' }}>{t('arrangement')}</div>
                        <div style={{ fontWeight: '600' }}>{worker.preferredArrangement}</div>
                    </div>
                    <div style={{ padding: '15px', background: '#fafafa', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '5px' }}>{t('expected_salary')}</div>
                        <div style={{ fontWeight: '600' }}>{worker.expectedSalary} ETB</div>
                    </div>
                </div>

                <div style={{ marginBottom: '25px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>{t('about_me')}</h3>
                    <p style={{ lineHeight: '1.6', color: '#444' }}>{worker.bio || "No bio provided."}</p>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>{t('skills_required')}</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {worker.skills.map(skill => (
                            <span key={skill} style={{ background: '#fff0e6', padding: '6px 12px', borderRadius: '20px', fontSize: '0.9rem', color: '#e65100' }}>
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                    <button onClick={onClose} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>
                        {t('close')}
                    </button>
                    <button className="btn-primary" onClick={handleContact} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageSquare size={18} /> {t('contact_worker')}
                    </button>
                    {authService.getCurrentUser()?.role === 'EMPLOYER' && (
                        <button
                            onClick={async () => {
                                const reason = prompt(t('report_reason_prompt') || "Please provide a reason for reporting this user:");
                                if (reason) {
                                    try {
                                        await api.post('/reports', { reportedId: worker.id, reportedType: 'seeker', reason });
                                        alert(t('report_success') || "Report submitted successfully. Admin will review it.");
                                    } catch (err) {
                                        alert(t('report_error') || "Failed to submit report.");
                                    }
                                }
                            }}
                            style={{ padding: '0 12px', borderRadius: '8px', border: '1px solid #ef4444', color: '#ef4444', background: 'transparent', cursor: 'pointer' }}
                            title={t('report_user')}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkerProfileModal;
