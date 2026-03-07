import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import authService from '../../services/authService';
import { User, MapPin, Briefcase, Plus, Star, Settings, Shield, UserPlus, Copy, Check } from 'lucide-react';
import JobPostModal from '../../components/JobPostModal';
import WorkerProfileModal from '../../components/WorkerProfileModal';

const EmployerDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [workers, setWorkers] = useState([]);
    const [user, setUser] = useState(authService.getCurrentUser());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [myJobs, setMyJobs] = useState([]);
    const [selectedJobForMatches, setSelectedJobForMatches] = useState(null);
    const [matches, setMatches] = useState([]);
    const [copied, setCopied] = useState(false);

    const handleCopyCode = () => {
        if (user?.referralCode) {
            navigator.clipboard.writeText(user.referralCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [workersRes, jobsRes] = await Promise.all([
                    api.get('/seekers'),
                    api.get('/employers/me/jobs') // Need to ensure this exists or use general with filter
                ]);
                setWorkers(workersRes.data);
                setMyJobs(jobsRes.data || []);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
                setError(t('failed_to_load_data') || 'Failed to load data. Please refresh.');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const fetchMatches = async (jobId) => {
        setLoading(true);
        try {
            const res = await api.get(`/jobs/${jobId}/matches`);
            setMatches(res.data);
            setSelectedJobForMatches(jobId);
        } catch (err) {
            console.error("Match error:", err);
            setError(t('matching_failed'));
        } finally {
            setLoading(false);
        }
    };

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

            {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

            {/* Tier Status Alert */}
            {user?.tier === 'FREE' && (
                <div style={{ background: 'linear-gradient(90deg, #fffbeb 0%, #fef3c7 100%)', border: '1px solid #f59e0b', padding: '15px', borderRadius: '12px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h4 style={{ color: '#92400e', marginBottom: '5px' }}>✨ {t('upgrade_cta_title') || 'Unlock Elite Workers'}</h4>
                        <p style={{ color: '#b45309', fontSize: '0.9rem', margin: 0 }}>{t('upgrade_cta_msg') || 'Platinum and Gold workers are hidden from Free accounts. Upgrade to Platinum Access to see the best matches.'}</p>
                    </div>
                    <button className="btn-primary" onClick={() => navigate('/pricing')}>{t('see_plans')}</button>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '30px' }}>
                <aside>
                    <h3 style={{ marginBottom: '20px' }}>{t('my_job_posts') || 'My Job Posts'}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {myJobs.map(job => (
                            <div key={job.id} onClick={() => fetchMatches(job.id)} style={{
                                padding: '15px',
                                background: selectedJobForMatches === job.id ? '#f0f7ff' : 'white',
                                border: selectedJobForMatches === job.id ? '2px solid var(--primary)' : '1px solid #ddd',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}>
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem' }}>{job.title}</h4>
                                <span style={{ fontSize: '0.8rem', color: '#666' }}>{job.address}</span>
                            </div>
                        ))}
                    </div>

                    {/* Referral Card */}
                    <div className="card" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #bbf7d0', marginTop: '30px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <UserPlus size={20} color="#15803d" />
                            <h3 style={{ fontSize: '1rem', color: '#166534', margin: 0 }}>{t('referral_program') || 'Referral Program'}</h3>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#166534', marginBottom: '15px' }}>
                            {t('referral_bonus_msg')}
                        </p>

                        <div style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px dashed #22c55e', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontWeight: 'bold', letterSpacing: '1px', color: '#111' }}>{user?.referralCode || 'NOT_FOUND'}</span>
                            <button
                                onClick={handleCopyCode}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#15803d', display: 'flex', alignItems: 'center' }}
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        </div>

                        <div style={{ fontSize: '0.75rem', color: '#166534' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span>{t('successful_referrals') || 'Invites'}:</span>
                                <span style={{ fontWeight: 'bold' }}>{user?.referralCount || 0} / 3</span>
                            </div>
                            <div style={{ height: '6px', background: 'rgba(21, 128, 61, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${Math.min(((user?.referralCount || 0) / 3) * 100, 100)}%`, height: '100%', background: '#22c55e' }}></div>
                            </div>
                        </div>
                    </div>
                </aside>

                <main>
                    <h3 style={{ marginBottom: '20px' }}>
                        {selectedJobForMatches ? `${t('matches_for') || 'Matches for'} "${myJobs.find(j => j.id === selectedJobForMatches)?.title}"` : t('all_workers') || 'Available Workers'}
                    </h3>

                    {loading && <p>{t('loading_workers') || 'Loading...'}</p>}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {(selectedJobForMatches ? matches : workers).map(worker => (
                            <div key={worker.id || worker.seeker_id} className="card" style={{ opacity: worker.is_visible === false ? 0.6 : 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', filter: worker.is_visible === false ? 'blur(4px)' : 'none' }}>
                                        {worker.profilePhoto ? (
                                            <img src={worker.profilePhoto} alt={worker.fullName || worker.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <User size={28} color="#666" />
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{worker.is_visible === false ? 'Hidden Profile' : (worker.fullName || worker.full_name)}</h3>
                                            {(worker.badge === 'PLATINUM' || worker.tier === 'PLATINUM') && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                                    <Shield size={10} fill="white" /> {t('platinum')}
                                                </div>
                                            )}
                                        </div>
                                        <span style={{ fontSize: '0.85rem', color: '#666' }}>{worker.age} {t('years_old')} • {worker.gender === 'FEMALE' ? t('female') : t('male')}</span>
                                    </div>
                                </div>

                                {worker.is_visible === false ? (
                                    <div style={{ textAlign: 'center', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
                                        <Shield size={30} color="#f59e0b" style={{ marginBottom: '10px' }} />
                                        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '10px' }}>Upgrade to Platinum to unlock this candidate.</p>
                                        <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => navigate('/pricing')}>Upgrade</button>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ marginBottom: '15px', color: '#555', fontSize: '0.9rem' }}>
                                            {worker.match_score && (
                                                <div style={{ marginBottom: '8px', color: 'var(--primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <Star size={16} fill="var(--primary)" /> {worker.match_score} Skills Match
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                                                <Briefcase size={16} /> {worker.experienceYears} {t('years_exp')}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <MapPin size={16} /> {worker.preferredLocation}
                                            </div>
                                        </div>

                                        <button onClick={() => setSelectedWorker(worker)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', background: 'transparent', borderRadius: '8px', fontWeight: '500', color: 'var(--text)', cursor: 'pointer' }}>
                                            {t('view_profile')}
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </main>
            </div>

            {
                selectedWorker && (
                    <WorkerProfileModal
                        worker={selectedWorker}
                        onClose={() => setSelectedWorker(null)}
                    />
                )
            }
        </div >
    );
};

export default EmployerDashboard;
