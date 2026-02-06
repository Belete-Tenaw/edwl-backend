import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/authService';
import { User, MapPin, Briefcase, Plus, Star, Settings } from 'lucide-react';
import JobPostModal from '../../components/JobPostModal';
import WorkerProfileModal from '../../components/WorkerProfileModal';

const EmployerDashboard = () => {
    const { t } = useTranslation();
    const [workers, setWorkers] = useState([]);
    const [user, setUser] = useState(authService.getCurrentUser());
    const [loading, setLoading] = useState(true);
    const [showJobModal, setShowJobModal] = useState(false);
    const [selectedWorker, setSelectedWorker] = useState(null);

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                const res = await api.get('/seekers');
                setWorkers(res.data);
            } catch (err) {
                console.error("Failed to fetch workers", err);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkers();
    }, []);

    const handleJobPosted = (newJob) => {
        alert(t('job_posted_success') || 'Job posted successfully!');
        setShowJobModal(false);
    };


    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>{t('dashboard')}</h1>
                    <p style={{ color: '#666' }}>{t('manage_jobs_msg')}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Link to="/profile/edit" style={{ textDecoration: 'none' }}>
                        <button style={{ height: '44px', padding: '0 15px', border: '1px solid #ddd', borderRadius: '8px', background: 'white', color: '#666', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <Settings size={20} /> {t('edit_profile')}
                        </button>
                    </Link>
                    <button className="btn-primary" onClick={() => setShowJobModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={20} /> {t('post_job')}
                    </button>
                </div>
            </header>

            {showJobModal && (
                <JobPostModal
                    onClose={() => setShowJobModal(false)}
                    onJobPosted={handleJobPosted}
                />
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {workers.map(worker => (
                    <div key={worker.id} className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                {worker.profilePhoto ? (
                                    <img src={worker.profilePhoto} alt={worker.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <User size={28} color="#666" />
                                )}
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{worker.fullName}</h3>
                                    {worker.isVerified && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#e1f5fe', color: '#0284c7', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                            <Shield size={12} fill="#0284c7" /> {t('verified')}
                                        </div>
                                    )}
                                </div>
                                <span style={{ fontSize: '0.85rem', color: '#666' }}>{worker.age} {t('years_old')} • {worker.gender === 'FEMALE' ? t('female') : t('male')}</span>
                            </div>
                        </div>

                        <div style={{ marginBottom: '15px', color: '#555', fontSize: '0.9rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                                <Briefcase size={16} /> {worker.experienceYears} {t('years_exp')}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MapPin size={16} /> {worker.preferredLocation}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
                            {worker.skills.slice(0, 3).map(skill => (
                                <span key={skill} style={{ background: '#f5f5f5', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', color: '#666' }}>
                                    {skill}
                                </span>
                            ))}
                            {worker.skills.length > 3 && <span style={{ fontSize: '0.8rem', color: '#999' }}>+{worker.skills.length - 3}</span>}
                        </div>

                        <button onClick={() => setSelectedWorker(worker)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', background: 'transparent', borderRadius: '8px', fontWeight: '500', color: 'var(--text)', cursor: 'pointer' }}>
                            {t('view_profile')}
                        </button>
                    </div>
                ))}
            </div>

            {selectedWorker && (
                <WorkerProfileModal
                    worker={selectedWorker}
                    onClose={() => setSelectedWorker(null)}
                />
            )}
        </div>
    );
};

export default EmployerDashboard;
