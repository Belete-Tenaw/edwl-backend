import React, { useState, useEffect } from 'react';
import { BookOpen, Award, CheckCircle, Play, ArrowRight, ShieldCheck, Star, Trophy, Sparkles, GraduationCap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import QuizComponent from '../components/QuizComponent';
import BackButton from '../components/BackButton';
import { Helmet } from 'react-helmet-async';

const AcademyDashboard = () => {
    const { t } = useTranslation();
    const [modules, setModules] = useState([]);
    const [certifications, setCertifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeQuiz, setActiveQuiz] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [modRes, certRes] = await Promise.all([
                api.get('/api/seeker/training-modules'),
                api.get('/api/seeker/certifications')
            ]);
            setModules(modRes.data);
            setCertifications(certRes.data);
        } catch (err) {
            console.error("Error fetching academy data:", err);
            // Mock data for premium demo
            setModules([
                { id: 'm1', title: 'Professional Ethics', description: 'Mastering workplace communication, emotional intelligence, and boundaries.', category: 'CORE', points: 50, color: '#38bdf8' },
                { id: 'm2', title: 'Hygiene & Safety', description: 'Essential hygiene standards, chemical safety, and COVID-19 protocols.', category: 'SAFETY', points: 30, color: '#10b981' },
                { id: 'm3', title: 'Child Care Basics', description: 'Understanding developmental milestones, pediatric first aid, and nutrition.', category: 'SPECIALIZED', points: 100, color: '#8b5cf6' },
                { id: 'm4', title: 'Elderly Support', description: 'Compassionate care for seniors, mobility assistance, and medication tracking.', category: 'SPECIALIZED', points: 150, color: '#f59e0b' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const isCompleted = (moduleId) => certifications.some(c => c.moduleId === moduleId);
    const totalPoints = certifications.length * 50;
    const progressPercent = modules.length > 0 ? (certifications.length / modules.length) * 100 : 0;

    if (activeQuiz) {
        return (
            <div style={{ background: '#020617', minHeight: '100vh', color: 'white', padding: '100px 20px' }}>
                <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <button onClick={() => setActiveQuiz(null)} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', marginBottom: '32px' }}>
                        ← Back to Modules
                    </button>
                    <QuizComponent 
                        module={activeQuiz} 
                        onComplete={(result) => {
                            setCertifications(prev => [...prev, result]);
                            setActiveQuiz(null);
                        }} 
                    />
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: '#020617', minHeight: '100vh', color: '#f8fafc', fontFamily: "'Outfit', sans-serif" }}>
            <Helmet>
                <title>EDWL Academy | Skill-Up Center</title>
            </Helmet>

            <style>{`
                @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
                .academy-hero {
                    background: radial-gradient(circle at top right, #1e3a8a, #020617);
                    padding: 100px 0 80px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                .glass-card {
                    background: rgba(30, 41, 59, 0.7);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                }
                .glass-card:hover {
                    transform: translateY(-8px);
                    border-color: rgba(56, 189, 248, 0.4);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                }
                .progress-glow {
                    height: 8px;
                    background: #1e293b;
                    border-radius: 4px;
                    overflow: hidden;
                    position: relative;
                }
                .progress-glow-inner {
                    height: 100%;
                    background: linear-gradient(90deg, #38bdf8, #8b5cf6);
                    box-shadow: 0 0 15px rgba(56, 189, 248, 0.5);
                    transition: width 1s ease-in-out;
                }
            `}</style>

            <header className="academy-hero">
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '8px 20px', borderRadius: '30px', marginBottom: '24px', fontSize: '0.9rem', fontWeight: '800' }}>
                        <GraduationCap size={18} /> SKILL-UP ACADEMY
                    </div>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: '900', marginBottom: '16px', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Master Your Craft
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 40px' }}>
                        Earn industry-recognized trust badges and unlock higher salary tiers.
                    </p>

                    <div style={{ maxWidth: '400px', margin: '0 auto' }} className="glass-card">
                        <div style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem', fontWeight: '700' }}>
                                <span style={{ color: '#94a3b8' }}>Course Mastery</span>
                                <span style={{ color: '#38bdf8' }}>{Math.round(progressPercent)}%</span>
                            </div>
                            <div className="progress-glow">
                                <div className="progress-glow-inner" style={{ width: `${progressPercent}%` }} />
                            </div>
                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '32px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '900' }}>{certifications.length}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Badges</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#f59e0b' }}>{totalPoints}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Points</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 20px' }}>
                <div style={{ marginBottom: '40px' }}>
                    <BackButton style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
                    {modules.map((module, i) => (
                        <div key={module.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ 
                                height: '200px', 
                                background: `linear-gradient(135deg, ${module.color || '#1e3a8a'} 0%, #020617 100%)`, 
                                position: 'relative', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                overflow: 'hidden'
                            }}>
                                <div style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
                                    <BookOpen size={200} style={{ transform: 'rotate(-20deg) translate(-20px, -20px)' }} />
                                </div>
                                <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                                    {isCompleted(module.id) ? (
                                        <div style={{ background: '#10b981', color: 'white', padding: '6px 16px', borderRadius: '40px', fontSize: '0.75rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }}>
                                            <Trophy size={14} /> CERTIFIED
                                        </div>
                                    ) : (
                                        <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)', color: 'white', padding: '6px 16px', borderRadius: '40px', fontSize: '0.75rem', fontWeight: '900', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            {module.points} PTS
                                        </div>
                                    )}
                                </div>
                                <Sparkles size={60} color="white" style={{ opacity: 0.4, animation: 'float 4s infinite ease-in-out' }} />
                                <div style={{ position: 'absolute', bottom: '20px', left: '24px' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: '800', opacity: 0.6, letterSpacing: '1px', textTransform: 'uppercase', color: 'white' }}>{module.category}</div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white', margin: 0 }}>{module.title}</h3>
                                </div>
                            </div>
                            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '32px' }}>{module.description}</p>
                                <div style={{ marginTop: 'auto' }}>
                                    {isCompleted(module.id) ? (
                                        <button disabled style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                            <ShieldCheck size={20} /> Course Completed
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => setActiveQuiz(module)}
                                            style={{ width: '100%', padding: '16px', borderRadius: '16px', background: '#38bdf8', color: '#0f172a', border: 'none', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', transition: 'transform 0.2s' }}
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            <Play size={20} fill="#0f172a" /> Start Learning <ArrowRight size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AcademyDashboard;

