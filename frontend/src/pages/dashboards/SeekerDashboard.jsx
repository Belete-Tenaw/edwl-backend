import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import authService from '../../services/authService';
import { Briefcase, MapPin, DollarSign, Shield, UserPlus, Copy, Check, Search, UserCircle, Sparkles } from 'lucide-react';
import JobDetailModal from '../../components/JobDetailModal';
import RankProgress from '../../components/RankProgress';
import TrustScorecard from '../../components/TrustScorecard';
import Skeleton, { CardSkeleton } from '../../components/Skeleton';
import { useToast } from '../../components/Toast';
import { FileText } from 'lucide-react';
import DigitalContractViewer from '../../components/DigitalContractViewer';
import EscrowTracker from '../../components/EscrowTracker';

const SeekerDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const addToast = useToast();

    const [jobs, setJobs] = useState([]);
    const [user, setUser] = useState(authService.getCurrentUser());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const [activeTab, setActiveTab] = useState('jobs'); // 'jobs', 'agreements', 'escrow'
    const [contracts, setContracts] = useState([]);
    const [escrows, setEscrows] = useState([]);
    const [pendingVerification, setPendingVerification] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopyCode = () => {
        if (user?.referralCode) {
            navigator.clipboard.writeText(user.referralCode);
            setCopied(true);
            addToast(t('code_copied') || 'Referral code copied!', 'success');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobsRes, profileRes, contractsRes, escrowRes] = await Promise.all([
                    api.get('/jobs'),
                    api.get(`/seekers/${user.id}`),
                    api.get('/contracts'),
                    api.get('/escrow')
                ]);
                
                setContracts(contractsRes.data || []);
                setEscrows(escrowRes.data || []);
                // Smart Sort: Verified Employers and Jobs with higher Salary first
                const sortedJobs = jobsRes.data.sort((a, b) => {
                    if (a.employer?.isVerified && !b.employer?.isVerified) return -1;
                    if (!a.employer?.isVerified && b.employer?.isVerified) return 1;
                    return b.salaryOffered - a.salaryOffered;
                });

                setJobs(sortedJobs);
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
    }, [user.id, t]);

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            <header className="reveal" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--text)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                        {t('welcome')}, {user?.fullName.split(' ')[0]} 👋
                    </h1>
                    <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>{t('welcome_msg') || 'Find your next opportunity today.'}</p>
                </div>
                
                {user?.tier !== 'BRONZE' && user?.subscriptionExpiry && (
                    <div className="reveal delay-1" style={{ 
                        background: 'rgba(0, 128, 128, 0.05)', 
                        border: '1px solid rgba(0, 128, 128, 0.1)', 
                        padding: '12px 24px', 
                        borderRadius: '20px', 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div style={{ 
                            width: '44px', height: '44px', borderRadius: '14px', background: 'white', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0,128,128,0.1)', color: 'var(--primary)'
                        }}>
                            <Shield size={22} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800' }}>
                                {user.tier} {t('membership') || 'PRO'}
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text)' }}>
                                {Math.ceil((new Date(user.subscriptionExpiry) - new Date()) / (1000 * 60 * 60 * 24)) > 0 ? (
                                    <span>
                                        {Math.ceil((new Date(user.subscriptionExpiry) - new Date()) / (1000 * 60 * 60 * 24))} {t('days_left') || 'Days Left'}
                                    </span>
                                ) : (
                                    <span style={{ color: '#ef4444' }}>{t('expired')}</span>
                                )}
                            </div>
                        </div>
                        <button 
                            onClick={() => navigate('/pricing')}
                            style={{ marginLeft: '8px', padding: '8px 16px', borderRadius: '10px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700' }}
                        >
                            {t('renew') || 'Renew'}
                        </button>
                    </div>
                )}
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                {/* Sidebar */}
                <aside className="reveal delay-2" style={{ maxWidth: '340px' }}>
                    <div className="card" style={{ marginBottom: '24px', borderRadius: '24px', padding: '30px', border: '1px solid #f1f5f9' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: '100px', height: '100px', background: '#f8fafc', borderRadius: '32px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '4px solid white', boxShadow: '0 8px 20px rgba(0,0,0,0.05)' }}>
                                {user?.profilePhoto ? (
                                    <img src={user.profilePhoto} alt={user.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <UserCircle size={60} color="#cbd5e1" />
                                )}
                            </div>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '4px' }}>{user?.fullName}</h3>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 128, 128, 0.08)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700', marginBottom: '15px' }}>
                                <Sparkles size={14} /> {user?.tier} Seeker
                            </div>
                        </div>
                        
                        <div style={{ margin: '15px -15px 0' }}>
                            <TrustScorecard seeker={user} />
                        </div>

                        <hr style={{ border: '0', borderTop: '1px solid #f1f5f9', margin: '24px 0' }} /> />
                        <Link to="/profile/edit" className="btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px', textDecoration: 'none', fontWeight: '700' }}>
                            <Settings size={18} /> {t('settings') || 'Settings'}
                        </Link>
                    </div>

                    {/* Referral Card */}
                    <div className="card" style={{ background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)', border: '1px solid #99f6e4', borderRadius: '24px', padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                            <UserPlus size={22} color="#0d9488" />
                            <h3 style={{ fontSize: '1.1rem', color: '#0f766e', margin: 0, fontWeight: '800' }}>{t('referral_program')}</h3>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#134e4a', marginBottom: '20px', lineHeight: '1.6' }}>
                            {t('referral_bonus_msg')}
                        </p>

                        <div style={{ background: 'white', padding: '14px', borderRadius: '16px', border: '2px dashed #5eead4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <span style={{ fontWeight: '800', letterSpacing: '2px', color: 'var(--text)', fontSize: '1.1rem' }}>{user?.referralCode}</span>
                            <button
                                onClick={handleCopyCode}
                                style={{ background: 'rgba(0,128,128,0.05)', border: 'none', cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center', padding: '8px', borderRadius: '8px' }}
                            >
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                            </button>
                        </div>

                        <div style={{ fontSize: '0.85rem', color: '#0f766e' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: '700' }}>
                                <span>{t('successful_referrals')}:</span>
                                <span>{user?.referralCount || 0} / 3</span>
                            </div>
                            <div style={{ height: '8px', background: 'rgba(0, 128, 128, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${Math.min(((user?.referralCount || 0) / 3) * 100, 100)}%`, height: '100%', background: 'var(--primary)' }}></div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="reveal delay-3">
                    {/* Tab Switcher */}
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                        <button 
                            onClick={() => setActiveTab('jobs')} 
                            style={{ background: 'none', border: 'none', padding: '10px 20px', fontSize: '1rem', fontWeight: activeTab === 'jobs' ? 'bold' : 'normal', color: activeTab === 'jobs' ? 'var(--primary)' : '#666', borderBottom: activeTab === 'jobs' ? '3px solid var(--primary)' : 'none', cursor: 'pointer' }}
                        >
                            {t('browse_jobs') || 'Browse Jobs'}
                        </button>
                        <button 
                            onClick={() => setActiveTab('agreements')} 
                            style={{ background: 'none', border: 'none', padding: '10px 20px', fontSize: '1rem', fontWeight: activeTab === 'agreements' ? 'bold' : 'normal', color: activeTab === 'agreements' ? 'var(--primary)' : '#666', borderBottom: activeTab === 'agreements' ? '3px solid var(--primary)' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <FileText size={18} /> {t('agreements') || 'Contracts'}
                        </button>
                        <button 
                            onClick={() => setActiveTab('escrow')} 
                            style={{ background: 'none', border: 'none', padding: '10px 20px', fontSize: '1rem', fontWeight: activeTab === 'escrow' ? 'bold' : 'normal', color: activeTab === 'escrow' ? 'var(--primary)' : '#666', borderBottom: activeTab === 'escrow' ? '3px solid var(--primary)' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Shield size={18} /> {t('escrow_tracking') || 'Escrow'}
                        </button>
                    </div>

                    {activeTab === 'jobs' ? (
                        <>
                            {/* Rank Progress */}
                            <RankProgress user={user} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text)', margin: 0 }}>
                                    {t('recommended') || 'Smart Picks'}
                                </h2>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: '600' }}>
                                    {jobs.length} {t('jobs_found') || 'Opportunities'}
                                </span>
                            </div>

                            {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '16px', borderRadius: '16px', marginBottom: '24px', border: '1px solid #fee2e2', fontWeight: '600' }}>{error}</div>}
                            
                            {loading ? (
                                <div style={{ display: 'grid', gap: '20px' }}>
                                    <CardSkeleton />
                                    <CardSkeleton />
                                    <CardSkeleton />
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gap: '24px' }}>
                                    {jobs.length > 0 ? (
                                        jobs.map((job, index) => (
                                            <div key={job.id} className={`card reveal delay-${index % 5 + 1}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', borderRadius: '24px', transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                                                        {job.employer?.isVerified && (
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(0, 128, 128, 0.1)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '800' }}>
                                                                <Shield size={12} strokeWidth={3} /> {t('verified_top_choice')}
                                                            </span>
                                                        )}
                                                        {job.isUrgent && (
                                                            <span style={{ background: '#fff1f2', color: '#e11d48', padding: '4px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                🔥 {t('urgent')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text)', marginBottom: '12px' }}>{job.title}</h3>
                                                    <div style={{ display: 'flex', gap: '20px', color: 'var(--text-light)', fontSize: '0.95rem', marginBottom: '20px', flexWrap: 'wrap' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={18} color="var(--primary)" /> {job.address}</span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><DollarSign size={18} color="#059669" /> <strong>{job.salaryOffered} ETB</strong></span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Briefcase size={18} color="#6366f1" /> {job.jobType}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                        {job.requiredSkills.map(skill => (
                                                            <span key={skill} style={{ background: '#f8fafc', border: '1px solid #f1f5f9', padding: '6px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>{skill}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <button onClick={() => setSelectedJob(job)} className="btn-primary" style={{ padding: '12px 24px', borderRadius: '14px', fontWeight: '700' }}>
                                                    {t('view_details')}
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        /* Empty State */
                                        <div className="card reveal" style={{ textAlign: 'center', padding: '100px 40px', borderRadius: '32px', border: '2px dashed #e2e8f0', background: 'transparent' }}>
                                            <div style={{ width: '100px', height: '100px', background: '#f1f5f9', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                                                <Search size={48} color="#94a3b8" />
                                            </div>
                                            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text)', marginBottom: '12px' }}>{t('no_jobs_matches') || 'No Matches Found Yet'}</h3>
                                            <p style={{ color: 'var(--text-light)', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto 30px' }}>
                                                {t('empty_jobs_desc') || "We're looking for jobs that match your skills. In the meantime, try completing your profile to stand out!"}
                                            </p>
                                            <button onClick={() => navigate('/profile/edit')} className="btn-primary" style={{ padding: '14px 30px', borderRadius: '16px', fontWeight: '700', gap: '10px' }}>
                                                <Sparkles size={18} /> {t('complete_profile') || 'Enhance My Profile'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : activeTab === 'agreements' ? (
                        <div style={{ display: 'grid', gap: '24px' }}>
                            {contracts.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '50px' }}>
                                    <FileText size={48} color="#ccc" style={{ marginBottom: '15px' }} />
                                    <h3>No contracts found</h3>
                                    <p>Employers will send you contracts once they're interested.</p>
                                </div>
                            ) : (
                                contracts.map(contract => (
                                    <DigitalContractViewer 
                                        key={contract.id} 
                                        contract={contract} 
                                        userRole="seeker" 
                                        onUpdate={() => window.location.reload()}
                                    />
                                ))
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '24px' }}>
                            {escrows.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '50px' }}>
                                    <Shield size={48} color="#ccc" style={{ marginBottom: '15px' }} />
                                    <h3>No payments held</h3>
                                    <p>Escrow payments appear here when an employer funds your contract.</p>
                                </div>
                            ) : (
                                escrows.map(escrow => (
                                    <EscrowTracker 
                                        key={escrow.id} 
                                        escrow={escrow} 
                                        userRole="seeker" 
                                        onUpdate={() => window.location.reload()}
                                    />
                                ))
                            )}
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
