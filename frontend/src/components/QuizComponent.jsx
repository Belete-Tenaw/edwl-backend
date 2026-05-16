import React, { useState } from 'react';
import { HelpCircle, ChevronRight, CheckCircle, XCircle, Award, RotateCcw, Trophy } from 'lucide-react';
import api from '../services/api';

const PASS_THRESHOLD = 0.7; // 70% to pass

const QuizComponent = ({ module, onComplete }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [passed, setPassed] = useState(false);
    const [badgeEarned, setBadgeEarned] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const questions = module.quizData?.questions || [
        { q: "What is the most important part of professional communication?", options: ["Honesty", "Loudness", "Speed"], correct: 0 },
        { q: "If you see a safety hazard at work, what should you do?", options: ["Ignore it", "Fix it if safe and report it", "Wait for someone else"], correct: 1 },
        { q: "Respecting the privacy of the employer means:", options: ["Not sharing family secrets", "Checking their mail", "Listening at doors"], correct: 0 }
    ];

    const handleAnswer = (optionIndex) => {
        setAnswers({ ...answers, [currentQuestion]: optionIndex });
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        // Calculate real score
        let correct = 0;
        questions.forEach((q, idx) => {
            if (answers[idx] === q.correct) correct++;
        });
        const pct = correct / questions.length;
        const didPass = pct >= PASS_THRESHOLD;
        const scoreInt = Math.round(pct * 100);

        setScore(scoreInt);
        setPassed(didPass);
        setIsSubmitted(true);

        if (didPass) {
            setSubmitting(true);
            try {
                // Call backend to record completion and award badge
                const res = await api.post('/seeker/module-complete', {
                    moduleId: module.id,
                    score: scoreInt
                });
                setBadgeEarned(res.data?.badge || null);
                onComplete({ moduleId: module.id, score: scoreInt, earnedAt: new Date().toISOString() });
            } catch (err) {
                console.error('[Quiz] Failed to record completion:', err);
            } finally {
                setSubmitting(false);
            }
        }

        setShowResult(true);
    };

    const handleRetry = () => {
        setCurrentQuestion(0);
        setAnswers({});
        setIsSubmitted(false);
        setShowResult(false);
        setScore(0);
        setPassed(false);
        setBadgeEarned(null);
    };

    // ── Result Screen ──────────────────────────────────────────────
    if (showResult) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '50px 40px' }}>
                {passed ? (
                    <>
                        {/* Celebration */}
                        <div style={{
                            width: '90px', height: '90px',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            borderRadius: '50%', margin: '0 auto 24px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 8px 24px rgba(16,185,129,0.4)',
                            animation: 'popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}>
                            <Trophy size={44} color="white" />
                        </div>
                        <h2 style={{ fontSize: '1.9rem', fontWeight: '900', color: 'var(--navy)', marginBottom: '8px' }}>
                            You Passed! 🎉
                        </h2>
                        <p style={{ color: 'var(--text-light)', marginBottom: '24px', fontSize: '1rem' }}>
                            You scored <strong style={{ color: '#10b981' }}>{score}%</strong> on <strong>{module.title}</strong>
                        </p>

                        {/* Score bar */}
                        <div style={{ background: '#f1f5f9', borderRadius: '8px', height: '10px', marginBottom: '24px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${score}%`, height: '100%',
                                background: 'linear-gradient(90deg, #10b981, #059669)',
                                borderRadius: '8px',
                                transition: 'width 1s ease'
                            }} />
                        </div>

                        {/* Badge earned */}
                        <div style={{
                            padding: '18px', background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                            borderRadius: '16px', border: '1px solid #6ee7b7', marginBottom: '24px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                                <Award size={28} color="#059669" />
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#059669', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px' }}>
                                        Certificate Earned
                                    </div>
                                    <div style={{ fontWeight: '900', color: '#065f46', fontSize: '1rem' }}>
                                        {module.title} Certified
                                    </div>
                                </div>
                                {badgeEarned && badgeEarned !== 'STANDARD' && (
                                    <div style={{
                                        marginLeft: 'auto',
                                        background: badgeEarned === 'PLATINUM' ? 'linear-gradient(135deg,#6d28d9,#7c3aed)' :
                                            badgeEarned === 'GOLD' ? 'linear-gradient(135deg,#d97706,#f59e0b)' :
                                                'linear-gradient(135deg,#64748b,#94a3b8)',
                                        color: 'white', padding: '4px 14px', borderRadius: '20px',
                                        fontSize: '0.75rem', fontWeight: '800'
                                    }}>
                                        🏅 {badgeEarned} Badge!
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ padding: '12px', background: '#ecfdf5', borderRadius: '12px', color: '#059669', fontWeight: '800', fontSize: '1rem' }}>
                            + {module.points || 50} Academy Points Earned
                        </div>
                    </>
                ) : (
                    <>
                        {/* Fail state */}
                        <div style={{
                            width: '90px', height: '90px',
                            background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                            borderRadius: '50%', margin: '0 auto 24px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 8px 24px rgba(244,63,94,0.3)',
                            animation: 'popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}>
                            <XCircle size={44} color="white" />
                        </div>
                        <h2 style={{ fontSize: '1.9rem', fontWeight: '900', color: 'var(--navy)', marginBottom: '8px' }}>
                            Not Quite Yet
                        </h2>
                        <p style={{ color: 'var(--text-light)', marginBottom: '24px', fontSize: '1rem' }}>
                            You scored <strong style={{ color: '#e11d48' }}>{score}%</strong>. You need <strong>70%</strong> to pass.
                        </p>

                        {/* Score bar */}
                        <div style={{ background: '#f1f5f9', borderRadius: '8px', height: '10px', marginBottom: '8px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${score}%`, height: '100%',
                                background: 'linear-gradient(90deg, #f43f5e, #e11d48)',
                                borderRadius: '8px'
                            }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '28px' }}>
                            <span>Your score: {score}%</span>
                            <span>Pass mark: 70%</span>
                        </div>

                        {/* Review answers */}
                        <div style={{ textAlign: 'left', marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {questions.map((q, idx) => {
                                const isCorrect = answers[idx] === q.correct;
                                return (
                                    <div key={idx} style={{
                                        padding: '12px', borderRadius: '12px',
                                        background: isCorrect ? '#ecfdf5' : '#fff1f2',
                                        border: `1px solid ${isCorrect ? '#6ee7b7' : '#fecdd3'}`
                                    }}>
                                        <div style={{ fontWeight: '700', fontSize: '0.88rem', marginBottom: '4px', color: isCorrect ? '#065f46' : '#9f1239' }}>
                                            {isCorrect ? '✅' : '❌'} {q.q}
                                        </div>
                                        {!isCorrect && (
                                            <div style={{ fontSize: '0.8rem', color: '#059669' }}>
                                                Correct answer: <strong>{q.options[q.correct]}</strong>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <button onClick={handleRetry} className="btn-primary" style={{
                            padding: '14px 30px', display: 'inline-flex', alignItems: 'center', gap: '10px'
                        }}>
                            <RotateCcw size={18} /> Try Again
                        </button>
                    </>
                )}

                <style>{`
                    @keyframes popIn {
                        0% { transform: scale(0.5); opacity: 0; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                `}</style>
            </div>
        );
    }

    // ── Question Screen ────────────────────────────────────────────
    return (
        <div className="card" style={{ padding: '30px' }}>
            {/* Progress header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--primary)' }}>
                    QUESTION {currentQuestion + 1} OF {questions.length}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                    {questions.map((_, i) => (
                        <div key={i} style={{
                            width: '28px', height: '6px', borderRadius: '3px',
                            background: i < currentQuestion ? 'var(--primary)' : i === currentQuestion ? 'var(--primary)' : '#e2e8f0',
                            opacity: i === currentQuestion ? 1 : i < currentQuestion ? 0.7 : 0.3,
                            transition: 'all 0.3s ease'
                        }} />
                    ))}
                </div>
            </div>

            {/* Pass threshold reminder */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px',
                padding: '8px 14px', background: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a'
            }}>
                <HelpCircle size={14} color="#d97706" />
                <span style={{ fontSize: '0.78rem', color: '#92400e', fontWeight: '600' }}>
                    Answer at least 70% correctly to earn your certificate
                </span>
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '28px', color: 'var(--navy)', lineHeight: 1.4 }}>
                {questions[currentQuestion].q}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {questions[currentQuestion].options.map((option, idx) => {
                    const isSelected = answers[currentQuestion] === idx;
                    return (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            style={{
                                padding: '16px 20px',
                                textAlign: 'left',
                                borderRadius: '14px',
                                border: isSelected ? '2px solid var(--primary)' : '2px solid #f1f5f9',
                                background: isSelected ? 'hsla(180, 100%, 25%, 0.06)' : 'white',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: isSelected ? '700' : '500',
                                transition: 'all 0.15s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                                boxShadow: isSelected ? '0 4px 12px rgba(0,128,128,0.15)' : '0 1px 3px rgba(0,0,0,0.04)'
                            }}
                        >
                            <div style={{
                                width: '28px', height: '28px', borderRadius: '50%',
                                border: `2px solid ${isSelected ? 'var(--primary)' : '#cbd5e1'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: isSelected ? 'var(--primary)' : 'transparent',
                                flexShrink: 0
                            }}>
                                {isSelected && <CheckCircle size={16} color="white" />}
                            </div>
                            {option}
                        </button>
                    );
                })}
            </div>

            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}>
                    {Object.keys(answers).length} of {questions.length} answered
                </span>
                <button
                    disabled={answers[currentQuestion] === undefined || submitting}
                    onClick={handleNext}
                    className="btn-primary"
                    style={{
                        padding: '12px 30px',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        opacity: answers[currentQuestion] === undefined ? 0.4 : 1,
                        cursor: answers[currentQuestion] === undefined ? 'not-allowed' : 'pointer'
                    }}
                >
                    {currentQuestion === questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default QuizComponent;
