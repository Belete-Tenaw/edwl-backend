import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MapPin, DollarSign, Briefcase, Clock, CheckCircle, MessageSquare, Star, Shield, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import reviewService from '../services/reviewService';
import ReviewForm from './ReviewForm';
import { API_BASE_URL } from '../services/api';

const JobDetailModal = ({ job, onClose }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [reviews, setReviews] = React.useState([]);
    const [loadingReviews, setLoadingReviews] = React.useState(false);
    const [showReviewForm, setShowReviewForm] = React.useState(false);

    React.useEffect(() => {
        if (job?.employerId) {
            fetchReviews();
        }
    }, [job?.employerId]);

    const fetchReviews = async () => {
        setLoadingReviews(true);
        try {
            const data = await reviewService.getUserReviews('employer', job.employerId);
            setReviews(data);
        } catch (err) {
            console.error("Error fetching reviews:", err);
        } finally {
            setLoadingReviews(false);
        }
    };

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

                <h2 style={{ marginBottom: '5px', color: 'var(--primary)', paddingRight: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {job.title}
                    {job.employer?.isVerified && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            <Shield size={14} /> {t('verified')}
                        </span>
                    )}
                    {job.employer?.rating >= 4.5 && reviews.length >= 3 && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            <Star size={12} fill="white" /> TOP RATED
                        </span>
                    )}
                </h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                    <span style={{ fontWeight: '600', color: '#333' }}>{job.employer?.contactName}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Star size={14} fill="#f59e0b" color="#f59e0b" />
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{job.employer?.rating > 0 ? job.employer.rating.toFixed(1) : 'No ratings'}</span>
                        <span style={{ color: '#666', fontSize: '0.8rem' }}>({reviews.length})</span>
                    </div>
                </div>
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
                        <span>{
                            {
                                'LIVE_IN': t('live_in'),
                                'LIVE_OUT': t('live_out'),
                                'PART_TIME': t('part_time')
                            }[job.preferredArrangement] || job.preferredArrangement
                        }</span>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginBottom: '25px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{t('user_reviews') || 'Employer Feedback'}</h3>
                        <button
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}
                        >
                            {showReviewForm ? t('cancel') : t('leave_a_review')}
                        </button>
                    </div>

                    {showReviewForm && (
                        <ReviewForm
                            targetId={job.employerId}
                            targetType="employer"
                            onSuccess={() => {
                                setShowReviewForm(false);
                                fetchReviews();
                            }}
                        />
                    )}

                    {loadingReviews ? (
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>{t('loading_reviews')}</p>
                    ) : reviews.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {reviews.slice(0, 5).map(review => (
                                <div key={review.id} style={{ padding: '12px', background: '#f9f9f9', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#eee', overflow: 'hidden' }}>
                                                {review.reviewerJS?.profilePhoto ? (
                                                    <img src={`${API_BASE_URL}${review.reviewerJS?.profilePhoto}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : <User size={12} />}
                                            </div>
                                            <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{review.reviewerJS?.fullName || 'Anonymous Worker'}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1px' }}>
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={10} fill={i < review.rating ? "#f59e0b" : "transparent"} color={i < review.rating ? "#f59e0b" : "#ccc"} />
                                            ))}
                                        </div>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#555' }}>{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#666', fontSize: '0.85rem', fontStyle: 'italic' }}>{t('no_reviews_yet')}</p>
                    )}
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                    <button onClick={onClose} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>
                        {t('close')}
                    </button>
                    <button
                        onClick={() => window.open(`https://wa.me/${job.employer?.phone?.replace('+', '')}`, '_blank')}
                        style={{ padding: '10px 15px', background: '#25D366', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        WhatsApp
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
