import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
    Users, 
    Briefcase, 
    ArrowRight, 
    Shield, 
    Zap, 
    Award, 
    Globe, 
    Heart, 
    Search,
    ShieldCheck,
    CheckCircle2,
    Home as HomeIcon,
    UserPlus,
    Megaphone
} from 'lucide-react';
import authService from '../services/authService';
import ShareEdwlButton from '../components/ShareEdwlButton';
import Seo, { BRAND_AM, BRAND_EN } from '../components/Seo';
import TrustIntelligencePanel from '../components/TrustIntelligencePanel';

const TRUST_SIGNALS = [
    { actionKey: 'profile_review_enabled', detailKey: 'review_before_public_listing', icon: ShieldCheck },
    { actionKey: 'free_browsing_enabled', detailKey: 'free_browsing_enabled_desc', icon: Search },
    { actionKey: 'subscription_chat_guard', detailKey: 'subscription_chat_guard_desc', icon: Shield },
    { actionKey: 'configurable_plans_enabled', detailKey: 'configurable_plans_enabled_desc', icon: Briefcase },
];

const GOVERNANCE_PROMISES = [
    { titleKey: 'governance_profile_review_title', descKey: 'governance_profile_review_desc', icon: ShieldCheck },
    { titleKey: 'governance_platform_role_title', descKey: 'governance_platform_role_desc', icon: CheckCircle2 },
    { titleKey: 'governance_private_by_default_title', descKey: 'governance_private_by_default_desc', icon: Users },
];

const SHARE_PROMPTS = [
    { titleKey: 'share_household_title', descKey: 'share_household_desc', icon: HomeIcon },
    { titleKey: 'share_worker_title', descKey: 'share_worker_desc', icon: UserPlus },
    { titleKey: 'share_trust_title', descKey: 'share_trust_desc', icon: Megaphone },
];

const HERO_STEPS = [
    { icon: Search, titleKey: 'hero_browse_step_title', descKey: 'hero_browse_step_desc' },
    { icon: ShieldCheck, titleKey: 'hero_review_step_title', descKey: 'hero_review_step_desc' },
    { icon: CheckCircle2, titleKey: 'hero_signup_step_title', descKey: 'hero_signup_step_desc' },
];

const HeroActionShowcase = ({ onBrowse, onSignup }) => {
    const { t } = useTranslation();

    return (
        <div className="hero-action-showcase reveal delay-1">
            <div className="hero-action-panel">
                <div className="hero-action-topline">
                    <span>{t('hero_action_label')}</span>
                    <Zap size={16} />
                </div>
                <h3>{t('hero_action_title')}</h3>
                <p>{t('hero_action_desc')}</p>
                <div className="hero-action-buttons">
                    <button type="button" className="btn-primary" onClick={onBrowse}>
                        <Search size={18} /> {t('browse_edwl')}
                    </button>
                    <button type="button" className="btn-login" onClick={onSignup}>
                        {t('sign_up')} <ArrowRight size={18} />
                    </button>
                </div>
                <div className="hero-path-list">
                    {HERO_STEPS.map(({ icon: Icon, titleKey, descKey }) => (
                        <div key={titleKey} className="hero-path-row">
                            <div className="hero-path-icon">
                                <Icon size={18} />
                            </div>
                            <div>
                                <strong>{t(titleKey)}</strong>
                                <span>{t(descKey)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="hero-action-ribbon">
                <span>{t('hero_no_login_note')}</span>
                <ArrowRight size={16} />
            </div>
        </div>
    );
};

const TrustSignal = () => {
    const [idx, setIdx] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => setIdx(i => (i + 1) % TRUST_SIGNALS.length), 3200);
        return () => clearInterval(timer);
    }, []);
    const { t } = useTranslation();
    const item = TRUST_SIGNALS[idx];
    const Icon = item.icon;
    return (
        <div className="glass hero-trust-signal" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            borderRadius: '16px', 
            padding: '10px 20px', 
            boxShadow: 'var(--shadow)', 
            maxWidth: '420px', 
            border: '1px solid rgba(255,255,255,0.4)',
            transition: 'var(--transition)'
        }}>
            <Icon size={22} color="var(--primary)" />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div className="hero-trust-title">{t(item.actionKey)}</div>
                <div className="hero-trust-detail">{t(item.detailKey)}</div>
            </div>
            <div className="ai-pulse" style={{ color: 'transparent', width: '8px' }} />
        </div>
    );
};

