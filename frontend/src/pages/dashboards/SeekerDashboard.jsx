import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import authService from '../../services/authService';
import { Briefcase, MapPin, DollarSign, Shield, UserPlus, Copy, Check, Search, UserCircle, Sparkles, BookOpen, Video, ChevronRight, TrendingUp, Loader } from 'lucide-react';
import JobDetailModal from '../../components/JobDetailModal';
import RankProgress from '../../components/RankProgress';
import TrustScorecard from '../../components/TrustScorecard';
import Skeleton, { CardSkeleton } from '../../components/Skeleton';
import { useToast } from '../../components/Toast';
import { FileText } from 'lucide-react';
import DigitalContractViewer from '../../components/DigitalContractViewer';
import EscrowTracker from '../../components/EscrowTracker';
import SafeCheckIn from '../../components/SafeCheckIn';

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
    const [loans, setLoans] = useState([]);
    const [loanAmount, setLoanAmount] = useState(1000);
    const [loanLoading, setLoanLoading] = useState(false);
    const [loanMsg, setLoanMsg] = useState(null);
    const [copied, setCopied] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLocation, setFilterLocation] = useState('');

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
                const [jobsRes, profileRes, contractsRes, escrowRes, loansRes] = await Promise.all([
                    api.get('/jobs'),
                    api.get(`/seekers/${user.id}`),
                    api.get('/contracts'),
                    api.get('/escrow'),
                    api.get('/loans').catch(() => ({ data: [] }))
                ]);

                setContracts(contractsRes.data || []);
                setEscrows(escrowRes.data || []);
                setLoans(loansRes.data || []);
                // Smart Sort: personalized score first, then verified employers and salary.
                const sortedJobs = jobsRes.data.sort((a, b) => {
                    const aScore = a.matchScore || a.match_score || 0;
                    const bScore = b.matchScore || b.match_score || 0;
                    if (bScore !== aScore) return bScore - aScore;
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

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = (job.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                              ((job.requiredSkills || []).join(' ')).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLocation = filterLocation ? (job.address === filterLocation) : true;
        return matchesSearch && matchesLocation;
    });

    const uniqueLocations = [...new Set(jobs.map(j => j.address).filter(Boolean))];

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
                                {user.tier} {t('membership')}
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text)' }}>
                                {Math.ceil((new Date(user.subscriptionExpiry) - new Date()) / (1000 * 60 * 60 * 24)) > 0 ? (
                                    <span>
                                        {Math.ceil((new Date(user.subscriptionExpiry) - new Date()) / (1000 * 60 * 60 * 24))} {t('days_left')}
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
                            {t('renew')}
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
                                <Sparkles size={14} /> {user?.tier} {t('seeker')}
                            </div>
                        </div>
                        
                        <div style={{ margin: '15px -15px 0' }}>
                            <TrustScorecard seeker={user} />
                        </div>

                        <hr style={{ border: '0', borderTop: '1px solid #f1f5f9', margin: '24px 0' }} />
                        <Link to="/profile/edit" className="btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px', textDecoration: 'none', fontWeight: '700' }}>
                            <FileText size={18} /> {t('settings')}
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
                            {t('browse_jobs')}
                        </button>
                        <button 
                            onClick={() => setActiveTab('agreements')} 
                            style={{ background: 'none', border: 'none', padding: '10px 20px', fontSize: '1rem', fontWeight: activeTab === 'agreements' ? 'bold' : 'normal', color: activeTab === 'agreements' ? 'var(--primary)' : '#666', borderBottom: activeTab === 'agreements' ? '3px solid var(--primary)' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <FileText size={18} /> {t('agreements')}
                        </button>
                        <button
                            onClick={() => setActiveTab('escrow')}
                            style={{ background: 'none', border: 'none', padding: '10px 20px', fontSize: '1rem', fontWeight: activeTab === 'escrow' ? 'bold' : 'normal', color: activeTab === 'escrow' ? 'var(--primary)' : '#666', borderBottom: activeTab === 'escrow' ? '3px solid var(--primary)' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Shield size={18} /> {t('escrow_tracking')}
                        </button>
                        {user?.tier === 'PLATINUM' && (
                            <button
                                onClick={() => setActiveTab('financials')}
                                style={{ background: 'none', border: 'none', padding: '10px 20px', fontSize: '1rem', fontWeight: activeTab === 'financials' ? 'bold' : 'normal', color: activeTab === 'financials' ? '#7c3aed' : '#666', borderBottom: activeTab === 'financials' ? '3px solid #7c3aed' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <TrendingUp size={18} /> {t('financials')}
                            </button>
                        )}
                    </div>

                    {activeTab === 'jobs' ? (
                        <>
                            {/* Wave 2 Features: Academy & Interview */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                                <Link to="/academy/dashboard" className="card glass-hover" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', textDecoration: 'none', background: 'linear-gradient(135deg, var(--navy) 0%, #1e293b 100%)', color: 'white' }}>
                                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <BookOpen size={30} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>{t('edwl_academy')}</h3>
                                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', opacity: 0.8 }}>{t('academy_dashboard_desc')}</p>
                                    </div>
                                    <ChevronRight style={{ marginLeft: 'auto', opacity: 0.5 }} />
                                </Link>

                                <Link to="/smart-interview" className="card glass-hover" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', textDecoration: 'none', background: 'linear-gradient(135deg, var(--primary) 0%, #0d9488 100%)', color: 'white' }}>
                                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Video size={30} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>{t('smart_interview')}</h3>
                                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', opacity: 0.8 }}>{t('interview_dashboard_desc')}</p>
                                    </div>
                                    <ChevronRight style={{ marginLeft: 'auto', opacity: 0.5 }} />
                                </Link>
                            </div>

                            {/* Rank Progress */}
                            <RankProgress user={user} />

                            <div style={{ display: 'flex', gap: '15px', marginBottom: '24px', flexWrap: 'wrap' }}>
                                <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                                    <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                                    <input
                                        type="text"
                                        placeholder={t('search_jobs_placeholder')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '16px', border: '1px solid #f1f5f9', background: 'white', fontSize: '0.95rem' }}
                                    />
                                </div>
                                <select
                                    value={filterLocation}
                                    onChange={(e) => setFilterLocation(e.target.value)}
                                    style={{ padding: '0 20px', borderRadius: '16px', border: '1px solid #f1f5f9', background: 'white', color: 'var(--text)', fontSize: '0.95rem', fontWeight: '600' }}
                                >
                                    <option value="">{t('all_locations')}</option>
                                    {uniqueLocations.map(loc => (
                                        <option key={loc} value={loc}>{loc}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text)', margin: 0 }}>
                                    {t('recommended')}
                                </h2>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: '600' }}>
                                    {filteredJobs.length} {t('jobs_found')}
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
                                    {filteredJobs.length > 0 ? (
                                        filteredJobs.map((job, index) => (
                                            <div key={job.id} className={`card reveal delay-${index % 5 + 1}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', borderRadius: '24px', transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                                                        {(job.matchScore || job.match_score) > 0 && (
                                                            <span title={(job.matchInsights || []).join(' | ')} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(0, 128, 128, 0.1)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '800' }}>
                                                                <Sparkles size={12} strokeWidth={3} /> {t('smart_match', 'Smart Match')} {job.matchScore || job.match_score}%
                                                            </span>
                                                        )}
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
                                                    {job.matchInsights?.length > 0 && (
                                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                                                            {job.matchInsights.slice(0, 3).map(insight => (
                                                                <span key={insight} style={{ background: '#ecfeff', border: '1px solid #cffafe', color: '#0e7490', padding: '5px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: '700' }}>
                                                                    {insight}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div style={{ display: 'flex', gap: '20px', color: 'var(--text-light)', fontSize: '0.95rem', marginBottom: '20px', flexWrap: 'wrap' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={18} color="var(--primary)" /> {job.address}</span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><DollarSign size={18} color="#059669" /> <strong>{job.salaryOffered} ETB</strong></span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Briefcase size={18} color="#6366f1" /> {job.jobType}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                        {(job.requiredSkills || []).map(skill => (
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
                                            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text)', marginBottom: '12px' }}>{t('no_jobs_matches')}</h3>
                                            <p style={{ color: 'var(--text-light)', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto 30px' }}>
                                                {t('empty_jobs_desc')}
                                            </p>
                                            <button onClick={() => navigate('/profile/edit')} className="btn-primary" style={{ padding: '14px 30px', borderRadius: '16px', fontWeight: '700', gap: '10px' }}>
                                                <Sparkles size={18} /> {t('complete_profile')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : activeTab === 'agreements' ? (
                        <div style={{ display: 'grid', gap: '24px' }}>
                            {/* ✅ Safe Check-In Widget — shown whenever there are active contracts */}
                            <SafeCheckIn contracts={contracts} />
                            {contracts.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '50px' }}>
                                    <FileText size={48} color="#ccc" style={{ marginBottom: '15px' }} />
                                    <h3>{t('no_contracts_found')}</h3>
                                    <p>{t('employer_will_send_contracts')}</p>
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
                    ) : activeTab === 'escrow' ? (
                        <div style={{ display: 'grid', gap: '24px' }}>
                            {escrows.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '50px' }}>
                                    <Shield size={48} color="#ccc" style={{ marginBottom: '15px' }} />
                                    <h3>{t('no_payments_held')}</h3>
                                    <p>{t('escrow_fund_msg')}</p>
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
                    ) : (
                        /* Financials / Micro-Loan Tab */
                        <div style={{ display: 'grid', gap: '24px' }}>
                            {/* Loan Request Card */}
                            <div className="card" style={{ background: 'linear-gradient(135deg, #faf5ff, #ede9fe)', border: '1px solid #c4b5fd', borderRadius: '20px', padding: '28px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                    <div style={{ background: '#7c3aed', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <TrendingUp size={22} color="white" />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontWeight: '800', color: '#4c1d95' }}>{t('salary_advance')}</h3>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#7c3aed' }}>{t('collateral_msg')}</p>
                                    </div>
                                    <div style={{ marginLeft: 'auto', background: '#ede9fe', color: '#6d28d9', padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '800', border: '1px solid #c4b5fd' }}>{t('platinum_only')}</div>
                                </div>

                                <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #e9d5ff' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '700', color: '#6d28d9', marginBottom: '10px' }}>
                                        <span>{t('request_amount')}</span>
                                        <span>{loanAmount.toLocaleString()} ETB</span>
                                    </div>
                                    <input type="range" min="500" max="10000" step="250" value={loanAmount}
                                        onChange={e => setLoanAmount(+e.target.value)}
                                        style={{ width: '100%', accentColor: '#7c3aed' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#a78bfa', marginTop: '6px' }}>
                                        <span>500 ETB</span><span>10,000 ETB</span>
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(124,58,237,0.06)', borderRadius: '10px', padding: '12px', marginBottom: '16px', fontSize: '0.82rem', color: '#5b21b6' }}>
                                    ℹ️ {t('loan_repayment_msg')}
                                </div>

                                {loanMsg && (
                                    <div style={{ background: loanMsg.type === 'success' ? '#f0fdf4' : '#fef2f2', color: loanMsg.type === 'success' ? '#15803d' : '#dc2626', border: `1px solid ${loanMsg.type === 'success' ? '#86efac' : '#fca5a5'}`, borderRadius: '10px', padding: '12px', marginBottom: '12px', fontWeight: '600', fontSize: '0.88rem' }}>
                                        {loanMsg.text}
                                    </div>
                                )}

                                <button
                                    disabled={loanLoading}
                                    onClick={async () => {
                                        setLoanLoading(true); setLoanMsg(null);
                                        try {
                                            await api.post('/loans/request', { amount: loanAmount });
                                            setLoanMsg({ type: 'success', text: `✅ ${t('loan_approved_msg', { amount: loanAmount.toLocaleString() })}` });
                                            const res = await api.get('/loans');
                                            setLoans(res.data || []);
                                        } catch (err) {
                                            setLoanMsg({ type: 'error', text: err?.response?.data?.error || 'Request failed. Check your eligibility.' });
                                        } finally { setLoanLoading(false); }
                                    }}
                                    style={{ width: '100%', padding: '14px', background: loanLoading ? '#a78bfa' : '#7c3aed', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    {loanLoading ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> {t('processing')}</> : `${t('request_advance')} ${loanAmount.toLocaleString()} ETB`}
                                </button>
                            </div>

                            {/* Loan History */}
                            {loans.length > 0 && (
                                <div className="card" style={{ borderRadius: '20px', padding: '24px' }}>
                                    <h3 style={{ marginBottom: '16px', fontWeight: '800', color: '#0f172a' }}>Loan History</h3>
                                    {loans.map(loan => (
                                        <div key={loan.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                                            <div>
                                                <div style={{ fontWeight: '700', color: '#0f172a' }}>{loan.amount.toLocaleString()} ETB</div>
                                                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Due: {new Date(loan.dueDate).toLocaleDateString()}</div>
                                            </div>
                                            <div style={{ background: loan.status === 'REPAID' ? '#dcfce7' : loan.status === 'ACTIVE' ? '#eff6ff' : '#fef9c3', color: loan.status === 'REPAID' ? '#15803d' : loan.status === 'ACTIVE' ? '#1d4ed8' : '#854d0e', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '800' }}>
                                                {loan.status}
                                            </div>
                                        </div>
                                    ))}
                                </div>
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
