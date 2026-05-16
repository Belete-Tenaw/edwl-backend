import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
    const { t } = useTranslation();

    return (
        <div style={styles.outer}>
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(2deg); }
                }
                .glow-btn {
                    background: #38bdf8;
                    color: #0f172a;
                    padding: 16px 40px;
                    border-radius: 16px;
                    font-weight: 900;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: all 0.3s;
                    box-shadow: 0 10px 20px rgba(56, 189, 248, 0.2);
                }
                .glow-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 15px 30px rgba(56, 189, 248, 0.4);
                    background: #7dd3fc;
                }
            `}</style>

            <div style={styles.glow} />
            
            <div style={styles.container}>
                <div style={{ animation: 'float 6s ease-in-out infinite' }}>
                    <div style={styles.iconContainer}>
                        <Globe size={100} color="#38bdf8" style={{ filter: 'drop-shadow(0 0 20px rgba(56, 189, 248, 0.4))' }} />
                    </div>
                    <h1 style={styles.header}>404</h1>
                </div>

                <div style={styles.glassCard}>
                    <h2 style={styles.subHeader}>{t('page_not_found_title', 'Lost in the Ecosystem?')}</h2>
                    <p style={styles.text}>
                        {t('page_not_found_desc', "The precision match you're seeking has drifted off-course. Let's navigate you back to the Command Center.")}
                    </p>
                    <Link to="/" className="glow-btn">
                        <ArrowLeft size={20} /> {t('back_to_home', 'Return to Platform')}
                    </Link>
                </div>

            </div>
        </div>
    );
};

const styles = {
    outer: {
        background: '#020617',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Outfit', sans-serif",
        color: 'white'
    },
    glow: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)',
        filter: 'blur(60px)',
        zIndex: 0
    },
    container: {
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
        maxWidth: '600px',
        padding: '0 20px'
    },
    iconContainer: {
        marginBottom: '40px',
    },
    header: {
        fontSize: '12rem',
        fontWeight: '950',
        margin: '0',
        color: 'white',
        opacity: 0.05,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: -1,
        letterSpacing: '-10px'
    },
    glassCard: {
        background: 'rgba(30, 41, 59, 0.4)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '56px 40px',
        borderRadius: '32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    subHeader: {
        fontSize: '2.5rem',
        fontWeight: '900',
        marginBottom: '16px',
        letterSpacing: '-0.5px'
    },
    text: {
        fontSize: '1.15rem',
        lineHeight: '1.7',
        color: '#94a3b8',
        marginBottom: '48px',
    }
};

export default NotFound;
