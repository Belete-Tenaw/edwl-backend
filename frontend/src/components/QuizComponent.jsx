import React, { useState } from 'react';
import { HelpCircle, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';

const QuizComponent = ({ module, onComplete }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Mock questions if not provided
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

    const handleSubmit = () => {
        setIsSubmitted(true);
        // In real app, send to backend
        setTimeout(() => {
            onComplete({ moduleId: module.id, score: 100, earnedAt: new Date().toISOString() });
        }, 2000);
    };

    if (isSubmitted) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '50px' }}>
                <div className="success-pulse" style={{ width: '80px', height: '80px', background: '#10b981', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <CheckCircle size={40} />
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--navy)' }}>Congratulations!</h2>
                <p style={{ color: 'var(--text-light)', marginBottom: '30px' }}>You have successfully completed the <strong>{module.title}</strong> module.</p>
                <div style={{ padding: '15px', background: '#ecfdf5', borderRadius: '12px', color: '#059669', fontWeight: '800' }}>
                    + {module.points} Academy Points Earned
                </div>
            </div>
        );
    }

    return (
        <div className="card" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--primary)' }}>QUESTION {currentQuestion + 1} OF {questions.length}</div>
                <div style={{ width: '100px', height: '6px', background: '#eee', borderRadius: '3px', marginTop: '6px' }}>
                    <div style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px', transition: 'width 0.3s ease' }}></div>
                </div>
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '30px', color: 'var(--navy)' }}>
                {questions[currentQuestion].q}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {questions[currentQuestion].options.map((option, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        style={{
                            padding: '16px 20px',
                            textAlign: 'left',
                            borderRadius: '12px',
                            border: answers[currentQuestion] === idx ? '2px solid var(--primary)' : '2px solid #f1f5f9',
                            background: answers[currentQuestion] === idx ? 'hsla(180, 100%, 25%, 0.05)' : 'white',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: answers[currentQuestion] === idx ? '700' : '500',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px'
                        }}
                    >
                        <div style={{ 
                            width: '24px', height: '24px', borderRadius: '50%', 
                            border: '2px solid #cbd5e1', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: answers[currentQuestion] === idx ? 'var(--primary)' : 'transparent',
                            borderColor: answers[currentQuestion] === idx ? 'var(--primary)' : '#cbd5e1'
                        }}>
                            {answers[currentQuestion] === idx && <CheckCircle size={14} color="white" />}
                        </div>
                        {option}
                    </button>
                ))}
            </div>

            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                    disabled={answers[currentQuestion] === undefined}
                    onClick={handleNext}
                    className="btn-primary"
                    style={{ padding: '12px 30px', display: 'flex', alignItems: 'center', gap: '10px', opacity: answers[currentQuestion] === undefined ? 0.5 : 1 }}
                >
                    {currentQuestion === questions.length - 1 ? 'Submit Quiz' : 'Next Question'} <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default QuizComponent;
