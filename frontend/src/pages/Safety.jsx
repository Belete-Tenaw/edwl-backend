import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, AlertTriangle, Lock, Phone, UserCheck, FileCheck, CheckCircle, HelpCircle, Eye, Handshake, ShieldCheck } from 'lucide-react';
import BackButton from '../components/BackButton';
import Seo, { BRAND_AM, BRAND_EN } from '../components/Seo';

const getSafetyTips = (t) => [
    {
        icon: UserCheck, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)',
        title: t('safety_tip_1_title'),
        desc: t('safety_tip_1_desc')
    },
    {
        icon: FileCheck, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)',
        title: t('safety_tip_2_title'),
        desc: t('safety_tip_2_desc')
    },
    {
        icon: Handshake, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)',
        title: t('safety_tip_3_title'),
        desc: t('safety_tip_3_desc')
    },
    {
        icon: Eye, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)',
        title: t('safety_tip_4_title'),
        desc: t('safety_tip_4_desc')
    }
];

const Safety = () => {
    const { t } = useTranslation();
    const safetyTips = getSafetyTips(t);

    return (
        <div style={{ background: '#020617', minHeight: '100vh', color: '#f8fafc', fontFamily: "'Outfit', sans-serif" }}>
            <Seo
                title={`${t('safety_page_title')} - ${BRAND_EN}`}
                description={`${t('safety_page_desc')} ${BRAND_AM}.`}
                path="/safety"
            />

            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                    100% { transform: translateY(0px) rotate(0deg); }
                }
                @keyframes pulse-glow {
                    0% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.4); }
                    70% { box-shadow: 0 0 0 20px rgba(56, 189, 248, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0); }
                }
                @keyframes slideIn { 
                    from { opacity:0; transform:translateY(30px); filter: blur(10px); } 
                    to { opacity:1; transform:translateY(0); filter: blur(0); } 
                }
                .glass-card {
                    background: rgba(30, 41, 59, 0.7);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .glass-card:hover {
                    transform: translateY(-8px) scale(1.02);
                    border-color: rgba(56, 189, 248, 0.4);
                    background: rgba(30, 41, 59, 0.9);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
                }
                .safety-hero { 
                    background: radial-gradient(circle at top right, #1e3a8a, #020617), radial-gradient(circle at bottom left, #1e1b4b, #020617);
                    padding: 120px 0 100px; 
                    position: relative; 
                    overflow: hidden; 
                }
                .bg-blob {
                    position: absolute;
                    width: 500px;
                    height: 500px;
                    background: linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(139, 92, 246, 0.1));
                    filter: blur(80px);
                    border-radius: 50%;
                    z-index: 0;
                    animation: float 10s infinite ease-in-out;
                }
            `}</style>

            {/* HERO */}
            <header className="safety-hero">
                <div className="bg-blob" style={{ top: '-100px', right: '-100px' }} />
                <div className="bg-blob" style={{ bottom: '-100px', left: '-100px', animationDelay: '-5s' }} />
                
                <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        background: 'rgba(56, 189, 248, 0.1)', 
                        border: '1px solid rgba(56, 189, 248, 0.3)', 
                        borderRadius: '30px', 
                        padding: '8px 20px', 
                        marginBottom: '32px', 
                        fontSize: '0.9rem', 
                        fontWeight: '700',
                        color: '#38bdf8',
                        animation: 'pulse-glow 2s infinite'
                    }}>
                        <ShieldCheck size={18} /> {t('security_dna')}
                    </div>
                    <h1 style={{ 
                        fontSize: 'clamp(2.5rem, 6vw, 4rem)', 
                        fontWeight: '900', 
                        marginBottom: '20px',
                        background: 'linear-gradient(to right, #fff, #94a3b8)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.02em'
                    }}>
                        {t('safety_hero_title')}
                    </h1>
                    <p style={{ 
                        color: '#94a3b8', 
                        maxWidth: '650px', 
                        margin: '0 auto', 
                        lineHeight: 1.8, 
                        fontSize: '1.2rem',
                        fontWeight: '400'
                    }}>
                        {t('safety_hero_subtitle')}
                    </p>
                </div>
            </header>

            {/* CONTENT */}
            <div className="container" style={{ maxWidth: '1100px', margin: '-50px auto 0', padding: '0 20px 100px', position: 'relative', zIndex: 2 }}>
                <div style={{ marginBottom: '40px' }}>
                    <BackButton style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>

                {/* Important Notice */}
                <div className="glass-card" style={{ 
                    padding: '32px', 
                    marginBottom: '60px', 
                    display: 'flex', 
                    gap: '24px', 
                    alignItems: 'center', 
                    animation: 'slideIn 0.6s ease-out',
                    borderLeft: '4px solid #f59e0b'
                }}>
                    <div style={{ 
                        background: 'rgba(245, 158, 11, 0.2)', 
                        width: '64px', 
                        height: '64px', 
                        borderRadius: '20px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        flexShrink: 0 
                    }}>
                        <AlertTriangle size={32} color="#f59e0b" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fbbf24', marginBottom: '8px' }}>{t('important_notice')}</h2>
                        <p style={{ color: '#94a3b8', lineHeight: 1.7, margin: 0, fontSize: '1rem' }}>
                            {t('safety_notice_desc')}
                        </p>
                    </div>
                </div>

                {/* Safety Tips Grid */}
                <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'white', marginBottom: '40px', textAlign: 'center' }}>{t('hiring_safely')}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '80px' }}>
                    {safetyTips.map((tip, i) => (
                        <div key={i} className="glass-card" style={{ padding: '32px', animation: `slideIn 0.6s ease-out ${i * 0.15}s both` }}>
                            <div style={{ width: '56px', height: '56px', background: tip.bg, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                                <tip.icon size={28} color={tip.color} />
                            </div>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'white', marginBottom: '12px' }}>{tip.title}</h3>
                            <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.7, margin: 0 }}>{tip.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Data Privacy Section */}
                <div className="glass-card" style={{ padding: '60px 40px', marginBottom: '80px', textAlign: 'center', background: 'radial-gradient(circle at center, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))' }}>
                    <div style={{ 
                        background: 'rgba(56, 189, 248, 0.1)', 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        margin: '0 auto 32px',
                        border: '1px solid rgba(56, 189, 248, 0.2)'
                    }}>
                        <Lock size={40} color="#38bdf8" />
                    </div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', marginBottom: '20px' }}>{t('privacy_protected_title')}</h2>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.8, maxWidth: '700px', margin: '0 auto 40px' }}>
                        {t('privacy_protected_desc')}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        {['end_to_end_encryption', 'no_data_selling'].map((key) => (
                            <div key={key} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px', 
                                background: 'rgba(255,255,255,0.05)', 
                                padding: '12px 24px', 
                                borderRadius: '40px', 
                                fontSize: '0.9rem', 
                                fontWeight: '700', 
                                color: '#e2e8f0',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <CheckCircle size={18} color="#10b981" /> {t(key)}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reporting Section */}
                <div className="glass-card" style={{ 
                    padding: '80px 40px', 
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)', 
                    color: 'white', 
                    textAlign: 'center',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    <div style={{ position: 'absolute', top: '-50px', right: '-50px', opacity: 0.1 }}>
                        <Shield size={300} color="white" />
                    </div>
                    
                    <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        background: 'rgba(255,255,255,0.1)', 
                        padding: '12px 30px', 
                        borderRadius: '40px', 
                        marginBottom: '32px',
                        backdropFilter: 'blur(4px)'
                    }}>
                        <HelpCircle size={22} color="#38bdf8" />
                        <span style={{ fontWeight: '800', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.85rem' }}>{t('reporting_help')}</span>
                    </div>
                    <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '24px', letterSpacing: '-0.03em' }}>{t('reporting_title')}</h2>
                    <p style={{ color: '#cbd5e1', fontSize: '1.2rem', lineHeight: 1.8, maxWidth: '650px', margin: '0 auto 48px' }}>
                        {t('reporting_desc')}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '20px', 
                            background: 'rgba(255,255,255,0.1)', 
                            border: '1px solid rgba(255,255,255,0.2)', 
                            padding: '24px 48px', 
                            borderRadius: '24px',
                            backdropFilter: 'blur(8px)',
                            transition: 'all 0.3s'
                        }} className="contact-pill">
                            <Phone size={32} color="#38bdf8" />
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>{t('safety_hotline')}</div>
                                <div style={{ fontWeight: '900', fontSize: '1.6rem', color: 'white' }}>+251 943 194 099</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Safety;
