import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import authService from '../../services/authService';
import { Briefcase, MapPin, DollarSign, Star, User, Settings, Shield, UserPlus, Copy, Check } from 'lucide-react';
import JobDetailModal from '../../components/JobDetailModal';
import RankProgress from '../../components/RankProgress';

const SeekerDashboard = () => {
    const { t } = useTranslation();
    const [jobs, setJobs] = useState([]);
    const [user, setUser] = useState(authService.getCurrentUser());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const [pendingVerification, setPendingVerification] = useState(false);
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);

    const handleCopyCode = () => {
        if (user?.referralCode) {
            navigator.clipboard.writeText(user.referralCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobsRes, profileRes] = await Promise.all([
                    api.get('/jobs'),
                    api.get(`/seekers/${user.id}`)
                ]);
                setJobs(jobsRes.data);
                if (profileRes.data.verificationStatus === 'PENDING') {
                    setPendingVerification(true);
                }
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
                setError(t('failed_to_load_data') || 'Failed to load data. Please refresh.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>{t('welcome')}, {user?.fullName}</h1>
                    <p style={{ color: '#666' }}>{t('welcome_msg')}</p>
                </div>
                {user?.tier === 'BRONZE' && !pendingVerification && (
                    <div style={{ background: '#fff4e5', padding: '15px 25px', borderRadius: '12px', border: '1px solid #ffcc80' }}>
                        <p style={{ color: '#e65100', fontWeight: 'bold', marginBottom: '5px' }}>{t('free_account')}</p>
                        <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => navigate('/pricing')}>
                            {t('upgrade_premium')}
                        </button>
                    </div>
                )}
                {pendingVerification && (
                    <div style={{ background: '#eff6ff', padding: '15px 25px', borderRadius: '12px', border: '1px solid #3b82f6' }}>
                        <p style={{ color: '#1e40af', fontWeight: 'bold', marginBottom: '5px' }}>⏳ {t('verification_pending_title') || 'Verification in Progress'}</p>
                        <p style={{ color: '#60a5fa', fontSize: '0.85rem', margin: 0 }}>{t('verification_pending_msg') || 'Our admins are reviewing your documents/receipt. This usually takes 2-4 hours.'}</p>
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

                            {/* Profile Completeness */}
                            <div style={{ padding: '20px', textAlign: 'left' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                                    <span>{t('profile_completeness') || 'Profile Completeness'}</span>
                                    <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>75%</span>
                                </div>
                                <div style={{ height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: '75%', height: '100%', background: 'linear-gradient(90deg, var(--primary) 0%, #ff8c00 100%)' }}></div>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '8px' }}>
                                    {t('completeness_tip') || 'Add a video bio to reach 100% and get verified!'}
                                </p>
                            </div>
                        </div>
                        <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '15px 0' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Link to="/profile/edit" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', textDecoration: 'none', padding: '8px', borderRadius: '6px', transition: 'background 0.2s' }}>
                                <Settings size={18} /> {t('edit_profile')}
                            </Link>
                        </div>
                    </div>

                    {/* Referral Card */}
                    <div className="card" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #bbf7d0' }}>
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

                {/* Main Content */}
                <main>
                    {/* Gamified Rank Progress */}
                    <RankProgress user={user} />

                    <h2 style={{ marginBottom: '20px' }}>{t('recommended_jobs') || 'Recommended for You'}</h2>
                    {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}
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
