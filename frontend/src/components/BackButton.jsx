import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BackButton = ({ style = {} }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <button
            onClick={() => navigate(-1)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.05)',
                cursor: 'pointer',
                color: 'inherit',
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                ...style
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(-4px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(0)'}
        >
            <ArrowLeft size={18} />
            {t('back') || "Back"}
        </button>
    );
};

export default BackButton;

