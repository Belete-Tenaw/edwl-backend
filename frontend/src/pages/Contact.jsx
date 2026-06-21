import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Send, CheckCircle, MessageSquare, Clock, Shield } from 'lucide-react';
import BackButton from '../components/BackButton';
import Seo, { BRAND_AM, BRAND_EN } from '../components/Seo';

const getContactItems = (t) => [
    {
        icon: Phone, color: '#008080', bg: '#f0fdfa',
        label: t('contact_phone_label'),
        value: '+251 943 194 099',
        link: 'tel:+251943194099',
    },
    {
        icon: Mail, color: '#0284c7', bg: '#eff6ff',
        label: t('contact_email_label'),
        value: 'trustworthyaddis@gmail.com',
        link: 'mailto:trustworthyaddis@gmail.com',
    },
    {
        icon: MapPin, color: '#7c3aed', bg: '#faf5ff',
        label: t('contact_office_label'),
        value: t('contact_office_value'),
        link: 'https://maps.google.com/?q=Bole,Addis+Ababa',
    },
    {
        icon: Clock, color: '#d97706', bg: '#fffbeb',
        label: t('contact_support_hours_label'),
        value: t('contact_support_hours_value'),
        link: null,
    },
];

const CONTACT_SUBJECTS = [
    { value: 'general_inquiry', labelKey: 'general_inquiry' },
    { value: 'employer_support', labelKey: 'employer_support' },
    { value: 'worker_support', labelKey: 'worker_support' },
    { value: 'agency_b2b_partnership', labelKey: 'agency_b2b_partnership' },
    { value: 'payment_issue', labelKey: 'payment_issue' },
    { value: 'report_a_problem', labelKey: 'report_a_problem' }
];

const Contact = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({ name: '', email: '', subject: 'general_inquiry', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const contactItems = getContactItems(t);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
            setTimeout(() => { setSubmitted(false); setFormData({ name: '', email: '', subject: 'general_inquiry', message: '' }); }, 5000);
        }, 1200);
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <Seo
                title={`${t('contact_meta_title_current')} - ${BRAND_EN}`}
                description={`${t('contact_meta_desc_current')} ${BRAND_AM}.`}
                path="/contact"
            />

            <style>{`
                @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
                .contact-hero { background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); padding: 80px 0 60px; color: white; position: relative; overflow: hidden; }
                .contact-hero::after { content:''; position:absolute; bottom:-1px; left:0; right:0; height:60px; background:#f8fafc; clip-path:ellipse(55% 100% at 50% 100%); }
                .contact-info-card { background:white; border-radius:16px; padding:20px 24px; border:1px solid #f1f5f9; display:flex; align-items:center; gap:16px; transition:transform 0.2s,box-shadow 0.2s; }
                .contact-info-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.08); }
                input, textarea, select { width:100%; padding:13px 16px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:0.95rem; font-family:inherit; outline:none; transition:border-color 0.2s, box-shadow 0.2s; background:white; }
                input:focus, textarea:focus, select:focus { border-color:#008080; box-shadow:0 0 0 3px rgba(0,128,128,0.08); }
            `}</style>

            {/* HERO */}
            <header className="contact-hero">
                <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', padding: '6px 16px', marginBottom: '20px', fontSize: '0.82rem', fontWeight: '700' }}>
                        <MessageSquare size={14} /> {t('contact_reply_badge')}
                    </div>
                    <h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: '900', marginBottom: '14px' }}>{t('get_in_touch')}</h1>
                    <p style={{ color: 'rgba(255,255,255,0.75)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>
                        {t('contact_hero_desc')}
                    </p>
                </div>
            </header>

            {/* CONTENT */}
            <div className="container" style={{ padding: '60px 20px', maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'start' }}>

                    {/* LEFT: Info */}
                    <div>
                        <div style={{ marginBottom: '8px' }}>
                            <BackButton />
                        </div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>{t('contact_information')}</h2>
                        <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '28px', lineHeight: 1.7 }}>
                            {t('contact_intro')}
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '36px' }}>
                            {contactItems.map(({ icon: Icon, color, bg, label, value, link }) => (
                                <div key={label} className="contact-info-card">
                                    <div style={{ width: '44px', height: '44px', background: bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Icon size={20} color={color} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>{label}</div>
                                        {link ? (
                                            <a href={link} target="_blank" rel="noreferrer" style={{ fontWeight: '700', color: '#0f172a', textDecoration: 'none', fontSize: '0.92rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {value}
                                            </a>
                                        ) : (
                                            <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.92rem' }}>{value}</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Trust indicator */}
                        <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #86efac', borderRadius: '14px', padding: '18px 20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <Shield size={20} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                                <div style={{ fontWeight: '800', color: '#15803d', fontSize: '0.88rem', marginBottom: '4px' }}>{t('contact_data_safe_title')}</div>
                                <div style={{ color: '#166534', fontSize: '0.8rem', lineHeight: 1.6 }}>{t('contact_data_safe_desc')}</div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Form */}
                    <div style={{ background: 'white', borderRadius: '20px', padding: '36px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                        {submitted ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', animation: 'fadeUp 0.4s ease-out' }}>
                                <CheckCircle size={56} color="#16a34a" style={{ marginBottom: '20px' }} />
                                <h3 style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.3rem', marginBottom: '10px' }}>{t('contact_message_sent_title')}</h3>
                                <p style={{ color: '#64748b', lineHeight: 1.7 }}>{t('contact_message_sent_desc', { name: formData.name || t('friend') })}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <h3 style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.2rem', marginBottom: '24px' }}>{t('send_a_message')}</h3>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: '700', fontSize: '0.82rem', color: '#475569', marginBottom: '6px' }}>{t('full_name')}</label>
                                        <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder={t('contact_name_placeholder')} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: '700', fontSize: '0.82rem', color: '#475569', marginBottom: '6px' }}>{t('email_address')}</label>
                                        <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder={t('contact_email_placeholder')} />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '14px' }}>
                                    <label style={{ display: 'block', fontWeight: '700', fontSize: '0.82rem', color: '#475569', marginBottom: '6px' }}>{t('subject')}</label>
                                    <select name="subject" value={formData.subject} onChange={handleChange}>
                                        {CONTACT_SUBJECTS.map(subject => (
                                            <option key={subject.value} value={subject.value}>{t(subject.labelKey)}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontWeight: '700', fontSize: '0.82rem', color: '#475569', marginBottom: '6px' }}>{t('message')}</label>
                                    <textarea required name="message" value={formData.message} onChange={handleChange} rows="5" placeholder={t('contact_message_placeholder')} />
                                </div>

                                <button type="submit" disabled={loading}
                                    style={{ width: '100%', padding: '14px', background: loading ? '#94a3b8' : 'linear-gradient(135deg, #0f172a, #1e3a5f)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s' }}>
                                    {loading ? t('sending_message') : <><Send size={18} /> {t('send_message')}</>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
