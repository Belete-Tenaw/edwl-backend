import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Mail, Phone, MapPin, Send, CheckCircle, MessageSquare, Clock, Shield } from 'lucide-react';
import BackButton from '../components/BackButton';

const CONTACT_ITEMS = [
    {
        icon: Phone, color: '#008080', bg: '#f0fdfa',
        label: 'Phone / Telegram / WhatsApp',
        value: '+251 943 194 099',
        link: 'tel:+251943194099',
    },
    {
        icon: Mail, color: '#0284c7', bg: '#eff6ff',
        label: 'Email',
        value: 'trustworthyaddis@gmail.com',
        link: 'mailto:trustworthyaddis@gmail.com',
    },
    {
        icon: MapPin, color: '#7c3aed', bg: '#faf5ff',
        label: 'Office',
        value: 'Bole Sub-city, Addis Ababa, Ethiopia',
        link: 'https://maps.google.com/?q=Bole,Addis+Ababa',
    },
    {
        icon: Clock, color: '#d97706', bg: '#fffbeb',
        label: 'Support Hours',
        value: 'Mon – Sat · 8:00 AM – 6:00 PM EAT',
        link: null,
    },
];

const Contact = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
            setTimeout(() => { setSubmitted(false); setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' }); }, 5000);
        }, 1200);
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <Helmet>
                <title>Contact EDWL — Get in Touch</title>
                <meta name="description" content="Contact the EDWL team for support, partnership inquiries, or B2B agency registration. We're here Mon–Sat, 8AM–6PM." />
            </Helmet>

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
                        <MessageSquare size={14} /> We reply within 24 hours
                    </div>
                    <h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: '900', marginBottom: '14px' }}>Get in Touch</h1>
                    <p style={{ color: 'rgba(255,255,255,0.75)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>
                        Whether you're hiring, looking for work, or building a partnership — we'd love to hear from you.
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
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Contact Information</h2>
                        <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '28px', lineHeight: 1.7 }}>
                            Our team is based in Addis Ababa and available Monday through Saturday to support workers, employers, and agency partners.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '36px' }}>
                            {CONTACT_ITEMS.map(({ icon: Icon, color, bg, label, value, link }) => (
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
                                <div style={{ fontWeight: '800', color: '#15803d', fontSize: '0.88rem', marginBottom: '4px' }}>Your data is safe</div>
                                <div style={{ color: '#166534', fontSize: '0.8rem', lineHeight: 1.6 }}>We never share your contact details with third parties. All messages are handled by our verified support team.</div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Form */}
                    <div style={{ background: 'white', borderRadius: '20px', padding: '36px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                        {submitted ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', animation: 'fadeUp 0.4s ease-out' }}>
                                <CheckCircle size={56} color="#16a34a" style={{ marginBottom: '20px' }} />
                                <h3 style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.3rem', marginBottom: '10px' }}>Message Sent!</h3>
                                <p style={{ color: '#64748b', lineHeight: 1.7 }}>Thank you, {formData.name || 'friend'}. We'll get back to you within 24 hours.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <h3 style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.2rem', marginBottom: '24px' }}>Send a Message</h3>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: '700', fontSize: '0.82rem', color: '#475569', marginBottom: '6px' }}>Full Name</label>
                                        <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Meron Tadesse" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: '700', fontSize: '0.82rem', color: '#475569', marginBottom: '6px' }}>Email Address</label>
                                        <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '14px' }}>
                                    <label style={{ display: 'block', fontWeight: '700', fontSize: '0.82rem', color: '#475569', marginBottom: '6px' }}>Subject</label>
                                    <select name="subject" value={formData.subject} onChange={handleChange}>
                                        <option>General Inquiry</option>
                                        <option>Employer Support</option>
                                        <option>Worker Support</option>
                                        <option>Agency / B2B Partnership</option>
                                        <option>Payment Issue</option>
                                        <option>Report a Problem</option>
                                    </select>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontWeight: '700', fontSize: '0.82rem', color: '#475569', marginBottom: '6px' }}>Message</label>
                                    <textarea required name="message" value={formData.message} onChange={handleChange} rows="5" placeholder="Tell us how we can help..." />
                                </div>

                                <button type="submit" disabled={loading}
                                    style={{ width: '100%', padding: '14px', background: loading ? '#94a3b8' : 'linear-gradient(135deg, #0f172a, #1e3a5f)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s' }}>
                                    {loading ? 'Sending...' : <><Send size={18} /> Send Message</>}
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
