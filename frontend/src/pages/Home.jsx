import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Briefcase, ArrowRight, LogIn, LayoutDashboard, Shield, Star, Zap, Award, Globe, Heart, Activity } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import authService from '../services/authService';

const LIVE_FEED = [
    { city: 'Addis Ababa', actionKey: 'employer_hired_nanny', agoKey: 'min_ago', n: 2, icon: '🏠' },
    { city: 'Dire Dawa', actionKey: 'new_platinum_worker', agoKey: 'min_ago', n: 4, icon: '⭐' },
    { city: 'Bahir Dar', actionKey: 'escrow_released', amount: 4500, agoKey: 'min_ago', n: 7, icon: '💳' },
    { city: 'Hawassa', actionKey: 'worker_earned_badge', agoKey: 'min_ago', n: 10, icon: '🎓' },
    { city: 'Mekelle', actionKey: 'match_score_hired', score: 97, agoKey: 'min_ago', n: 12, icon: '🎯' },
    { city: 'Addis Ababa', actionKey: 'background_verified', agoKey: 'min_ago', n: 15, icon: '✅' },
];

const TESTIMONIALS = [
    { name: 'Meron T.', roleKey: 'verified_nanny', textKey: 'testimonial_meron', stars: 5, avatar: '👩‍💼' },
    { name: 'Tigist A.', roleKey: 'platinum_worker', textKey: 'testimonial_tigist', stars: 5, avatar: '👩' },
    { name: 'Dawit M.', roleKey: 'diaspora_employer', textKey: 'testimonial_dawit', stars: 5, avatar: '👨‍💻' },
];

