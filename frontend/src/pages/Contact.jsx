import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BackButton from '../components/BackButton';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate form submission
        
        setSubmitted(true);
        // Reset form after 3 seconds
        setTimeout(() => setSubmitted(false), 3000);
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <div style={{ background: '#f9f9f9', minHeight: '100vh', padding: '40px 20px' }}>
            <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
                <BackButton />
                <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '40px', textAlign: 'center' }}>{t('contact_us')}</h1>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                    {/* Contact Info */}
                    <div>
                        <div className="card" style={{ padding: '30px', marginBottom: '30px' }}>
                            <h3 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>{t('get_in_touch')}</h3>

                            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' }}>
                                <div style={{ background: '#fff0e6', padding: '10px', borderRadius: '50%' }}>
                                    <Phone size={20} color="var(--primary)" />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '2px' }}>{t('phone')}</h4>
                                    <p style={{ fontWeight: '500' }}>+251 943 194 099 <br /><span style={{ fontSize: '0.8rem', color: '#888' }}>({t('telegram_whatsapp')})</span></p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' }}>
                                <div style={{ background: '#fff0e6', padding: '10px', borderRadius: '50%' }}>
                                    <Mail size={20} color="var(--primary)" />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '2px' }}>{t('email')}</h4>
                                    <p style={{ fontWeight: '500' }}>trustworthyaddis@gmail.com</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <div style={{ background: '#fff0e6', padding: '10px', borderRadius: '50%' }}>
                                    <MapPin size={20} color="var(--primary)" />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '2px' }}>{t('address')}</h4>
                                    <p style={{ fontWeight: '500' }}>Bole, Addis Ababa, Ethiopia</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="card" style={{ padding: '30px' }}>
                        <h3 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>{t('send_us_message')}</h3>

                        {submitted ? (
                            <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                                <p>{t('message_sent')}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{t('full_name')}</label>
                                    <input
                                        required
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                        placeholder={t('enter_name')}
                                    />
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{t('email_address')}</label>
                                    <input
                                        required
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                        placeholder={t('enter_email')}
                                    />
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{t('message')}</label>
                                    <textarea
                                        required
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows="4"
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                                        placeholder={t('enter_message')}
                                    />
                                </div>
                                <button type="submit" className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                    {t('send_message')} <Send size={18} />
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

