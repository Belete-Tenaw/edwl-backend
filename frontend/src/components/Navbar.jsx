import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { useTranslation } from 'react-i18next';
import { Menu, LogOut, User, MessageSquare } from 'lucide-react';
import logo from '../assets/logo_circular.png';

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const user = authService.getCurrentUser();

    const handleLogout = () => {
        authService.logout();
        setIsMenuOpen(false);
        navigate('/login');
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'am' : 'en';
        i18n.changeLanguage(newLang);
        setIsMenuOpen(false);
    };

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <nav className="navbar" style={{ position: 'sticky', top: 0, zIndex: 1000, padding: '10px 20px', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <Link to="/" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '15px', textDecoration: 'none' }}>
                <img src={logo} alt="EDWL Logo" style={{ height: '55px', width: 'auto', objectFit: 'contain' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{
                        fontWeight: '800',
                        fontSize: '1.1rem',
                        color: '#ff4500',
                        lineHeight: '1.1',
                        letterSpacing: '-0.02em',
                        fontFamily: "'Inter', sans-serif"
                    }}>
                        Ethio Domestic Workers Link
                    </div>
                    <div style={{
                        fontWeight: '700',
                        fontSize: '0.95rem',
                        color: '#ff4500',
                        lineHeight: '1.1',
                        fontFamily: 'system-ui'
                    }}>
                        ኢትዮ የሃገር ውስጥ ሠራተኞች አገናኝ
                    </div>
                </div>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button className="mobile-only" onClick={toggleLanguage} style={{ background: 'transparent', border: '1px solid #ddd', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>
                    {i18n.language === 'en' ? 'አማ' : 'En'}
                </button>
                <div className="mobile-only" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <Menu size={28} color="var(--primary)" style={{ cursor: 'pointer' }} />
                </div>
            </div>

            <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <Link to="/" onClick={closeMenu} style={{ textDecoration: 'none', color: '#333', fontWeight: '500' }}>{t('home')}</Link>
                <Link to="/about" onClick={closeMenu} style={{ textDecoration: 'none', color: '#333', fontWeight: '500' }}>{t('about_us')}</Link>
                <Link to="/contact" onClick={closeMenu} style={{ textDecoration: 'none', color: '#333', fontWeight: '500' }}>{t('contact_us')}</Link>
                <Link to="/pricing" onClick={closeMenu} style={{ textDecoration: 'none', color: '#333', fontWeight: '500' }}>{t('plans')}</Link>
                <div className="desktop-only">
                    <button onClick={toggleLanguage} style={{ background: 'transparent', border: '1px solid #ddd', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: 'fit-content' }}>
                        {i18n.language === 'en' ? 'አማርኛ' : 'English'}
                    </button>
                </div>

                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }} className="nav-links">
                        <Link to="/messages" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: '#333' }}>
                            <MessageSquare size={20} />
                            <span>{t('messages')}</span>
                        </Link>
                        <Link to={user.role === 'JOB_SEEKER' ? '/dashboard/seeker' : user.role === 'EMPLOYER' ? '/dashboard/employer' : '/admin'} onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: '#333' }}>
                            <User size={20} />
                            <span>{t('dashboard')}</span>
                        </Link>
                        <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'red', display: 'flex', alignItems: 'center' }}>
                            <LogOut size={20} />
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '10px' }} className="nav-auth">
                        <Link to="/login" onClick={closeMenu} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem', textDecoration: 'none', textAlign: 'center' }}>{t('login')}</Link>
                        <Link to="/register" onClick={closeMenu} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem', textDecoration: 'none', textAlign: 'center' }}>{t('register')}</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
