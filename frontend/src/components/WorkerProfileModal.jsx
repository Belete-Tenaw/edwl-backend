import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MapPin, Briefcase, User, MessageSquare, Star, Shield, Phone, FileText, Activity, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import authService from '../services/authService';
import reviewService from '../services/reviewService';
import ReviewForm from './ReviewForm';
import UpgradeModal from './UpgradeModal';

const WorkerProfileModal = ({ worker, onClose }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [targetTier, setTargetTier] = useState('GOLD');
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const user = authService.getCurrentUser();

    React.useEffect(() => {
        if (worker?.id) {
            fetchReviews();
        }
    }, [worker?.id]);

    const fetchReviews = async () => {
        setLoadingReviews(true);
        try {
            const data = await reviewService.getUserReviews('seeker', worker.id);
            setReviews(data);
        } catch (err) {
            console.error("Error fetching reviews:", err);
        } finally {
            setLoadingReviews(false);
        }
    };

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

    const isSilver = user?.tier === 'SILVER_ACCESS' || user?.tier === 'FREE';
    const isGold = user?.tier === 'GOLD_ACCESS';
    const isPlatinum = user?.tier === 'PLATINUM_ACCESS';

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
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
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
                            {worker.rating >= 4.5 && reviews.length >= 3 && (
                                <div title="Top Rated Provider" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                    <Star size={14} fill="white" /> TOP RATED
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginBottom: '5px' }}>
                            <Star size={18} fill="#f59e0b" color="#f59e0b" />
                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{worker.rating > 0 ? worker.rating.toFixed(1) : 'No ratings'}</span>
                            <span style={{ color: '#666', fontSize: '0.9rem' }}>({reviews.length} {t('reviews')})</span>
                        </div>
                        <p style={{ color: '#666', marginTop: '5px' }}>{worker.age} {t('years_old')} • {worker.gender === 'FEMALE' ? t('female') : t('male')}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                        <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>{t('phone_number')}</div>
                            <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Phone size={14} color="#64748b" />
                                {worker.phone === '********' ? (
                                    isSilver || isGold || isPlatinum ? (
                                        <span style={{ color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic' }}>({t('verification_pending')})</span>
                                    ) : (
                                        <span onClick={() => handleRestrictedAction('GOLD')} style={{ color: '#f59e0b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Lock size={12} /> {t('gold_required') || 'Gold Access'}
                                        </span>
                                    )
                                ) : worker.phone}
                            </div>
                        </div>
                        <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>{t('national_id_fayda')}</div>
                            <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileText size={14} color="#64748b" />
                                {worker.nationalIdFayda === '********' || !worker.nationalIdFayda ? (
                                    isSilver || isGold || isPlatinum ? (
                                        <span style={{ color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic' }}>({t('verification_pending')})</span>
                                    ) : (
                                        <span onClick={() => handleRestrictedAction('GOLD')} style={{ color: '#f59e0b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Lock size={12} /> {t('gold_required')}
                                        </span>
                                    )
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
                                ) : worker.display_tier === 'PLATINUM' && isPlatinum ? (
                                    <span style={{ color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic' }}>({t('verification_pending')})</span>
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
                                ) : worker.display_tier === 'PLATINUM' && isPlatinum ? (
                                    <span style={{ color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic' }}>({t('verification_pending')})</span>
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

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {worker.skills.map(skill => (
                            <span key={skill} style={{ background: '#f1f5f9', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', color: '#475569', border: '1px solid #e2e8f0' }}>
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginBottom: '25px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{t('user_reviews') || 'Worker Reviews'}</h3>
                        <button
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}
                        >
                            {showReviewForm ? t('cancel') : t('leave_a_review')}
                        </button>
                    </div>

                    {showReviewForm && (
                        <ReviewForm
                            targetId={worker.id}
                            targetType="seeker"
                            onSuccess={() => {
                                setShowReviewForm(false);
                                fetchReviews();
                            }}
                        />
                    )}

                    {loadingReviews ? (
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>{t('loading_reviews') || 'Loading reviews...'}</p>
                    ) : reviews.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {reviews.map(review => (
                                <div key={review.id} style={{ padding: '15px', background: '#f9f9f9', borderRadius: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#eee', overflow: 'hidden' }}>
                                                {(review.reviewerEmp?.profilePhoto || review.reviewerJS?.profilePhoto) ? (
                                                    <img
                                                        src={`${BACKEND_URL}${review.reviewerEmp?.profilePhoto || review.reviewerJS?.profilePhoto}`}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : <User size={16} />}
                                            </div>
                                            <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                                                {review.reviewerEmp?.contactName || review.reviewerJS?.fullName || 'Anonymous User'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={12} fill={i < review.rating ? "#f59e0b" : "transparent"} color={i < review.rating ? "#f59e0b" : "#ccc"} />
                                            ))}
                                        </div>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#444' }}>{review.comment}</p>
                                    <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '5px' }}>
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#666', fontSize: '0.9rem', fontStyle: 'italic' }}>{t('no_reviews_yet') || 'No reviews yet.'}</p>
                    )}
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                    <button onClick={onClose} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
                        {t('close')}
                    </button>
                    <button
                        onClick={() => window.open(`https://t.me/+251${worker.phone?.replace(/^\+251/, '')}`, '_blank')}
                        style={{ padding: '10px 15px', background: '#0088cc', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        Telegram
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