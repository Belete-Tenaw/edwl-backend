import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BackButton = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <button
            onClick={() => navigate(-1)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--primary)',
                marginBottom: '20px',
                padding: 0,
                fontSize: '1rem',
                fontWeight: '500'
            }}
        >
            <ArrowLeft size={20} />
            {t('back') || "Back"}
        </button>
    );
};

export default BackButton;