const MatchSimulator = ({ onUnlock }) => {
    const { t } = useTranslation();
    const [salary, setSalary] = useState(3500);
    const [experience, setExperience] = useState(3);
    const [simulating, setSimulating] = useState(false);
    const [matched, setMatched] = useState(false);

    const handleSimulate = () => {
        setSimulating(true);
        setTimeout(() => { setSimulating(false); setMatched(true); }, 1800);
    };

    const matchScore = Math.min(98, Math.round(72 + (experience * 2) + (salary > 5000 ? 5 : 0)));

    return (
        <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '32px', width: '400px', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-xl)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={22} color="white" fill="white" />
                </div>
                <div>
                    <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--navy)' }}>{t('ai_match_simulator')}</div>
                    <div className="ai-pulse" style={{ fontSize: '0.65rem' }}>Processing Live Data</div>
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text)', marginBottom: '10px' }}>
                    <span>{t('expected_monthly_salary')}</span>
                    <span style={{ color: 'var(--primary)', fontWeight: '800' }}>{salary.toLocaleString()} ETB</span>
                </div>
                <input type="range" min="1500" max="12000" step="100" value={salary}
                    onChange={e => setSalary(+e.target.value)}
                    style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer', height: '6px', borderRadius: '3px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    <span>1,500 ETB</span><span>12,000 ETB</span>
                </div>
            </div>

            <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text)', marginBottom: '10px' }}>
                    <span>{t('min_experience')}</span>
                    <span style={{ color: 'var(--primary)', fontWeight: '800' }}>{experience}+ {t('years')}</span>
                </div>
                <input type="range" min="0" max="10" step="1" value={experience}
                    onChange={e => setExperience(+e.target.value)}
                    style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer', height: '6px', borderRadius: '3px' }} />
            </div>

            {!matched ? (
                <button onClick={handleSimulate} disabled={simulating} className="btn-primary"
                    style={{ width: '100%', padding: '16px' }}>
                    {simulating ? (
                        <><Activity size={18} className="spin" /> {t('scanning_profiles')}</>
                    ) : (
                        <><Zap size={18} /> {t('find_perfect_match')}</>
                    )}
                </button>
            ) : (
                <div style={{ animation: 'fadeInUp 0.5s var(--transition)' }}>
                    <div className="glass" style={{ background: 'var(--primary-glow)', borderRadius: '16px', padding: '20px', marginBottom: '16px', textAlign: 'center' }}>
                        <div className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '4px' }}>{matchScore}%</div>
                        <div style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.9rem' }}>🎯 {t('match_score')} — 12 {t('profiles_found')}</div>
                    </div>
                    <button onClick={onUnlock} className="btn-primary"
                        style={{ width: '100%', padding: '16px' }}>
                        Unlock Matches — Free <ArrowRight size={18} />
                    </button>
                </div>
            )}
            
            <style>{`
                .spin { animation: rotate 2s linear infinite; }
                @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

const LiveFeed = () => {
    const [idx, setIdx] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => setIdx(i => (i + 1) % LIVE_FEED.length), 3500);
        return () => clearInterval(timer);
    }, []);
    const { t } = useTranslation();
    const item = LIVE_FEED[idx];
    return (
        <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '16px', padding: '12px 20px', boxShadow: 'var(--shadow)', maxWidth: '450px', border: '1px solid var(--glass-border)' }}>
            <span style={{ fontSize: '1.6rem' }}>{item.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t(item.actionKey, { amount: item.amount, score: item.score })}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: '500' }}>{item.city} · {t(item.agoKey, { n: item.n })}</div>
            </div>
            <div className="ai-pulse" style={{ color: 'transparent', width: '10px' }} />
        </div>
    );
};

const Home = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [user, setUser] = useState(authService.getCurrentUser());
    const [activeTesti, setActiveTesti] = useState(0);

    useEffect(() => { setUser(authService.getCurrentUser()); }, []);

    useEffect(() => {
        const timer = setInterval(() => setActiveTesti(i => (i + 1) % TESTIMONIALS.length), 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="home-page app">
            <Helmet>
                <title>{t('home_seo_title')} | EDWL</title>
                <meta name="description" content={t('home_seo_desc')} />
            </Helmet>

            {/* HERO SECTION */}
            <header style={{ minHeight: '92vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', padding: '100px 0' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '80px', alignItems: 'center' }}>
                    <div className="reveal">
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'var(--primary-glow)', border: '1px solid var(--primary-light)', borderRadius: '30px', padding: '8px 20px', marginBottom: '32px', fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary)' }}>
                            <span className="ai-pulse">System Active</span>
                            {t('active_workers_count')}
                        </div>
                        <h1 style={{ marginBottom: '24px' }}>
                            <span className="gradient-text">{t('welcome')}</span>
                        </h1>
                        <h2 style={{ fontSize: '2rem', color: 'var(--navy)', fontWeight: '600', marginBottom: '32px', opacity: 0.9 }}>{t('motto')}</h2>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-light)', maxWidth: '550px', marginBottom: '48px', lineHeight: 1.8 }}>{t('hero_title')}</p>

                        <div className="reveal delay-1" style={{ marginBottom: '40px' }}>
                            <LiveFeed />
                        </div>

                        <div className="reveal delay-2" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                            {user ? (
                                <button className="btn-primary" style={{ padding: '18px 48px', fontSize: '1.1rem' }}
                                    onClick={() => navigate(user.role === 'JOB_SEEKER' ? '/dashboard/seeker' : user.role === 'EMPLOYER' ? '/dashboard/employer' : '/admin')}>
                                    {t('go_to_dashboard')} <ArrowRight size={22} />
                                </button>
                            ) : (
                                <>
                                    <button className="btn-primary" style={{ padding: '18px 48px', fontSize: '1.1rem' }} onClick={() => navigate('/register')}>
                                        {t('create_free_account')} <ArrowRight size={22} />
                                    </button>
                                    <button className="btn-login" style={{ padding: '18px 40px', fontSize: '1.1rem' }} onClick={() => navigate('/login')}>
                                        <LogIn size={20} /> {t('login')}
                                    </button>
                                </>
                            )}
                        </div>
                        
                        <div className="reveal delay-3" style={{ display: 'flex', gap: '32px', marginTop: '48px' }}>
                            {[{ icon: Shield, textKey: 'escrow_protected' }, { icon: Award, textKey: 'academy_certified' }, { icon: Globe, textKey: 'fayda_verified' }].map(({ icon: Icon, textKey }) => (
                                <div key={textKey} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                                    <Icon size={18} color="var(--primary)" /> {t(textKey)}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="reveal delay-1 desktop-only" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <MatchSimulator onUnlock={() => navigate('/register')} />
                    </div>
                </div>
            </header>

            {/* TRUST STATS SECTION */}
            <section style={{ padding: '60px 0', background: 'var(--white)', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px' }}>
                    {[
                        { val: '5,000+', labelKey: 'available_workers', icon: Users },
                        { val: '1,200+', labelKey: 'active_employers', icon: Briefcase },
                        { val: '98%', labelKey: 'match_success', icon: Heart },
                        { val: '₿ 2.4M+', labelKey: 'etb_in_escrow', icon: Shield },
                    ].map(s => (
                        <div key={s.labelKey} style={{ textAlign: 'center', flex: 1, minWidth: '150px' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                                <s.icon size={32} color="var(--primary-light)" />
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--navy)', marginBottom: '4px' }}>{s.val}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px' }}>{t(s.labelKey)}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CORE FEATURES SECTION */}
            <section style={{ padding: '120px 0', position: 'relative' }}>
                <div className="container" style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <h2 style={{ marginBottom: '24px' }}>{t('why_thousands_trust')}</h2>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-light)', maxWidth: '650px', margin: '0 auto' }}>{t('platform_tagline')}</p>
                </div>
                
                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                    {[
                        { icon: Shield, titleKey: 'zero_trust_escrow', descKey: 'zero_trust_escrow_desc', color: 'var(--primary)' },
                        { icon: Zap, titleKey: 'ai_powered_matching', descKey: 'ai_powered_matching_desc', color: 'var(--accent)' },
                        { icon: Award, titleKey: 'edwl_academy', descKey: 'edwl_academy_desc', color: 'var(--primary-light)' },
                        { icon: Globe, titleKey: 'cross_border_hiring', descKey: 'cross_border_hiring_desc', color: 'var(--navy)' },
                    ].map(f => (
                        <div key={f.titleKey} className="card">
                            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px' }}>
                                <f.icon size={32} color={f.color} />
                            </div>
                            <h3 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>{t(f.titleKey)}</h3>
                            <p style={{ color: 'var(--text-light)', lineHeight: 1.7 }}>{t(f.descKey)}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* TESTIMONIALS SLIDER */}
            <section style={{ padding: '120px 0', background: 'var(--navy)', color: 'white' }}>
                <div className="container" style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{ color: 'white', marginBottom: '16px' }}>{t('real_people_results')}</h2>
                    <div style={{ height: '4px', width: '80px', background: 'var(--primary)', margin: '0 auto', borderRadius: '2px' }}></div>
                </div>
                
                <div className="container" style={{ maxWidth: '1000px' }}>
                    <div className="glass" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '60px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
                            {[...Array(5)].map((_, j) => <Star key={j} size={24} fill="var(--accent)" color="var(--accent)" />)}
                        </div>
                        <p style={{ fontSize: '1.8rem', fontWeight: '500', fontStyle: 'italic', marginBottom: '40px', lineHeight: 1.6 }}>
                            "{t(TESTIMONIALS[activeTesti].textKey)}"
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                            <div style={{ fontSize: '3rem' }}>{TESTIMONIALS[activeTesti].avatar}</div>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{TESTIMONIALS[activeTesti].name}</div>
                                <div style={{ color: 'var(--primary-light)', fontWeight: '700', fontSize: '0.9rem' }}>{t(TESTIMONIALS[activeTesti].roleKey)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FINAL CALL TO ACTION */}
            {!user && (
                <section style={{ padding: '140px 0', position: 'relative', overflow: 'hidden' }}>
                    <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                        <h2 style={{ fontSize: '3.5rem', marginBottom: '24px' }}>Ready to Scale Your Life?</h2>
                        <p style={{ fontSize: '1.4rem', color: 'var(--text-light)', maxWidth: '600px', margin: '0 auto 50px' }}>Join the ecosystem trusted by thousands of Ethiopian families and top-tier workers.</p>
                        <button className="btn-primary" style={{ padding: '20px 64px', fontSize: '1.2rem', boxShadow: 'var(--shadow-xl)' }} onClick={() => navigate('/register')}>
                            Create Your Free Account <ArrowRight size={24} />
                        </button>
                    </div>
                </section>
            )}
        </div>
    );
};

export default Home;
