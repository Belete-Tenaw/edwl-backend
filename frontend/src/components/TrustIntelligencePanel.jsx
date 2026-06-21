import React from 'react';
import { BrainCircuit, LockKeyhole, SearchCheck, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ASSURANCE_ITEMS = [
    { icon: SearchCheck, titleKey: 'assurance_browse_title', descKey: 'assurance_browse_desc' },
    { icon: BrainCircuit, titleKey: 'assurance_match_title', descKey: 'assurance_match_desc' },
    { icon: ShieldCheck, titleKey: 'assurance_review_title', descKey: 'assurance_review_desc' },
    { icon: LockKeyhole, titleKey: 'assurance_privacy_title', descKey: 'assurance_privacy_desc' },
];

const TrustIntelligencePanel = () => {
    const { t } = useTranslation();

    return (
        <section className="assurance-section" aria-labelledby="assurance-heading">
            <div className="container assurance-shell">
                <div className="assurance-heading">
                    <span>{t('assurance_kicker')}</span>
                    <h2 id="assurance-heading">{t('assurance_title')}</h2>
                    <p>{t('assurance_desc')}</p>
                </div>
                <div className="assurance-grid">
                    {ASSURANCE_ITEMS.map(({ icon: Icon, titleKey, descKey }) => (
                        <article className="assurance-card" key={titleKey}>
                            <div className="assurance-icon">
                                <Icon size={22} />
                            </div>
                            <h3>{t(titleKey)}</h3>
                            <p>{t(descKey)}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TrustIntelligencePanel;
