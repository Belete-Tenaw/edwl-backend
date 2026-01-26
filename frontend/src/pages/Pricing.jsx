import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Shield, Star, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const plans = [
        {
            name: 'Silver',
            icon: <Star className="text-gray-400" size={32} />,
            price: '500',
            duration: '30 Days',
            features: [
                'Basic visibility in search',
                '5 Job Applications per day',
                'Standard messaging access',
                'Community support'
            ],
            color: '#9CA3AF'
        },
        {
            name: 'Gold',
            icon: <Crown className="text-yellow-500" size={32} />,
            price: '1200',
            duration: '90 Days',
            features: [
                'Priority ranking in search',
                'Unlimited Job Applications',
                'Verified Worker/Employer Badge',
                'Direct phone contact access',
                'Premium Support'
            ],
            color: '#FBBF24',
            popular: true
        },
        {
            name: 'Semi-Annual',
            icon: <Crown className="text-purple-500" size={32} />,
            price: '2000',
            duration: '6 Months',
            features: [
                'All Gold Features',
                'Extended 6-month access',
                'Priority customer support',
                'Verified badge eligibility',
                'Unlimited profile views'
            ],
            color: '#A855F7',
            popular: false
        },
        {
            name: 'Platinum',
            icon: <Shield className="text-orange-600" size={32} />,
            price: '3000',
            duration: '1 Year',
            features: [
                'All Gold Features',
                'Direct matching by EDWL agents',
                'Legal contract assistance',
                'Background check verification',
                'Dedicated account manager'
            ],
            color: 'var(--primary)'
        }
    ];

    const handleSelect = (planName) => {
        // In the next step, we'll link this to the Payment service
        navigate(`/payment?plan=${planName}`);
    };

    return (
        <div className="container" style={{ padding: '60px 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '15px' }}>Choose Your Plan</h1>
                <p style={{ color: '#666', fontSize: '1.2rem' }}>Get better matches and priority support with EDWL Premium</p>
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
                            justifyContent: 'space-between'
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
                                MOST POPULAR
                            </div>
                        )}

                        <div>
                            <div style={{ marginBottom: '20px' }}>
                                {plan.icon}
                                <h3 style={{ fontSize: '1.5rem', marginTop: '10px' }}>{plan.name}</h3>
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{plan.price}</span>
                                <span style={{ color: '#666', marginLeft: '5px' }}>ETB / {plan.duration}</span>
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
                            className={plan.popular ? 'btn-primary' : 'btn-secondary'}
                            style={{
                                width: '100%',
                                padding: '15px',
                                background: plan.popular ? plan.color : '#f3f4f6'
                            }}
                            onClick={() => handleSelect(plan.name)}
                        >
                            Select {plan.name}
                        </button>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '50px', textAlign: 'center', color: '#666' }}>
                <p>All plans include access to our standard security features.</p>
                <p>Have a manual activation code? <a href="/activate" style={{ color: 'var(--primary)', fontWeight: '600' }}>Enter it here</a></p>
            </div>
        </div>
    );
};

export default Pricing;
