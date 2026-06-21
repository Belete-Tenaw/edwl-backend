import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    BadgeCheck,
    Briefcase,
    Languages,
    LockKeyhole,
    MapPin,
    Search,
    ShieldCheck,
    SlidersHorizontal,
    UserRound
} from 'lucide-react';
import api from '../services/api';
import Seo, { BRAND_AM, BRAND_EN } from '../components/Seo';

const CATEGORY_OPTIONS = [
    { value: 'Childcare', labelKey: 'skill_childcare' },
    { value: 'Traditional Cooking', labelKey: 'skill_traditional_cooking' },
    { value: 'Eldercare', labelKey: 'skill_eldercare' },
    { value: 'General Cleaning', labelKey: 'skill_general_cleaning' },
    { value: 'Home Tutoring', labelKey: 'skill_home_tutoring' }
];

const STARTUP_CARDS = [
    {
        icon: ShieldCheck,
        titleKey: 'browse_card_reviewed_title',
        textKey: 'browse_card_reviewed_desc'
    },
    {
        icon: Search,
        titleKey: 'browse_card_pressure_title',
        textKey: 'browse_card_pressure_desc'
    },
    {
        icon: LockKeyhole,
        titleKey: 'browse_card_signup_title',
        textKey: 'browse_card_signup_desc'
    }
];

const getInitials = (name = '') => name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('') || 'ED';

const Browse = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({ q: '', category: '', location: '' });

    const queryString = useMemo(() => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value.trim()) params.set(key, value.trim());
        });
        return params.toString();
    }, [filters]);

    useEffect(() => {
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            setLoading(true);
            setError('');
            try {
                const response = await api.get(`/seekers/public${queryString ? `?${queryString}` : ''}`, {
                    signal: controller.signal
                });
                setProfiles(response.data?.items || []);
            } catch (err) {
                if (err.name !== 'CanceledError') {
                    setProfiles([]);
                    setError(t('public_profiles_unavailable'));
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }, 250);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [queryString, t]);

    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ q: '', category: '', location: '' });
    };

    return (
        <div className="browse-page">
            <Seo
                title={`${t('browse_meta_title')} - ${BRAND_AM}`}
                description={`${t('browse_meta_desc')} ${BRAND_EN} / ${BRAND_AM}.`}
                path="/browse"
                structuredData={{
                    '@context': 'https://schema.org',
                    '@type': 'CollectionPage',
                    name: `${t('browse_meta_title')} - ${BRAND_EN}`,
                    url: 'https://ethiodomesticworkers.web.app/browse',
                    inLanguage: ['en', 'am']
                }}
            />

            <header className="browse-hero">
                <div className="container browse-hero-grid">
                    <div>
                        <div className="browse-kicker">
                            <Search size={16} />
                            {t('browse_kicker')}
                        </div>
                        <h1>{t('browse_hero_title')}</h1>
                        <p>
                            {t('browse_hero_desc')}
                        </p>
                        <div className="browse-hero-actions">
                            <button className="btn-primary" type="button" onClick={() => navigate('/register')}>
                                {t('sign_up')} <ArrowRight size={18} />
                            </button>
                            <button className="btn-login" type="button" onClick={() => navigate('/pricing')}>
                                {t('view_plans')}
                            </button>
                        </div>
                    </div>

                    <div className="browse-policy-panel">
                        {STARTUP_CARDS.map(({ icon: Icon, titleKey, textKey }) => (
                            <div key={titleKey} className="browse-policy-row">
                                <div className="browse-policy-icon">
                                    <Icon size={18} />
                                </div>
                                <div>
                                    <strong>{t(titleKey)}</strong>
                                    <span>{t(textKey)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            <section className="browse-search-section">
                <div className="container">
                    <div className="browse-search-panel">
                        <div className="browse-search-title">
                            <SlidersHorizontal size={18} />
                            {t('search_public_summaries')}
                        </div>
                        <div className="browse-filters">
                            <label>
                                <span>{t('skill_or_role')}</span>
                                <input
                                    value={filters.q}
                                    onChange={(event) => updateFilter('q', event.target.value)}
                                    placeholder={t('browse_skill_placeholder')}
                                />
                            </label>
                            <label>
                                <span>{t('category')}</span>
                                <select value={filters.category} onChange={(event) => updateFilter('category', event.target.value)}>
                                    <option value="">{t('all_categories')}</option>
                                    {CATEGORY_OPTIONS.map(category => (
                                        <option key={category.value} value={category.value}>{t(category.labelKey)}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                <span>{t('location')}</span>
                                <input
                                    value={filters.location}
                                    onChange={(event) => updateFilter('location', event.target.value)}
                                    placeholder={t('browse_location_placeholder')}
                                />
                            </label>
                            <button className="browse-clear-btn" type="button" onClick={clearFilters}>
                                {t('clear')}
                            </button>
                        </div>
                    </div>

                    <div className="browse-results-header">
                        <div>
                            <h2>{t('public_profile_summaries')}</h2>
                            <p>{t('public_profile_privacy_note')}</p>
                        </div>
                        <div className="browse-result-count">
                            {loading ? t('checking') : t('shown_count', { count: profiles.length })}
                        </div>
                    </div>

                    {loading ? (
                        <div className="browse-loading">{t('loading_public_summaries')}</div>
                    ) : profiles.length > 0 ? (
                        <div className="browse-grid">
                            {profiles.map(profile => (
                                <article key={profile.id} className="browse-card">
                                    <div className="browse-card-top">
                                        {profile.profilePhoto ? (
                                            <img src={profile.profilePhoto} alt="" className="browse-avatar" />
                                        ) : (
                                            <div className="browse-avatar browse-avatar-fallback">
                                                {getInitials(profile.displayName)}
                                            </div>
                                        )}
                                        <div>
                                            <h3>{profile.displayName}</h3>
                                            <p>{profile.occupation}</p>
                                        </div>
                                    </div>

                                    <div className="browse-card-meta">
                                        <span><Briefcase size={15} /> {t('years_plus', { count: profile.experienceYears || 0 })}</span>
                                        <span><MapPin size={15} /> {profile.locationWoreda || profile.locationRegion || profile.preferredLocation || t('location_on_request')}</span>
                                        <span><Languages size={15} /> {(profile.languages || []).slice(0, 2).join(', ') || t('languages_on_profile')}</span>
                                    </div>

                                    <div className="browse-skill-list">
                                        {(profile.skills || []).slice(0, 4).map(skill => (
                                            <span key={skill}>{skill}</span>
                                        ))}
                                        {profile.salaryBand && <span>{profile.salaryBand}</span>}
                                    </div>

                                    <div className="browse-card-footer">
                                        <span><BadgeCheck size={16} /> {profile.verificationStatus === 'APPROVED' ? t('admin_reviewed_status') : t('review_pending')}</span>
                                        <button type="button" onClick={() => navigate('/register')}>
                                            {t('sign_up_to_contact')} <ArrowRight size={15} />
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="browse-empty">
                            <div className="browse-empty-icon">
                                <UserRound size={34} />
                            </div>
                            <h3>{t('no_approved_public_profiles')}</h3>
                            <p>{error || t('empty_public_profiles_desc')}</p>
                            <button className="btn-primary" type="button" onClick={() => navigate('/register')}>
                                {t('create_free_account')} <ArrowRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Browse;
