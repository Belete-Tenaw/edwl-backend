import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Lock, Eye, Database, UserCheck, Globe, ChevronDown, ChevronUp, Cpu, Landmark, Fingerprint } from 'lucide-react';
import BackButton from '../components/BackButton';
import Seo, { BRAND_AM, BRAND_EN } from '../components/Seo';

const PrivacyPolicy = () => {
    const { t } = useTranslation();
    const [openIdx, setOpenIdx] = useState(0);

    const SECTIONS = [
        { icon: Database, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.1)', title: t('privacy_1_title'), content: t('privacy_1_content') },
        { icon: Cpu, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', title: 'AI & Decision Precision', content: 'We utilize heuristic AI to calculate compatibility scores. This data is used solely to optimize matching and is never shared with third-party advertisers.' },
        { icon: Fingerprint, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', title: 'Biometric & Identity Trust', content: 'Our integration with Fayda ID ensures zero-knowledge identity verification. We do not store raw biometric data; only cryptographic proofs of verification.' },
        { icon: Landmark, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', title: 'Zero-Trust Financial Data', content: 'Payment data for Escrow is processed via encrypted gateways (Chapa/Stripe). EDWL never stores your CVV or sensitive banking credentials.' },
        { icon: Shield, color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.1)', title: t('privacy_3_title'), content: t('privacy_3_content') },
        { icon: Globe, color: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.1)', title: t('privacy_6_title'), content: t('privacy_6_content') },
    ];

    return (
        <div style={{ background: '#020617', minHeight: '100vh', color: '#f8fafc', fontFamily: "'Outfit', sans-serif" }}>
            <Seo
                title={`Privacy Policy - ${BRAND_EN}`}
                description={`Privacy and data protection information for ${BRAND_EN} (${BRAND_AM}).`}
                path="/privacy-policy"
            />

            <style>{`
                .glass-panel {
                    background: rgba(30, 41, 59, 0.4);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .glass-panel:hover { border-color: rgba(255, 255, 255, 0.2); }
                @keyframes slideIn { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
            `}</style>

            {/* HERO */}
            <header style={{ padding: '100px 0 80px', position: 'relative', textAlign: 'center' }}>
                <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }} />
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '8px 16px', marginBottom: '24px', fontSize: '0.8rem', fontWeight: '800', color: '#38bdf8' }}>
                        <Shield size={16} /> DATA PROTECTION MANDATE 2026
                    </div>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '16px' }}>Guardian of Your Privacy</h1>
                    <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.6 }}>
                        Transparency is the foundation of the EDWL Global Ecosystem. We employ Zero-Trust architecture to safeguard your professional identity.
                    </p>
                </div>
            </header>

            {/* CONTENT */}
            <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px 100px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <BackButton />
                    <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '700' }}>Last Update: May 2026</div>
                </div>

                <div style={{ display: 'grid', gap: '24px', animation: 'slideIn 0.8s ease-out' }}>
                    {SECTIONS.map((section, i) => {
                        const { icon: Icon, color, bg, title, content } = section;
                        const isOpen = openIdx === i;
                        return (
                            <div key={i} className="glass-panel">
                                <button onClick={() => setOpenIdx(isOpen ? -1 : i)}
                                    style={{ width: '100%', padding: '32px', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '24px', cursor: 'pointer', textAlign: 'left' }}>
                                    <div style={{ width: '56px', height: '56px', background: bg, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${color}30` }}>
                                        <Icon size={28} color={color} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: 0, fontWeight: '900', color: 'white', fontSize: '1.2rem' }}>{title}</h3>
                                        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>{isOpen ? 'Detailed Disclosure' : 'Click to expand details'}</p>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '12px' }}>
                                        {isOpen ? <ChevronUp size={20} color="#38bdf8" /> : <ChevronDown size={20} color="#64748b" />}
                                    </div>
                                </button>
                                {isOpen && (
                                    <div style={{ padding: '0 32px 40px 112px', color: '#94a3b8', lineHeight: 1.8, fontSize: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px' }}>
                                        {content}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Secure Contact */}
                <div className="glass-panel" style={{ marginTop: '64px', padding: '48px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.9))', border: '1px solid rgba(56,189,248,0.2)' }}>
                    <Lock size={48} color="#38bdf8" style={{ marginBottom: '24px', filter: 'drop-shadow(0 0 10px rgba(56,189,248,0.4))' }} />
                    <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '16px' }}>Need a Security Audit?</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '32px', fontSize: '1.1rem' }}>Our Data Protection Office is available 24/7 for privacy inquiries.</p>
                    <a href="mailto:privacy@edwl.com"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: '#38bdf8', color: '#0f172a', padding: '16px 40px', borderRadius: '16px', fontWeight: '900', textDecoration: 'none', transition: 'all 0.3s' }}>
                        Contact Privacy Officer
                    </a>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
