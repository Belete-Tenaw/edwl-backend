import React, { useState, useRef } from 'react';
import { Mic, Video, Send, CheckCircle, Info, Play, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const SmartInterview = () => {
    const { t } = useTranslation();
    const [step, setStep] = useState(0); // 0: intro, 1: recording, 2: processing, 3: completed
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaBlob, setMediaBlob] = useState(null);
    const mediaRecorderRef = useRef(null);
    const videoRef = useRef(null);

    const questions = [
        "Please describe your experience in domestic work and your favorite tasks.",
        "How do you handle difficult situations or disagreements with an employer?",
        "What motivated you to join EDWL and what are your long-term goals?"
    ];

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            videoRef.current.srcObject = stream;
            mediaRecorderRef.current = new MediaRecorder(stream);
            const chunks = [];
            mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                setMediaBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing camera:", err);
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        setStep(2); // Processing
        // Simulate AI Processing
        setTimeout(() => {
            if (currentQuestionIdx < questions.length - 1) {
                setCurrentQuestionIdx(prev => prev + 1);
                setStep(0);
                setMediaBlob(null);
            } else {
                setStep(3); // Final completion
                submitInterview();
            }
        }, 3000);
    };

    const submitInterview = async () => {
        try {
            await api.post('/api/seeker/interview-complete', { status: 'COMPLETED' });
        } catch (err) {
            console.error("Error submitting interview:", err);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '100px', maxWidth: '900px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--navy)' }}>AI Smart Interview</h1>
                <p style={{ color: 'var(--text-light)' }}>Stand out to employers by recording your personal video interview.</p>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '500px' }}>
                    {/* Left: Video Area */}
                    <div style={{ background: '#000', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {step === 0 && (
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '30px', textAlign: 'center' }}>
                                <Video size={64} style={{ marginBottom: '20px', opacity: 0.5 }} />
                                <h3 style={{ marginBottom: '10px' }}>Ready for Question {currentQuestionIdx + 1}?</h3>
                                <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Ensure you are in a quiet, well-lit room.</p>
                                <button onClick={() => { setStep(1); startRecording(); }} className="btn-primary" style={{ marginTop: '20px', padding: '12px 30px', borderRadius: '30px' }}>
                                    Start Question
                                </button>
                            </div>
                        )}
                        {step === 2 && (
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <div className="loader" style={{ marginBottom: '20px' }}></div>
                                <h3 style={{ fontSize: '1.2rem' }}>AI Processing...</h3>
                                <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Transcribing and analyzing your response</p>
                            </div>
                        )}
                        {isRecording && (
                            <div style={{ position: 'absolute', top: '20px', left: '20px', background: '#ef4444', color: 'white', padding: '5px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px', animation: 'pulse 1s infinite' }}>
                                <Square size={12} fill="white" /> REC
                            </div>
                        )}
                    </div>

                    {/* Right: Question & Controls */}
                    <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                                {questions.map((_, i) => (
                                    <div key={i} style={{ flex: 1, height: '4px', background: i <= currentQuestionIdx ? 'var(--primary)' : '#eee', borderRadius: '2px' }}></div>
                                ))}
                            </div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--navy)', marginBottom: '20px' }}>Question {currentQuestionIdx + 1}</h2>
                            <div style={{ padding: '25px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '1.2rem', lineHeight: '1.5', color: '#1e293b', fontWeight: '600' }}>
                                "{questions[currentQuestionIdx]}"
                            </div>
                        </div>

                        {step === 1 && (
                            <button onClick={stopRecording} className="btn-secondary" style={{ width: '100%', padding: '15px', borderRadius: '15px', background: '#ef4444', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: '800' }}>
                                <Square size={20} fill="white" /> Stop & Finish Question
                            </button>
                        )}

                        {step === 3 && (
                            <div style={{ textAlign: 'center' }}>
                                <CheckCircle size={64} color="#10b981" style={{ marginBottom: '20px' }} />
                                <h2 style={{ color: 'var(--navy)', marginBottom: '10px' }}>Interview Complete!</h2>
                                <p style={{ color: 'var(--text-light)', marginBottom: '30px' }}>Your interview has been uploaded and added to your profile.</p>
                                <button onClick={() => window.location.href = '/dashboard/seeker'} className="btn-primary" style={{ width: '100%' }}>Return to Dashboard</button>
                            </div>
                        )}

                        <div style={{ padding: '15px', background: '#f0f9ff', borderRadius: '12px', display: 'flex', gap: '10px', alignItems: 'center', color: '#0369a1', fontSize: '0.85rem' }}>
                            <Info size={18} />
                            <span>This interview will be visible to employers to help them understand your skills better.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartInterview;
