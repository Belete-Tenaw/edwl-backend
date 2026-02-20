import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import authService from '../../services/authService';
import { Briefcase, MapPin, DollarSign, Star, User, Settings, Shield } from 'lucide-react';
import JobDetailModal from '../../components/JobDetailModal';

const SeekerDashboard = () => {
    const { t } = useTranslation();
    const [jobs, setJobs] = useState([]);
    const [user, setUser] = useState(authService.getCurrentUser());
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await api.get('/jobs');
                setJobs(res.data);
            } catch (err) {
                console.error("Failed to fetch jobs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>{t('welcome')}, {user?.fullName}</h1>
                    <p style={{ color: '#666' }}>{t('welcome_msg')}</p>
                </div>
                {user?.tier === 'BRONZE' && (
                    <div style={{ background: '#fff4e5', padding: '15px 25px', borderRadius: '12px', border: '1px solid #ffcc80' }}>
                        <p style={{ color: '#e65100', fontWeight: 'bold', marginBottom: '5px' }}>{t('free_account')}</p>
                        <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => navigate('/pricing')}>
                            {t('upgrade_premium')}
                        </button>
                    </div>
                )}
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                {/* Sidebar */}
                <aside style={{ maxWidth: '300px' }}>
                    <div className="card" style={{ marginBottom: '20px' }}>
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{ width: '80px', height: '80px', background: '#eee', borderRadius: '50%', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                {user?.profilePhoto ? (
                                    <img src={user.profilePhoto} alt={user.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <User size={40} color="#999" />
                                )}
                            </div>
                            <h3>{user?.fullName}</h3>
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>{user?.role === 'JOB_SEEKER' ? t('worker') : user?.role}</p>
                        </div>
                        <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '15px 0' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Link to="/profile/edit" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', textDecoration: 'none', padding: '8px', borderRadius: '6px', transition: 'background 0.2s' }}>
                                <Settings size={18} /> {t('edit_profile')}
                            </Link>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main>
                    <h2 style={{ marginBottom: '20px' }}>{t('jobs')}</h2>
                    {loading ? (
                        <p>{t('loading_jobs')}</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '20px' }}>
                            {jobs.map(job => (
                                <div key={job.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ marginBottom: '10px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {job.title}
                                            {job.employer?.isVerified && (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#e0f2fe', color: '#0369a1', padding: '3px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold' }}>
                                                    <Shield size={10} /> {t('verified')}
                                                </span>
                                            )}
                                        </h3>
                                        <div style={{ display: 'flex', gap: '15px', color: '#666', fontSize: '0.9rem', marginBottom: '15px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={16} /> {job.address}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><DollarSign size={16} /> {job.salaryOffered} ETB</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Briefcase size={16} /> {job.jobType}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            {job.requiredSkills.map(skill => (
                                                <span key={skill} style={{ background: '#f0f0f0', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem' }}>{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedJob(job)} style={{ padding: '8px 16px', border: '1px solid var(--primary)', background: 'transparent', color: 'var(--primary)', borderRadius: '8px', cursor: 'pointer' }}>
                                        View Details
                                    </button>
                                </div>
                            ))}
                            {jobs.length === 0 && <p>No jobs found at the moment.</p>}
                        </div>
                    )}
                </main>
            </div>

            {selectedJob && (
                <JobDetailModal
                    job={selectedJob}
                    onClose={() => setSelectedJob(null)}
                />
            )}
        </div>
    );
};

export default SeekerDashboard;
