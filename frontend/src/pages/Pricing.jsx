import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Shield, Star, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const plans = [
        {
            name: t('silver'),
            icon: <Star size={32} color="#9CA3AF" />,
            price: '500',
            duration: t('days_30'),
            features: [
                t('pricing_features.basic_visibility'),
                t('pricing_features.job_apps_5'),
                t('pricing_features.std_messaging'),
                t('pricing_features.community_support')
            ],
            color: '#9CA3AF'
        },
        {
            name: t('gold'),
            icon: <Crown size={32} color="#FBBF24" />,
            price: '1200',
            duration: t('days_90'),
            features: [
                t('pricing_features.priority_ranking'),
                t('pricing_features.unlimited_apps'),
                t('pricing_features.verified_badge'),
                t('pricing_features.phone_access'),
                t('pricing_features.premium_support')
            ],
            color: '#FBBF24',
            popular: true
        },
        {
            name: t('semi_annual'),
            icon: <Crown size={32} color="#A855F7" />,
            price: '2000',
            duration: t('months_6'),
            features: [
                t('pricing_features.all_gold'),
                t('pricing_features.extended_6'),
                t('pricing_features.premium_support'),
                t('pricing_features.verified_badge'),
                t('pricing_features.unlimited_views')
            ],
            color: '#A855F7',
            popular: false
        },
        {
            name: t('platinum'),
            icon: <Shield size={32} color="var(--primary)" />,
            price: '3000',
            duration: t('year_1'),
            features: [
                t('pricing_features.all_gold'),
                t('pricing_features.direct_matching'),
                t('pricing_features.legal_assistance'),
                t('pricing_features.background_check'),
                t('pricing_features.dedicated_manager')
            ],
            color: 'var(--primary)'
        }
    ];

    const handleSelect = (planName) => {
        const element = document.getElementById('manual-payment-steps');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="container" style={{ padding: '60px 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '15px' }}>{t('choose_plan')}</h1>
                <p style={{ color: '#666', fontSize: '1.2rem' }}>{t('choose_plan_msg')}</p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '30px',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {plans.map((plan, index) => (
                    <div
                        key={index}
                        className="card"
                        style={{
                            position: 'relative',
                            border: plan.popular ? `2px solid ${plan.color}` : 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            padding: '30px'
                        }}
                    >
                        {plan.popular && (
                            <div style={{
                                position: 'absolute',
                                top: '-15px',
                                right: '20px',
                                background: plan.color,
                                color: 'white',
                                padding: '5px 15px',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                            }}>
                                {t('most_popular')}
                            </div>
                        )}

                        <div>
                            <div style={{ marginBottom: '20px' }}>
                                {plan.icon}
                                <h3 style={{ fontSize: '1.5rem', marginTop: '10px' }}>{plan.name}</h3>
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{plan.price}</span>
                                <span style={{ color: '#666', marginLeft: '5px' }}>{t('etb_per')} {plan.duration}</span>
                            </div>

                            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '40px' }}>
                                {plan.features.map((feature, fIndex) => (
                                    <li key={fIndex} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', fontSize: '0.95rem' }}>
                                        <Check size={18} color="#10B981" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            className="btn-primary"
                            style={{
                                width: '100%',
                                padding: '15px',
                                background: plan.popular ? plan.color : '#666'
                            }}
                            onClick={() => handleSelect(plan.name)}
                        >
                            {t('select_plan_name', { name: plan.name })}
                        </button>
                    </div>
                ))}
            </div>

            <div id="manual-payment-steps" style={{ marginTop: '60px', padding: '40px', background: '#f8f9fa', borderRadius: '20px', textAlign: 'left', maxWidth: '800px', margin: '60px auto 0' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '25px', textAlign: 'center', color: 'var(--primary)' }}>{t('manual_payment_title')}</h2>
                <div style={{ display: 'grid', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 'bold' }}>1</div>
                        <p style={{ margin: 0, fontSize: '1.1rem' }}>{t('step_1_contact')}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 'bold' }}>2</div>
                        <p style={{ margin: 0, fontSize: '1.1rem' }}>{t('step_2_bank')}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 'bold' }}>3</div>
                        <p style={{ margin: 0, fontSize: '1.1rem' }}>{t('step_3_receipt')}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 'bold' }}>4</div>
                        <p style={{ margin: 0, fontSize: '1.1rem' }}>{t('step_4_activate')}</p>
                    </div>
                </div>

                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                    <button className="btn-primary" style={{ padding: '12px 30px' }} onClick={() => navigate('/activate')}>
                        {t('go_to_activate')}
                    </button>
                    <p style={{ marginTop: '15px', color: '#666' }}>{t('contact_telegram')}</p>
                </div>
            </div>
        </div>
    );
};

export default Pricing;
