import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
    const { t } = useTranslation();

    return (
        <div style={styles.container} className="reveal">
            <div style={styles.iconContainer}>
                <Compass size={80} color="var(--primary)" />
            </div>
            <h1 style={styles.header}>404</h1>
            <h2 style={styles.subHeader}>{t('page_not_found_title') || 'Lost in Connection?'}</h2>
            <p style={styles.text}>
                {t('page_not_found_desc') || "The page you're looking for doesn't exist or has been moved to a new smart location."}
            </p>
            <Link to="/" style={styles.link} className="btn-primary">
                <ArrowLeft size={18} /> {t('back_to_home') || 'Back to Home'}
            </Link>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '90vh',
        textAlign: 'center',
        padding: '20px',
        color: 'var(--text)',
    },
    iconContainer: {
        marginBottom: '20px',
        opacity: 0.8
    },
    header: {
        fontSize: '8rem',
        fontWeight: '900',
        margin: '0',
        color: 'var(--primary)',
        opacity: 0.1,
        position: 'absolute',
        zIndex: -1
    },
    subHeader: {
        fontSize: '2rem',
        fontWeight: '800',
        marginBottom: '10px'
    },
    text: {
        fontSize: '1.1rem',
        maxWidth: '500px',
        lineHeight: '1.6',
        color: 'var(--text-light)',
        marginBottom: '40px',
    },
    link: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
        padding: '14px 30px',
        borderRadius: '12px',
        fontWeight: '700',
        transition: 'var(--transition)'
    },
};

export default NotFound;
