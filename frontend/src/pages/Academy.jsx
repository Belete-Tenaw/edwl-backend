import React, { useState, useEffect } from 'react';
import api from '../services/api';
import authService from '../services/authService';
import { useToast } from '../components/Toast';
import { useTranslation } from 'react-i18next';
import { BookOpen, CheckCircle, Play, Sparkles } from 'lucide-react';
import '../index.css'; // Use existing global styles
import Seo, { BRAND_AM, BRAND_EN } from '../components/Seo';

const Academy = () => {
    const { t } = useTranslation();
    const addToast = useToast();
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = authService.getCurrentUser();

    useEffect(() => {
        fetchModules();
    }, []);

    const fetchModules = async () => {
        try {
            const res = await api.get('/training');
            setModules(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch training modules', error);
            setLoading(false);
        }
    };

    const handleComplete = async (moduleId) => {
        if (!user || user.role !== 'JOB_SEEKER') {
            addToast(t('only_seekers_academy') || "Only Job Seekers can complete modules and earn badges.", 'error');
            return;
        }
        try {
            await api.post(`/training/${moduleId}/complete`);
            addToast(t('module_completed_success') || "Module marked as completed! Keep going!", 'success');
            fetchModules(); 
        } catch (error) {
            addToast(error.response?.data?.error || 'Failed to complete module', 'error');
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="spinner"></div>
        </div>
    );

    return (
        <>
        <Seo
            title={`EDWL Academy - ${BRAND_EN}`}
            description={`Training and practical guidance for domestic workers using ${BRAND_EN} (${BRAND_AM}).`}
            path="/academy"
        />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }} className="reveal">
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <div style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    background: 'rgba(0, 128, 128, 0.05)', 
                    color: 'var(--primary)', 
                    padding: '8px 20px', 
                    borderRadius: '30px', 
                    fontSize: '0.9rem', 
                    fontWeight: '800',
                    marginBottom: '20px'
                }}>
                    <BookOpen size={18} /> {t('academy_tag') || 'SKILLS & TRAINING'}
                </div>
                <h1 style={{ color: 'var(--text)', fontSize: '3rem', fontWeight: '900', marginBottom: '15px', letterSpacing: '-0.03em' }}>
                    {t('academy_title') || 'EDWL Academy'}
                </h1>
                <p style={{ color: 'var(--text-light)', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto' }}>
                    {t('academy_desc') || 'Complete training modules to upskill and earn elite badges for your profile.'}
                </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '32px' }}>
                {modules.map((mod, index) => (
                    <div key={mod.id} className={`card reveal delay-${(index % 4) + 1}`} style={{ 
                        background: 'white', 
                        borderRadius: '24px', 
                        overflow: 'hidden',
                        border: mod.isCompleted ? '2px solid #10b981' : '1px solid #f1f5f9',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                    }}>
                        <div style={{ 
                            height: '200px', 
                            background: mod.isCompleted ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : '#f8fafc', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            borderBottom: '1px solid #f1f5f9',
                            position: 'relative'
                        }}>
                            {mod.isCompleted ? (
                                <CheckCircle size={60} color="#10b981" />
                            ) : (
                                <div style={{ 
                                    width: '60px', height: '60px', borderRadius: '50%', background: 'white', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)', color: 'var(--primary)' 
                                }}>
                                    <Play size={24} fill="currentColor" />
                                </div>
                            )}
                            <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.9)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800', color: '#64748b' }}>
                                {mod.category || 'Basic'}
                            </div>
                        </div>
                        <div style={{ padding: '28px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ margin: '0 0 12px', color: 'var(--text)', fontSize: '1.3rem', fontWeight: '800' }}>{mod.title}</h3>
                            <p style={{ color: 'var(--text-light)', marginBottom: '24px', flexGrow: 1, lineHeight: '1.6', fontSize: '0.95rem' }}>{mod.description}</p>
                            
                            <div style={{ marginTop: 'auto' }}>
                                {mod.isCompleted ? (
                                    <div style={{ 
                                        width: '100%', padding: '14px', borderRadius: '16px', 
                                        textAlign: 'center', background: '#f0fdf4', color: '#166534', 
                                        fontWeight: '800', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                    }}>
                                        <CheckCircle size={18} /> {t('completed') || 'Completed'}
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => handleComplete(mod.id)}
                                        className="btn-primary"
                                        style={{ 
                                            width: '100%', padding: '14px', borderRadius: '16px', 
                                            fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                        }}
                                    >
                                        <Sparkles size={18} /> {t('start_training') || 'Start Training'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                
                {modules.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px 40px', background: '#f8fafc', borderRadius: '32px', border: '2px dashed #e2e8f0' }}>
                        <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <BookOpen size={32} color="#94a3b8" />
                        </div>
                        <h3 style={{ color: 'var(--text)', fontSize: '1.5rem', fontWeight: '800', marginBottom: '10px' }}>
                            {t('more_modules_coming') || 'More modules are coming soon!'}
                        </h3>
                        <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>
                            {t('academy_empty_desc') || 'We are currently preparing more training content to help you advance your career.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
        </>
    );
};

export default Academy;
