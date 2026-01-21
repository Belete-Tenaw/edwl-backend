import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MapPin, DollarSign, Briefcase, Clock, CheckCircle, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const JobDetailModal = ({ job, onClose }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleContact = () => {
        navigate('/messages', {
            state: {
                startChatWith: job.employerId,
                userType: 'EMPLOYER',
                context: `Regarding job: ${job.title}`
            }
        });
    };

    if (!job) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="card" style={{ width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <X size={24} color="#999" />
                </button>

                <h2 style={{ marginBottom: '10px', color: 'var(--primary)', paddingRight: '30px' }}>{job.title}</h2>
                <div style={{ marginBottom: '20px', color: '#666', fontSize: '0.9rem' }}>
                    {t('posted_on')} {new Date(job.createdAt).toLocaleDateString()}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '25px', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <DollarSign size={18} color="var(--primary)" />
                        <span style={{ fontWeight: '500' }}>{job.salaryOffered} ETB</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={18} color="var(--primary)" />
                        <span>{job.address}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Briefcase size={18} color="var(--primary)" />
                        <span>{job.jobType}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={18} color="var(--primary)" />
                        <span>{job.preferredArrangement}</span>
                    </div>
                </div>

                <div style={{ marginBottom: '25px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>{t('description')}</h3>
                    <p style={{ lineHeight: '1.6', color: '#444' }}>{job.description}</p>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>{t('skills_required')}</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {job.requiredSkills.map(skill => (
                            <span key={skill} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#e1f5fe', padding: '6px 12px', borderRadius: '20px', fontSize: '0.9rem', color: '#0277bd' }}>
                                <CheckCircle size={14} /> {skill}
                            </span>
                        ))}
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                    <button onClick={onClose} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>
                        {t('close')}
                    </button>
                    <button className="btn-primary" onClick={handleContact} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageSquare size={18} /> {t('contact_employer')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JobDetailModal;
