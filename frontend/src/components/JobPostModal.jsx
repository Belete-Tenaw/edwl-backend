import React, { useState } from 'react';
import api from '../services/api';
import { X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const JobPostModal = ({ onClose, onJobPosted }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requiredSkills: [],
        customSkill: '',
        salaryOffered: '',
        jobType: 'Full-time',
        preferredArrangement: 'LIVE_IN',
        address: ''
    });

    const { t } = useTranslation();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
            alert(err.response?.data?.error || 'Failed to post job');
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

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>{t('job_title')}</label>
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
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>{t('location')}</label>
                            <input
                                required
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder={t('location_placeholder')}
                            />
                        </div>
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
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>{t('description')}</label>
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
