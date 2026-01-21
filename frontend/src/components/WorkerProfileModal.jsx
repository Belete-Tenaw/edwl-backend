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
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#eee', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={50} color="#999" />
                    </div>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '5px' }}>{worker.fullName}</h2>
                    <p style={{ color: '#666' }}>{worker.age} years old • {worker.gender}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ padding: '15px', background: '#fafafa', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '5px' }}>Experience</div>
                        <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Briefcase size={16} /> {worker.experienceYears} Years
                        </div>
                    </div>
                    <div style={{ padding: '15px', background: '#fafafa', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '5px' }}>Location</div>
                        <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <MapPin size={16} /> {worker.preferredLocation}
                        </div>
                    </div>
                    <div style={{ padding: '15px', background: '#fafafa', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '5px' }}>Arrangement</div>
                        <div style={{ fontWeight: '600' }}>{worker.preferredArrangement}</div>
                    </div>
                    <div style={{ padding: '15px', background: '#fafafa', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '5px' }}>Expected Salary</div>
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
                </div>
            </div>
        </div>
    );
};

export default WorkerProfileModal;
