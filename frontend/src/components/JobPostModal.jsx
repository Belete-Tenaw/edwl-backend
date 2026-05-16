import React, { useState } from 'react';
import api from '../services/api';
import { X, Check, Keyboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { transliterate } from '../utils/amharicTranslit';
import SalaryBenchmark from './SalaryBenchmark';

const JobPostModal = ({ onClose, onJobPosted }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requiredSkills: [],
        customSkill: '',
        salaryOffered: '',
        jobType: 'Full-time',
        preferredArrangement: 'LIVE_IN',
        address: '',
        locationRegion: '',
        locationZone: '',
        locationWoreda: ''
    });
    const [amharicMode, setAmharicMode] = useState({ title: false, description: false, customSkill: false });

    const { t } = useTranslation();

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (amharicMode[name] && value.length > (formData[name]?.length || 0)) {
            // Only transliterate if adding text
            const lastChar = value.slice(-1);
            if (/[a-zA-Z]/.test(lastChar)) {
                const transliterated = transliterate(value);
                setFormData({ ...formData, [name]: transliterated });
                return;
            }
        }
        setFormData({ ...formData, [name]: value });
    };

    const toggleAmharic = (field) => {
        setAmharicMode({ ...amharicMode, [field]: !amharicMode[field] });
    };

    const handleSkillToggle = (skill) => {
        const currentSkills = [...formData.requiredSkills];
        const index = currentSkills.indexOf(skill);
        if (index > -1) {
            currentSkills.splice(index, 1);
        } else {
            currentSkills.push(skill);
        }
        setFormData({ ...formData, requiredSkills: currentSkills });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let finalSkills = [...formData.requiredSkills];
            if (finalSkills.includes('other') && formData.customSkill) {
                finalSkills = finalSkills.filter(s => s !== 'other');
                finalSkills.push(formData.customSkill);
            }
            const payload = {
                ...formData,
                requiredSkills: finalSkills,
                salaryOffered: parseInt(formData.salaryOffered)
            };

            const res = await api.post('/jobs', payload);
            onJobPosted(res.data);
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Failed to post job.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="card" style={{ width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent' }}>
                    <X size={24} color="#999" />
                </button>

                <h2 style={{ marginBottom: '20px', color: 'var(--primary)' }}>{t('post_new_job')}</h2>

                {error && (
                    <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                            <label style={{ fontWeight: '500' }}>{t('job_title')}</label>
                            <button
                                type="button"
                                onClick={() => toggleAmharic('title')}
                                style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', border: amharicMode.title ? '1px solid var(--primary)' : '1px solid #ddd', background: amharicMode.title ? '#fff7ed' : 'white', color: amharicMode.title ? 'var(--primary)' : '#666', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                <Keyboard size={12} /> {amharicMode.title ? 'Amharic ON' : 'Easy Amharic'}
                            </button>
                        </div>
                        <input
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder={t('job_title_placeholder')}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>{t('monthly_salary')}</label>
                            <input
                                required
                                type="number"
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                name="salaryOffered"
                                value={formData.salaryOffered}
                                onChange={handleChange}
                                placeholder="3000"
                            />
                        </div>
                    </div>

                    {/* 📊 AI Salary Benchmark Widget */}
                    <SalaryBenchmark
                        jobType={formData.jobType}
                        region={formData.locationRegion}
                        salary={parseInt(formData.salaryOffered) || 0}
                        onChange={(suggestedSalary) =>
                            setFormData(prev => ({ ...prev, salaryOffered: String(suggestedSalary) }))
                        }
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>{t('region') || 'Region'}</label>
                            <input
                                required
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                name="locationRegion"
                                value={formData.locationRegion}
                                onChange={handleChange}
                                placeholder="e.g. Addis Ababa"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>{t('woreda') || 'Woreda'}</label>
                            <input
                                required
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                name="locationWoreda"
                                value={formData.locationWoreda}
                                onChange={handleChange}
                                placeholder="e.g. Bole"
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>{t('exact_address') || 'Exact Address / Landmark'}</label>
                        <input
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder={t('location_placeholder')}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>{t('arrangement')}</label>
                            <select
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                name="preferredArrangement"
                                value={formData.preferredArrangement}
                                onChange={handleChange}
                            >
                                <option value="LIVE_IN">{t('live_in')}</option>
                                <option value="LIVE_OUT">{t('live_out')}</option>
                                <option value="PART_TIME">{t('part_time')}</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>{t('job_type')}</label>
                            <input
                                required
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                name="jobType"
                                value={formData.jobType}
                                onChange={handleChange}
                                placeholder={t('job_type_placeholder')}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>{t('skills_required')} (Select multiple)</label>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                            gap: '8px',
                            background: '#f9f9f9',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            maxHeight: '200px',
                            overflowY: 'auto'
                        }}>
                            {Object.entries(t('skills_list', { returnObjects: true })).map(([key, value]) => (
                                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.requiredSkills.includes(key)}
                                        onChange={() => handleSkillToggle(key)}
                                    />
                                    {value}
                                </label>
                            ))}
                        </div>
                        {formData.requiredSkills.includes('other') && (
                            <div style={{ marginTop: '10px' }}>
                                <input
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                    name="customSkill"
                                    value={formData.customSkill}
                                    onChange={handleChange}
                                    placeholder={t('specify_other')}
                                    required
                                />
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                            <label style={{ fontWeight: '500' }}>{t('description')}</label>
                            <button
                                type="button"
                                onClick={() => toggleAmharic('description')}
                                style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', border: amharicMode.description ? '1px solid var(--primary)' : '1px solid #ddd', background: amharicMode.description ? '#fff7ed' : 'white', color: amharicMode.description ? 'var(--primary)' : '#666', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                <Keyboard size={12} /> {amharicMode.description ? 'Amharic ON' : 'Easy Amharic'}
                            </button>
                        </div>
                        <textarea
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '100px', fontFamily: 'inherit' }}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder={t('describe_responsibilities')}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: '#f5f5f5', color: '#333' }}>{t('cancel')}</button>
                        <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {loading ? t('posting') : t('post_job_btn')} <Check size={18} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JobPostModal;
