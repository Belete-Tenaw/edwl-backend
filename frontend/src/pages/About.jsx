import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Seo, { BRAND_AM, BRAND_EN } from '../components/Seo';
import { Heart, Shield, Globe, TrendingUp } from 'lucide-react';

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

const About = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('mission');

    const team = getTeam(t);
    const milestones = getMilestones(t);
    const values = getValues(t);
    const tabs = [
        { id: 'mission', label: t('mission_tab') },
        { id: 'story', label: t('story_tab') },
        { id: 'team', label: t('team_tab') }
    ];

    return (
        <div style={{ background: '#020617', minHeight: '100vh', color: '#f8fafc', fontFamily: "'Outfit', sans-serif" }}>
            <Seo
                title={`${t('about_meta_title_current')} - ${BRAND_EN}`}
                description={`${t('about_meta_desc_current')} ${BRAND_AM} - ${BRAND_EN}.`}
                path="/about"
            />

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
                        <Globe size={16} /> {t('about_badge_current')}
                    </div>
                    <h1 style={{ fontSize: '4.5rem', fontWeight: '950', marginBottom: '24px', letterSpacing: '-2px', lineHeight: 1 }}>
                        {t('about_hero_title_line1_current')}<br />
                        <span style={{ color: '#38bdf8' }}>{t('about_hero_title_line2_current')}</span>
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '700px', margin: '0 auto 48px', lineHeight: 1.7 }}>
                        {t('about_hero_desc_current')}
                    </p>
                </div>
            </header>

            <section style={{ marginBottom: '80px' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '60px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}>
                                {tab.label}
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
                    {activeTab === 'team' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
                            {team.map((member, i) => (
                                <div key={i} className="glass-card" style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>{member.emoji}</div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'white', marginBottom: '4px' }}>{member.name}</h3>
                                    <div style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px' }}>{member.role}</div>
                                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>{member.desc}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* BOTTOM CTA */}
            <section style={{ background: 'rgba(255,255,255,0.02)', padding: '100px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '950', color: 'white', marginBottom: '24px' }}>{t('ready_start_title')}</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '48px', maxWidth: '500px', margin: '0 auto 48px', fontSize: '1.1rem' }}>{t('ready_start_desc')}</p>
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => navigate('/register')} style={{ padding: '18px 48px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '50px', fontWeight: '900', cursor: 'pointer', fontSize: '1.1rem' }}>
                            {t('create_account')}
                        </button>
                        <button onClick={() => navigate('/contact')} style={{ padding: '18px 48px', background: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.1)', borderRadius: '50px', fontWeight: '900', cursor: 'pointer', fontSize: '1.1rem' }}>
                            {t('talk_to_edwl')}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};


export default About;
