import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { useTranslation } from 'react-i18next';
import { Menu, LogOut, User, MessageSquare, LogIn, LayoutDashboard, Briefcase } from 'lucide-react';
import logo from '../assets/logo_circular.png';

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);
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

    const getNavLinkStyle = ({ isActive }) => ({
        textDecoration: 'none',
        color: isActive ? 'var(--primary)' : '#333',
        fontWeight: isActive ? '700' : '500',
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
    });

    return (
        <nav className="navbar" style={{ position: 'sticky', top: 0, zIndex: 1000, padding: '10px 20px', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <Link to="/" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '15px', textDecoration: 'none' }}>
                <img src={logo} alt="EDWL Logo" style={{ height: '75px', width: 'auto', objectFit: 'contain', transition: 'transform 0.3s ease' }} className="nav-logo" />
            </Link>

            {/* Mobile top-right: language toggle + hamburger */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button className="mobile-only" onClick={toggleLanguage} style={{ background: 'transparent', border: '1px solid #ddd', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>
                    {i18n.language === 'en' ? 'አማ' : 'En'}
                </button>
                <div className="mobile-only" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <Menu size={28} color="var(--primary)" style={{ cursor: 'pointer' }} />
                </div>
            </div>

            {/* Desktop nav + mobile slide-in menu */}
            <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <NavLink to="/" onClick={closeMenu} style={getNavLinkStyle}>{t('home')}</NavLink>
                <NavLink to="/about" onClick={closeMenu} style={getNavLinkStyle}>{t('about_us')}</NavLink>
                <NavLink to="/contact" onClick={closeMenu} style={getNavLinkStyle}>{t('contact_us')}</NavLink>
                <NavLink to="/pricing" onClick={closeMenu} style={getNavLinkStyle}>{t('plans')}</NavLink>

                {/* Desktop language toggle */}
                <div className="desktop-only">
                    <button onClick={toggleLanguage} style={{ background: 'transparent', border: '1px solid #ddd', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: 'fit-content' }}>
                        {i18n.language === 'en' ? 'አማርኛ' : 'English'}
                    </button>
                </div>

                {/* Logged-in specific links (Messages, Dashboard) */}
                {user && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }} className="nav-links">
                        <NavLink to="/messages" onClick={closeMenu} style={getNavLinkStyle}>
                            <MessageSquare size={20} />
                            <span>{t('messages')}</span>
                        </NavLink>
                        <NavLink
                            to={user.role === 'JOB_SEEKER' ? '/dashboard/seeker' : user.role === 'EMPLOYER' ? '/dashboard/employer' : '/admin'}
                            onClick={closeMenu}
                            style={getNavLinkStyle}
                        >
                            <User size={20} />
                            <span>{t('dashboard')}</span>
                        </NavLink>
                    </div>
                )}

                {/* Always visible Auth actions */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }} className="nav-auth">
                    {!user ? (
                        <>
                            {/* Prominent Login button for Guests */}
                            <Link 
                                to="/login" 
                                onClick={closeMenu}
                                className="btn-login"
                                style={{
                                    height: '44px',
                                    padding: '0 28px',
                                    borderRadius: '8px',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    textDecoration: 'none',
                                    border: '2px solid rgba(255, 255, 255, 0.2)', // Add subtle border for definition
                                    backgroundColor: 'var(--primary)'
                                }}
                            >
                                <LogIn size={20} />
                                {t('login')}
                            </Link>

                            <Link
                                to="/register"
                                onClick={closeMenu}
                                className="btn-primary"
                                style={{
                                    height: '44px',
                                    padding: '0 28px',
                                    fontSize: '0.95rem',
                                    textDecoration: 'none',
                                    textAlign: 'center',
                                    borderRadius: '8px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '700',
                                    boxShadow: '0 4px 12px rgba(255, 69, 0, 0.2)'
                                }}
                            >
                                {t('register')}
                            </Link>
                        </>
                    ) : (
                        /* Session Aware: Profile Dropdown */
                        <div style={{ position: 'relative' }}>
                            <div 
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px', 
                                    cursor: 'pointer',
                                    padding: '5px 12px',
                                    borderRadius: '20px',
                                    background: '#f8f9fa',
                                    border: '1px solid #eee'
                                }}
                            >
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                    {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                                </div>
                                <span className="desktop-only" style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.name || user.username}</span>
                            </div>

                            {isProfileOpen && (
                                <div style={{ 
                                    position: 'absolute', 
                                    top: '120%', 
                                    right: 0, 
                                    background: 'white', 
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
                                    borderRadius: '12px', 
                                    padding: '10px', 
                                    minWidth: '200px',
                                    zIndex: 1100,
                                    border: '1px solid #eee'
                                }}>
                                    <Link to={user.role === 'JOB_SEEKER' ? '/dashboard/seeker' : user.role === 'EMPLOYER' ? '/dashboard/employer' : '/admin'} onClick={() => setIsProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', textDecoration: 'none', color: '#333', fontSize: '0.9rem', borderRadius: '8px' }} className="dropdown-item">
                                        <LayoutDashboard size={18} color="#666" />
                                        <span>{t('dashboard')}</span>
                                    </Link>
                                    <Link to="/messages" onClick={() => setIsProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', textDecoration: 'none', color: '#333', fontSize: '0.9rem', borderRadius: '8px' }} className="dropdown-item">
                                        <MessageSquare size={18} color="#666" />
                                        <span>{t('messages')}</span>
                                    </Link>
                                    <Link to="/pricing" onClick={() => setIsProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', textDecoration: 'none', color: '#333', fontSize: '0.9rem', borderRadius: '8px' }} className="dropdown-item">
                                        <Briefcase size={18} color="#666" />
                                        <span>{t('subscription') || t('plans')}</span>
                                    </Link>
                                    <div style={{ height: '1px', background: '#eee', margin: '8px 0' }}></div>
                                    <button 
                                        onClick={handleLogout}
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'none', border: 'none', color: '#cc2200', fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left', borderRadius: '8px' }}
                                        className="dropdown-item logout"
                                    >
                                        <LogOut size={18} />
                                        <span>{t('logout')}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
