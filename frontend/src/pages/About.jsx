import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Target, Heart, Shield, Award, ArrowRight, Globe, Zap, Users, TrendingUp, CheckCircle } from 'lucide-react';

const getTeam = (t) => [
    { name: t('team_tech_name'), role: t('team_tech_role'), emoji: '👨‍💻', desc: t('team_tech_desc') },
    { name: t('team_trust_name'), role: t('team_trust_role'), emoji: '🛡️', desc: t('team_trust_desc') },
    { name: t('team_academy_name'), role: t('team_academy_role'), emoji: '🎓', desc: t('team_academy_desc') },
    { name: t('team_fintech_name'), role: t('team_fintech_role'), emoji: '💳', desc: t('team_fintech_desc') },
];

const getMilestones = (t) => [
    { year: '2023', event: t('milestone_2023') },
    { year: '2024', event: t('milestone_2024') },
    { year: '2025', event: t('milestone_2025') },
    { year: '2026', event: t('milestone_2026') },
];

const getValues = (t) => [
    { icon: Shield, color: '#38bdf8', bg: '#f0fdfa', label: t('value_safety_label'), desc: t('value_safety_desc') },
    { icon: Heart, color: '#f43f5e', bg: '#fff1f2', label: t('value_dignity_label'), desc: t('value_dignity_desc') },
    { icon: Globe, color: '#10b981', bg: '#eff6ff', label: t('value_inclusive_label'), desc: t('value_inclusive_desc') },
    { icon: TrendingUp, color: '#8b5cf6', bg: '#faf5ff', label: t('value_growth_label'), desc: t('value_growth_desc') },
];

const Contact = () => {
    const { t } = useTranslation();

    return (
        <div style={{ background: '#020617', minHeight: '100vh', color: '#f8fafc', fontFamily: "'Outfit', sans-serif" }}>
            <Helmet>
                <title>Contact Concierge | EDWL Global</title>
            </Helmet>

            <style>{`
                .glass-input {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 16px;
                    border-radius: 12px;
                    color: white;
                    outline: none;
                    width: 100%;
                    transition: border-color 0.3s;
                }
                .glass-input:focus { border-color: #38bdf8; }
                .glow-btn {
                    background: #38bdf8;
                    color: #0f172a;
                    padding: 16px;
                    border-radius: 12px;
                    border: none;
                    font-weight: 900;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    transition: all 0.3s;
                }
                .glow-btn:hover { background: #7dd3fc; transform: translateY(-2px); }
            `}</style>

            <header style={{ padding: '100px 0 60px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '950', letterSpacing: '-1px' }}>Global Support Concierge</h1>
                <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>24/7 autonomous assistance for the world-class EDWL ecosystem.</p>
            </header>

            <div className="container" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '100px' }}>
                <div style={{ background: 'rgba(30, 41, 59, 0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '32px', padding: '48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div>
                            <div style={{ color: '#38bdf8', fontWeight: '900', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px' }}>Strategic Hub</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '900' }}>Bole, Addis Ababa, ET</div>
                        </div>
                        <div>
                            <div style={{ color: '#38bdf8', fontWeight: '900', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px' }}>Global Hotline</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '900' }}>+251 943 194 099</div>
                        </div>
                        <div>
                            <div style={{ color: '#38bdf8', fontWeight: '900', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px' }}>Security Desk</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '900' }}>security@edwl.com</div>
                        </div>
                    </div>
                    <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <input className="glass-input" placeholder="Full Name" />
                        <input className="glass-input" placeholder="Organization (Optional)" />
                        <textarea className="glass-input" placeholder="Strategic Inquiry" rows={4}></textarea>
                        <button className="glow-btn">Initialize Connection <ArrowRight size={20} /></button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const About = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('mission');

    const team = getTeam(t);
    const milestones = getMilestones(t);
    const values = getValues(t);

    return (
        <div style={{ background: '#020617', minHeight: '100vh', color: '#f8fafc', fontFamily: "'Outfit', sans-serif" }}>
            <Helmet>
                <title>Our Mission | EDWL Global</title>
                <meta name="description" content="The future of domestic work ecosystem." />
            </Helmet>

            <style>{`
                .glass-card {
                    background: rgba(30, 41, 59, 0.4);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    padding: 40px;
                    transition: all 0.3s;
                }
                .glass-card:hover { border-color: rgba(56, 189, 248, 0.3); transform: translateY(-5px); }
                .tab-btn { padding: 12px 32px; border: none; background: rgba(255,255,255,0.05); color: #94a3b8; cursor: pointer; font-weight: 800; border-radius: 50px; transition: all 0.2s; border: 1px solid rgba(255,255,255,0.1); }
                .tab-btn.active { background: #38bdf8; color: #0f172a; border-color: #38bdf8; box-shadow: 0 0 20px rgba(56, 189, 248, 0.3); }
            `}</style>

            <header style={{ padding: '120px 0 80px', textAlign: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '400px', background: 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '20px', padding: '8px 20px', marginBottom: '32px', fontSize: '0.85rem', fontWeight: '900', color: '#38bdf8' }}>
                        <Globe size={16} /> GLOBAL STANDARDS. ETHIOPIAN HEART.
                    </div>
                    <h1 style={{ fontSize: '4.5rem', fontWeight: '950', marginBottom: '24px', letterSpacing: '-2px', lineHeight: 1 }}>
                        Architecting the Future<br />
                        <span style={{ color: '#38bdf8' }}>of Human Connection.</span>
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '700px', margin: '0 auto 48px', lineHeight: 1.7 }}>
                        EDWL is not just a platform; it is a smart ecosystem engineered to elevate the dignity of domestic work through AI, Fintech, and uncompromising safety.
                    </p>
                </div>
            </header>

            <section style={{ marginBottom: '80px' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '60px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        {['mission', 'story', 'team'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`tab-btn${activeTab === tab ? ' active' : ''}`}>
                                {tab.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section style={{ paddingBottom: '100px' }}>
                <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    {activeTab === 'mission' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
                            {values.map(({ icon: Icon, color, label, desc }) => (
                                <div key={label} className="glass-card">
                                    <div style={{ width: '64px', height: '64px', background: `${color}15`, borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', border: `1px solid ${color}30` }}>
                                        <Icon size={32} color={color} />
                                    </div>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'white', marginBottom: '12px' }}>{label}</h3>
                                    <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.75 }}>{desc}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'story' && (
                        <div style={{ display: 'grid', gap: '24px' }}>
                            {milestones.map((m, i) => (
                                <div key={i} className="glass-card" style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                                    <div style={{ fontSize: '2.5rem', fontWeight: '950', color: '#38bdf8', opacity: 0.5, width: '120px' }}>{m.year}</div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontWeight: '900', fontSize: '1.2rem', color: 'white' }}>{m.event}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    )}
                </div>
            </section>

            {/* BOTTOM CTA */}
            <section style={{ background: 'rgba(255,255,255,0.02)', padding: '100px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '950', color: 'white', marginBottom: '24px' }}>Ready to elevate your ecosystem?</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '48px', maxWidth: '500px', margin: '0 auto 48px', fontSize: '1.1rem' }}>Join the global movement of high-trust domestic work.</p>
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => navigate('/register')} style={{ padding: '18px 48px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '50px', fontWeight: '900', cursor: 'pointer', fontSize: '1.1rem' }}>
                            Initialize Membership
                        </button>
                        <button onClick={() => navigate('/contact')} style={{ padding: '18px 48px', background: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.1)', borderRadius: '50px', fontWeight: '900', cursor: 'pointer', fontSize: '1.1rem' }}>
                            Talk to Concierge
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};


export default About;
