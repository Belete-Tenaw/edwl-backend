import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';

const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer style={{ background: '#2c3e50', color: 'white', padding: '60px 20px 20px' }}>
            <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
                <div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#ffaaa5' }}>EDWL</h3>
                    <p style={{ color: '#bdc3c7', lineHeight: '1.6' }}>
                        {t('footer_desc')}
                    </p>
                </div>

                <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>{t('quick_links')}</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: '10px' }}><Link to="/" style={{ color: '#bdc3c7', textDecoration: 'none' }}>{t('home')}</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link to="/about" style={{ color: '#bdc3c7', textDecoration: 'none' }}>{t('about_us')}</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link to="/safety" style={{ color: '#bdc3c7', textDecoration: 'none' }}>{t('safety')}</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link to="/pricing" style={{ color: '#bdc3c7', textDecoration: 'none' }}>{t('pricing')}</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>{t('legal')}</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: '10px' }}><Link to="/privacy-policy" style={{ color: '#bdc3c7', textDecoration: 'none' }}>{t('privacy_policy')}</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link to="/terms-and-conditions" style={{ color: '#bdc3c7', textDecoration: 'none' }}>{t('terms_and_conditions')}</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>{t('contact_us')}</h3>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                        <Mail size={20} color="#bdc3c7" />
                        <span style={{ color: '#bdc3c7' }}>trustworthyaddis@gmail.com</span>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <Facebook size={24} color="#bdc3c7" style={{ cursor: 'pointer' }} />
                        <Twitter size={24} color="#bdc3c7" style={{ cursor: 'pointer' }} />
                        <Instagram size={24} color="#bdc3c7" style={{ cursor: 'pointer' }} />
                    </div>
                </div>
            </div>

            <div style={{ borderTop: '1px solid #34495e', paddingTop: '20px', textAlign: 'center', color: '#7f8c8d' }}>
                &copy; {new Date().getFullYear()} Ethio Domestic Workers Link. {t('all_rights_reserved')}
            </div>
        </footer>
    );
};

export default Footer;
