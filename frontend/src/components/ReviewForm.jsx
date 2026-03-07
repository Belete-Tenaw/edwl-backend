import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import reviewService from '../services/reviewService';

const ReviewForm = ({ targetId, targetType, contractId, onSuccess }) => {
    const { t } = useTranslation();
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError(t('please_select_rating') || 'Please select a rating');
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            await reviewService.createReview({
                rating,
                comment,
                targetId,
                targetType,
                contractId
            });
            setRating(0);
            setComment('');
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error("Error submitting review:", err);
            setError(t('failed_to_submit_review') || 'Failed to submit review.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #eee', marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '1rem' }}>{t('leave_a_review') || 'Leave a Review'}</h4>

            {error && <div style={{ color: 'red', fontSize: '0.85rem', marginBottom: '10px' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                    {[...Array(5)].map((_, index) => {
                        const ratingValue = index + 1;
                        return (
                            <button
                                type="button"
                                key={ratingValue}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                onClick={() => setRating(ratingValue)}
                                onMouseEnter={() => setHover(ratingValue)}
                                onMouseLeave={() => setHover(0)}
                            >
                                <Star
                                    size={28}
                                    fill={(hover || rating) >= ratingValue ? "#f59e0b" : "transparent"}
                                    color={(hover || rating) >= ratingValue ? "#f59e0b" : "#ccc"}
                                    style={{ transition: 'color 0.2s' }}
                                />
                            </button>
                        );
                    })}
                </div>

                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t('review_placeholder') || 'Share your experience...'}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '80px', marginBottom: '15px', fontSize: '0.9rem', outline: 'none' }}
                />

                <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '10px' }}
                >
                    {submitting ? t('submitting') : (
                        <>
                            <Send size={18} /> {t('submit_review') || 'Submit Review'}
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default ReviewForm;