const SkillExplorer = () => {
    const { t } = useTranslation();
    const [selectedSkill, setSelectedSkill] = useState('childcare');
    
    const SKILLS_DATA = {
        childcare: { labelKey: 'skill_childcare', statusKey: 'home_skill_admin_review', verificationKey: 'home_skill_id_references', categoryKey: 'home_skill_core_service', icon: 'CC', color: '#008080' },
        traditionalCooking: { labelKey: 'skill_traditional_cooking', statusKey: 'home_skill_skill_notes', verificationKey: 'home_skill_experience_details', categoryKey: 'home_skill_household_fit', icon: 'TC', color: '#ff5722' },
        eldercare: { labelKey: 'skill_eldercare', statusKey: 'home_skill_care_context', verificationKey: 'home_skill_references_first', categoryKey: 'home_skill_sensitive_care', icon: 'EC', color: '#673ab7' },
        generalCleaning: { labelKey: 'skill_general_cleaning', statusKey: 'home_skill_scope_clarity', verificationKey: 'home_skill_task_history', categoryKey: 'home_skill_daily_support', icon: 'GC', color: '#ff9800' },
        homeTutoring: { labelKey: 'skill_home_tutoring', statusKey: 'home_skill_learning_fit', verificationKey: 'home_skill_education_notes', categoryKey: 'home_skill_subject_details', icon: 'HT', color: '#00bcd4' },
    };

    const current = SKILLS_DATA[selectedSkill];

    return (
        <div className="glass" style={{ 
            borderRadius: '24px', 
            padding: '40px', 
            border: '1px solid rgba(255,255,255,0.4)', 
            boxShadow: 'var(--shadow-lg)', 
            maxWidth: '900px', 
            margin: '0 auto',
            backdropFilter: 'blur(20px)'
        }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '2px', background: 'var(--primary-glow)', padding: '6px 16px', borderRadius: '30px' }}>
                    {t('startup_talent_governance')}
                </span>
                <h3 style={{ fontSize: '1.8rem', color: 'var(--navy)', marginTop: '16px', marginBottom: '12px', fontWeight: '800' }}>
                    {t('browse_skills_with_review_controls')}
                </h3>
                <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>
                    {t('skill_explorer_desc')}
                </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
                {Object.entries(SKILLS_DATA).map(([skillId, data]) => {
                    const isSelected = selectedSkill === skillId;
                    return (
                        <button 
                            key={skillId}
                            onClick={() => setSelectedSkill(skillId)}
                            style={{ 
                                padding: '10px 20px', 
                                borderRadius: '30px', 
                                background: isSelected ? data.color : 'white', 
                                color: isSelected ? 'white' : 'var(--text)', 
                                border: '1px solid rgba(0,0,0,0.05)', 
                                fontSize: '0.9rem',
                                fontWeight: '700',
                                boxShadow: isSelected ? `0 8px 16px -4px ${data.color}60` : 'var(--shadow-sm)',
                                transform: isSelected ? 'translateY(-2px)' : 'none',
                                transition: 'var(--transition-fast)'
                            }}
                        >
                            <span style={{ marginRight: '6px' }}>{data.icon}</span> {t(data.labelKey)}
                        </button>
                    );
                })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', animation: 'fadeIn 0.5s ease-out' }} key={selectedSkill}>
                <div className="glass" style={{ padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.6)', textAlign: 'center', background: 'rgba(255, 255, 255, 0.4)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{t('profile_status')}</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: '900', color: current.color, minHeight: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t(current.statusKey)}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>{t('profile_status_note')}</div>
                </div>
                <div className="glass" style={{ padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.6)', textAlign: 'center', background: 'rgba(255, 255, 255, 0.4)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{t('verification_focus')}</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#ff9800', minHeight: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {t(current.verificationKey)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>{t('verification_focus_note')}</div>
                </div>
                <div className="glass" style={{ padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.6)', textAlign: 'center', background: 'rgba(255, 255, 255, 0.4)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{t('category_handling')}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--navy)', minHeight: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t(current.categoryKey)}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>{t('category_handling_note')}</div>
                </div>
            </div>
        </div>
    );
};

const Home = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [user, setUser] = useState(authService.getCurrentUser());

    useEffect(() => { setUser(authService.getCurrentUser()); }, []);

    const handleBrowseEdwl = () => {
        navigate('/browse');
    };

    return (
        <div className="home-page app">
            <Seo
                title={`${BRAND_AM} - ${BRAND_EN}`}
                description={`${t('home_seo_desc')} ${BRAND_AM} - ${BRAND_EN}.`}
                path="/"
                structuredData={{
                    '@context': 'https://schema.org',
                    '@type': 'WebSite',
                    '@id': 'https://ethiodomesticworkers.web.app/#website',
                    url: 'https://ethiodomesticworkers.web.app/',
                    name: `${BRAND_AM} - ${BRAND_EN}`,
                    alternateName: ['EDWL', BRAND_EN, BRAND_AM, 'ኢትዮ የቤት ውስጥ ሠራተኞች አገናኝ'],
                    inLanguage: ['en', 'am']
                }}
            />

            {/* HERO SECTION */}
            <header className="hero-section">
                <div className="container hero-shell">
                    <div className="reveal hero-copy">
                        <div className="hero-kicker">
                            <span className="ai-pulse hero-kicker-badge">{t('startup_pilot')}</span>
                            <span className="hero-kicker-text">{t('active_workers_count')}</span>
                        </div>
                        <h1 className="hero-title">
                            <span className="gradient-text">{t('welcome')}</span>
                        </h1>
                        <h2 className="hero-subtitle">{t('motto')}</h2>
                        <p className="hero-description">{t('hero_title')}</p>

                        <div className="reveal delay-1" style={{ marginBottom: '36px' }}>
                            <TrustSignal />
                        </div>

                        <div className="reveal delay-2 hero-primary-actions">
                            {user ? (
                                <button className="btn-primary hero-cta-button"
                                    onClick={() => navigate(user.role === 'JOB_SEEKER' ? '/dashboard/seeker' : user.role === 'EMPLOYER' ? '/dashboard/employer' : '/admin')}>
                                    {t('go_to_dashboard')} <ArrowRight size={20} />
                                </button>
                            ) : (
                                <>
                                    <button className="btn-primary hero-cta-button" onClick={handleBrowseEdwl}>
                                        <Search size={18} /> {t('browse_edwl')}
                                    </button>
                                    <button className="btn-login hero-cta-button hero-secondary-cta" onClick={() => navigate('/register')}>
                                        {t('sign_up')} <ArrowRight size={18} />
                                    </button>
                                </>
                            )}
                        </div>
                        
                        <div className="reveal delay-3 hero-trust-tags">
                            {[{ icon: ShieldCheck, textKey: 'admin_reviewed' }, { icon: Award, textKey: 'profile_privacy' }, { icon: Globe, textKey: 'clear_platform_role' }].map(({ icon: Icon, textKey }) => (
                                <div key={textKey} className="hero-trust-tag">
                                    <Icon size={16} color="var(--primary)" /> {t(textKey)}
                                </div>
                            ))}
                        </div>
                    </div>

                    <HeroActionShowcase
                        onBrowse={handleBrowseEdwl}
                        onSignup={() => navigate('/register')}
                    />
                </div>
            </header>

            {/* TRUST STATS SECTION */}
            <section id="browse-edwl" style={{ padding: '60px 0', background: 'white', borderTop: '1px solid rgba(0, 128, 128, 0.08)', borderBottom: '1px solid rgba(0, 128, 128, 0.08)', scrollMarginTop: '90px' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '30px' }}>
                    {[
                        { valKey: 'admin_review', labelKey: 'before_public_listing', icon: Users, color: 'var(--primary)' },
                        { valKey: 'free_browse', labelKey: 'no_login_required', icon: Briefcase, color: 'var(--accent)' },
                        { valKey: 'member_chat', labelKey: 'subscription_required', icon: Heart, color: '#e91e63' },
                        { valKey: 'owner_control', labelKey: 'configurable_pricing', icon: Shield, color: 'var(--primary-light)' },
                    ].map(s => (
                        <div key={s.labelKey} style={{ textAlign: 'center', flex: 1, minWidth: '150px' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                                <s.icon size={26} color={s.color} />
                            </div>
                            <div style={{ fontSize: '1.55rem', fontWeight: '900', color: 'var(--navy)', marginBottom: '2px' }}>{t(s.valKey)}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px' }}>{t(s.labelKey)}</div>
                        </div>
                    ))}
                </div>
            </section>

            <TrustIntelligencePanel />

            {/* INTERACTIVE SKILL MATCHER SECTION */}
            <section style={{ padding: '100px 0 60px' }}>
                <div className="container">
                    <SkillExplorer />
                </div>
            </section>

            {/* CORE FEATURES SECTION */}
            <section style={{ padding: '100px 0', position: 'relative' }}>
                <div className="container" style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: '2px' }}>{t('designed_for_high_trust')}</span>
                    <h2 style={{ marginTop: '12px', marginBottom: '20px' }}>{t('why_thousands_trust')}</h2>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-light)', maxWidth: '600px', margin: '0 auto' }}>{t('platform_tagline')}</p>
                </div>
                
                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '30px' }}>
                    {[
                        { icon: Shield, titleKey: 'zero_trust_escrow', descKey: 'zero_trust_escrow_desc', color: 'var(--primary)' },
                        { icon: Zap, titleKey: 'ai_powered_matching', descKey: 'ai_powered_matching_desc', color: 'var(--accent)' },
                        { icon: Award, titleKey: 'edwl_academy', descKey: 'edwl_academy_desc', color: 'var(--primary-light)' },
                        { icon: Globe, titleKey: 'cross_border_hiring', descKey: 'cross_border_hiring_desc', color: 'var(--navy)' },
                    ].map(f => (
                        <div key={f.titleKey} className="card" style={{ padding: '30px', borderRadius: '20px' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                                <f.icon size={26} color={f.color} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: 'var(--navy)' }}>{t(f.titleKey)}</h3>
                            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', lineHeight: 1.6 }}>{t(f.descKey)}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* STARTUP GOVERNANCE */}
            <section style={{ padding: '100px 0', background: 'var(--navy)', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <div className="container" style={{ textAlign: 'center', marginBottom: '50px', position: 'relative', zIndex: 1 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary-light)', letterSpacing: '2px' }}>
                        {t('startup_governance_label')}
                    </span>
                    <h2 style={{ color: 'white', marginTop: '12px', marginBottom: '16px' }}>{t('startup_governance_title')}</h2>
                    <p style={{ color: '#cbd5e1', fontSize: '1.05rem', maxWidth: '680px', margin: '0 auto 22px', lineHeight: 1.7 }}>{t('startup_governance_desc')}</p>
                    <div style={{ height: '4px', width: '60px', background: 'var(--accent)', margin: '0 auto', borderRadius: '2px' }}></div>
                </div>
                
                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', position: 'relative', zIndex: 1 }}>
                    {GOVERNANCE_PROMISES.map(({ titleKey, descKey, icon: Icon }) => (
                        <div key={titleKey} className="glass" style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            padding: '32px',
                            borderRadius: '16px',
                            minHeight: '220px'
                        }}>
                            <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '22px' }}>
                                <Icon size={24} color="var(--primary-light)" />
                            </div>
                            <h3 style={{ color: 'white', fontSize: '1.15rem', marginBottom: '12px' }}>{t(titleKey)}</h3>
                            <p style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '0.95rem' }}>{t(descKey)}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* SHARE GROWTH PANEL */}
            <section className="share-growth-section">
                <div className="container share-growth-shell">
                    <div className="share-growth-copy">
                        <span className="section-eyebrow">{t('share_growth_label')}</span>
                        <h2>{t('share_growth_title')}</h2>
                        <p>{t('share_growth_desc')}</p>
                        <div className="share-growth-actions">
                            <ShareEdwlButton />
                            <button type="button" className="btn-login" onClick={handleBrowseEdwl}>
                                <Search size={18} /> {t('browse_edwl')}
                            </button>
                        </div>
                    </div>

                    <div className="share-growth-grid">
                        {SHARE_PROMPTS.map(({ titleKey, descKey, icon: Icon }) => (
                            <div key={titleKey} className="share-growth-card">
                                <div className="share-growth-icon">
                                    <Icon size={22} />
                                </div>
                                <div>
                                    <h3>{t(titleKey)}</h3>
                                    <p>{t(descKey)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FINAL CALL TO ACTION */}
            {!user && (
                <section style={{ padding: '120px 0', position: 'relative', overflow: 'hidden' }}>
                    <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                        <h2 style={{ fontSize: '3rem', marginBottom: '20px', color: 'var(--navy)' }}>{t('startup_pilot_cta_title')}</h2>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-light)', maxWidth: '580px', margin: '0 auto 40px', lineHeight: 1.7 }}>
                            {t('startup_pilot_cta_desc')}
                        </p>
                        <button className="btn-primary" style={{ padding: '18px 56px', fontSize: '1.1rem', borderRadius: '14px', boxShadow: '0 20px 40px -10px hsla(182, 100%, 25%, 0.3)' }} onClick={() => navigate('/register')}>
                            {t('create_free_account')} <ArrowRight size={22} />
                        </button>
                    </div>
                </section>
            )}
        </div>
    );
};

export default Home;
