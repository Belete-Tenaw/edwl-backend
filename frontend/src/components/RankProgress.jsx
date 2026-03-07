import React from 'react';
import { Shield, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const RankProgress = ({ user }) => {
    const { t } = useTranslation();
    const currentTier = user?.tier || 'BRONZE';

    const tiers = [
        {
            id: 'BRONZE',
            label: 'BRONZE',
            color: '#cd7f32',
            requirements: [
                { key: 'photo', label: t('rank_req_photo') || 'Recent Photo', met: !!user?.profilePhoto },
                { key: 'id', label: t('rank_req_id') || 'Kebele ID / Passport', met: !!user?.idDocument }
            ]
        },
        {
            id: 'SILVER',
            label: 'SILVER',
            color: '#c0c0c0',
            requirements: [
                { key: 'fayda', label: t('rank_req_fayda') || 'National ID (Fayda)', met: !!user?.nationalIdUrl }
            ]
        },
        {
            id: 'GOLD',
            label: 'GOLD',
            color: '#ffd700',
            requirements: [
                { key: 'guarantor', label: t('rank_req_guarantor') || 'Guarantor ID & Phone', met: !!user?.guarantorIdUrl && !!user?.guarantorPhone }
            ]
        },
        {
            id: 'PLATINUM',
            label: 'PLATINUM',
            color: '#e5e4e2',
            requirements: [
                { key: 'health', label: t('rank_req_health') || 'Health Certificate', met: !!user?.healthCertificateUrl },
                { key: 'police', label: t('rank_req_police') || 'Police Clearance', met: !!user?.policeClearanceUrl }
            ]
        }
    ];

    const currentTierIndex = tiers.findIndex(t => t.id === currentTier);

    return (
        <div className="rank-progress-container" style={{
            background: 'white',
            padding: '25px',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            border: '1px solid #f0f0f0',
            marginBottom: '30px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem' }}>
                    <Shield size={24} color={tiers[currentTierIndex]?.color} fill={tiers[currentTierIndex]?.color} />
                    {t('your_verification_rank') || 'Verification Rank'}: <span style={{ color: tiers[currentTierIndex]?.color, fontWeight: '800' }}>{currentTier}</span>
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#666', background: '#f5f5f5', padding: '5px 12px', borderRadius: '20px' }}>
                    {currentTier === 'PLATINUM' ? t('max_rank_reached') || 'Ultimate Rank Achieved!' : t('upgrade_available') || 'Upgrade Available'}
                </div>
            </div>

            {/* Progress Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 10px', marginBottom: '40px' }}>
                <div style={{
                    position: 'absolute', top: '16px', left: '10%', right: '10%', height: '4px',
                    background: '#eee', zIndex: 1, borderRadius: '2px'
                }}></div>
                <div style={{
                    position: 'absolute', top: '16px', left: '10%',
                    width: `${(currentTierIndex / (tiers.length - 1)) * 80}%`,
                    height: '4px', background: 'linear-gradient(90deg, #ff4500, #f59e0b)',
                    zIndex: 2, borderRadius: '2px', transition: 'width 0.5s ease-in-out'
                }}></div>

                {tiers.map((tier, idx) => {
                    const isCompleted = idx <= currentTierIndex;
                    const isCurrent = idx === currentTierIndex;

                    return (
                        <div key={tier.id} style={{ textAlign: 'center', zIndex: 3, position: 'relative', width: '60px' }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                background: isCompleted ? 'linear-gradient(135deg, #ff4500, #ff8c00)' : 'white',
                                border: `2px solid ${isCompleted ? 'transparent' : '#eee'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 8px',
                                boxShadow: isCurrent ? '0 0 15px rgba(255,69,0,0.4)' : 'none',
                                transition: 'all 0.3s ease'
                            }}>
                                <Shield size={18} color={isCompleted ? 'white' : '#ccc'} fill={isCompleted ? 'white' : 'transparent'} />
                            </div>
                            <span style={{
                                fontSize: '0.7rem',
                                fontWeight: isCurrent ? '800' : '500',
                                color: isCurrent ? '#111' : '#999',
                                display: 'block',
                                letterSpacing: '0.5px'
                            }}>
                                {tier.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Next Step Info */}
            {currentTierIndex < tiers.length - 1 && (
                <div style={{
                    background: '#fff9f0',
                    padding: '15px',
                    borderRadius: '12px',
                    border: '1px solid #ffeeba',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#856404', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        <AlertCircle size={18} />
                        {t('unlock_next_rank', { rank: tiers[currentTierIndex + 1].id }) || `Unlock ${tiers[currentTierIndex + 1].id} Rank`}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                        {tiers[currentTierIndex + 1].requirements.map(req => (
                            <div key={req.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                {req.met ? <CheckCircle2 size={16} color="#22c55e" /> : <Circle size={16} color="#ccc" />}
                                <span style={{ color: req.met ? '#166534' : '#666' }}>{req.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {currentTier === 'PLATINUM' && (
                <div style={{
                    background: '#f0fdf4',
                    padding: '15px',
                    borderRadius: '12px',
                    border: '1px solid #bbf7d0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: '#166534'
                }}>
                    <div style={{ background: '#22c55e', borderRadius: '50%', padding: '5px' }}>
                        <CheckCircle2 size={20} color="white" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{t('platinum_verified') || 'Elite Platinum Verified'}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t('platinum_desc') || 'Your profile has maximum visibility and trust among premium employers.'}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RankProgress;
