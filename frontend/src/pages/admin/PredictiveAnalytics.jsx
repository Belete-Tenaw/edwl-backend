import React from 'react';
import { TrendingDown, UserMinus, Rocket, ShieldAlert, Zap, BarChart, ArrowUpRight, ArrowDownRight, Target } from 'lucide-react';

const PredictiveAnalytics = ({ stats }) => {
    // Mocked insights based on potential platform data
    const insights = [
        { 
            title: 'Employer Churn Risk', 
            status: 'High', 
            count: 12, 
            description: '12 Employers have had inactive job posts for > 14 days.',
            action: 'Trigger 15% Discount Automation',
            icon: UserMinus,
            color: '#ef4444'
        },
        { 
            title: 'Supply Shortage Forecast', 
            status: 'Critical', 
            count: 5, 
            description: 'Bole region demand is outpacing supply by 400%.',
            action: 'Deploy SMS Scouting Campaign',
            icon: ShieldAlert,
            color: '#f59e0b'
        },
        { 
            title: 'Revenue Velocity', 
            status: 'Rising', 
            count: '+24%', 
            description: 'Premium upgrades are up by 24% this week.',
            action: 'Optimize Gold Tier Pricing',
            icon: TrendingUp,
            color: '#10b981'
        }
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            <style>{`
                .insight-card {
                    background: rgba(30, 41, 59, 0.7);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    padding: 32px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .insight-card:hover {
                    transform: translateY(-5px);
                    border-color: rgba(255, 255, 255, 0.2);
                }
                .glow-btn {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                }
                .glow-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>

            {insights.map((insight, idx) => (
                <div key={idx} className="insight-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                        <div style={{ width: '50px', height: '50px', background: `${insight.color}20`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <insight.icon size={24} color={insight.color} />
                        </div>
                        <div style={{ background: `${insight.color}30`, color: insight.color, padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase' }}>
                            {insight.status}
                        </div>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '4px' }}>{insight.count}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '12px' }}>{insight.title}</div>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '24px' }}>{insight.description}</p>
                    <button className="glow-btn" style={{ borderColor: `${insight.color}50`, color: insight.color }}>
                        <Zap size={16} /> {insight.action}
                    </button>
                </div>
            ))}

            <div className="insight-card" style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, #1e3a8a, #020617)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: '900' }}>Platform Intelligence Report</h3>
                        <p style={{ color: '#94a3b8' }}>Predictive models updated 5 minutes ago.</p>
                    </div>
                    <button className="glow-btn">
                        <Target size={18} /> Run Deep Analysis
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px' }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>User Retention</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            92.4% <ArrowUpRight color="#10b981" size={24} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>Market Liquidity</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            0.8 <ArrowDownRight color="#ef4444" size={24} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>LTV Average</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900' }}>4,200 <small style={{ fontSize: '1rem', opacity: 0.5 }}>ETB</small></div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>Automation Score</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#38bdf8' }}>78%</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PredictiveAnalytics;
