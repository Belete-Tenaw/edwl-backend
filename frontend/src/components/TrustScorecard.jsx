import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, Award, Target, Info, Fingerprint } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TrustScorecard = ({ seeker }) => {
  const { t } = useTranslation();
  const { 
    trustScore = 20, 
    tier = 'BRONZE', 
    isFaydaVerified = false, 
    isVerified = false,
    experienceYears = 0,
    behaviorScore = 50
  } = seeker;

  const getScoreColor = (score) => {
    if (score >= 90) return 'var(--primary-light)';
    if (score >= 70) return '#3b82f6'; // Blue
    if (score >= 40) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const scoreColor = getScoreColor(trustScore);

  return (
    <div className="trust-scorecard glass reveal shadow-premium">
      <div className="trust-header">
        <div className="trust-title-group">
          <ShieldCheck size={24} color={isVerified ? 'var(--primary)' : '#64748b'} />
          <div>
            <h3 className="trust-title">{t('trust_index') || 'Identity & Trust'}</h3>
            <p className="trust-subtitle">{isVerified ? t('fully_verified') : t('partially_verified')}</p>
          </div>
        </div>
        <div className="tier-badge" data-tier={tier}>
          <Award size={14} />
          {tier}
        </div>
      </div>

      <div className="trust-main-grid">
        <div className="score-circle-container">
          <svg className="score-svg" viewBox="0 0 100 100">
            <circle className="score-bg" cx="50" cy="50" r="45" />
            <circle 
              className="score-fill" 
              cx="50" cy="50" r="45" 
              style={{ 
                strokeDasharray: `${trustScore * 2.82}, 282`,
                stroke: scoreColor
              }}
            />
          </svg>
          <div className="score-value-container">
            <span className="score-value" style={{ color: scoreColor }}>{Math.round(trustScore)}</span>
            <span className="score-max">/100</span>
          </div>
        </div>

        <div className="trust-stats-list">
          <div className="trust-stat-item">
            <div className="stat-icon-bg" style={{ background: isFaydaVerified ? 'var(--primary-glow)' : '#f1f5f9' }}>
              <Fingerprint size={16} color={isFaydaVerified ? 'var(--primary)' : '#94a3b8'} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Fayda ID</span>
              <span className={`stat-status ${isFaydaVerified ? 'verified' : 'pending'}`}>
                {isFaydaVerified ? t('verified') : t('unverified')}
              </span>
            </div>
          </div>

          <div className="trust-stat-item">
            <div className="stat-icon-bg">
              <Target size={16} color="#3b82f6" />
            </div>
            <div className="stat-info">
              <span className="stat-label">{t('experience') || 'Experience'}</span>
              <span className="stat-status text-navy">{experienceYears} {t('years')}</span>
            </div>
          </div>
          
          <div className="trust-stat-item">
            <div className="stat-icon-bg">
              <Award size={16} color="#f59e0b" />
            </div>
            <div className="stat-info">
              <span className="stat-label">{t('behavior') || 'Behavior'}</span>
              <span className="stat-status text-navy">{behaviorScore}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="trust-footer">
        <Info size={14} />
        <p>{t('trust_score_info') || 'Score based on verified identity documents, guarantor vetting, and platform activity.'}</p>
      </div>

      <style>{`
        .trust-scorecard {
          padding: 24px;
          border-radius: 20px;
          border: 1px solid var(--glass-border);
          position: relative;
          overflow: hidden;
          background: white;
          width: 100%;
        }

        .trust-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .trust-title-group {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .trust-title {
          font-size: 1.1rem;
          font-weight: 800;
          margin: 0;
          color: var(--navy);
        }

        .trust-subtitle {
          font-size: 0.8rem;
          color: var(--text-light);
          margin: 0;
        }

        .tier-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 30px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .tier-badge[data-tier="BRONZE"] { background: #fee2e2; color: #991b1b; }
        .tier-badge[data-tier="SILVER"] { background: #f1f5f9; color: #475569; }
        .tier-badge[data-tier="GOLD"] { background: #fef3c7; color: #92400e; }
        .tier-badge[data-tier="PLATINUM"] { background: var(--primary-glow); color: var(--primary); }

        .trust-main-grid {
          display: grid;
          grid-template-columns: 100px 1fr;
          gap: 24px;
          align-items: center;
        }

        .score-circle-container {
          position: relative;
          width: 100px;
          height: 100px;
        }

        .score-svg {
          transform: rotate(-90deg);
        }

        .score-bg {
          fill: none;
          stroke: #f1f5f9;
          stroke-width: 8;
        }

        .score-fill {
          fill: none;
          stroke-width: 8;
          stroke-linecap: round;
          transition: stroke-dasharray 1s ease-in-out;
        }

        .score-value-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          line-height: 1;
        }

        .score-value {
          font-size: 1.8rem;
          font-weight: 900;
        }

        .score-max {
          font-size: 0.7rem;
          color: var(--text-light);
          font-weight: 600;
        }

        .trust-stats-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .trust-stat-item {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .stat-icon-bg {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 0.7rem;
          color: var(--text-light);
          font-weight: 600;
        }

        .stat-status {
          font-size: 0.85rem;
          font-weight: 700;
        }

        .stat-status.verified { color: var(--primary); }
        .stat-status.pending { color: #f59e0b; }
        .text-navy { color: var(--navy); }

        .trust-footer {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          gap: 8px;
          align-items: flex-start;
          color: var(--text-light);
        }

        .trust-footer p {
          font-size: 0.75rem;
          line-height: 1.4;
          margin: 0;
          font-style: italic;
        }

        .shadow-premium {
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.08);
        }
      `}</style>
    </div>
  );
};

export default TrustScorecard;
