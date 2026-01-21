import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import authService from '../services/authService';
import { Save, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const EditProfile = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [user, setUser] = useState(authService.getCurrentUser());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchProfile();
    }, [user, navigate]);

    const fetchProfile = async () => {
        try {
            let endpoint = '';
            if (user.role === 'JOB_SEEKER') endpoint = `/seekers/${user.id}`;
            else if (user.role === 'EMPLOYER') endpoint = `/employers/${user.id}`;

            const res = await api.get(endpoint);

            const data = res.data;
            if (data.skills && Array.isArray(data.skills)) {
                data.skills = data.skills.join(', ');
            }
            setFormData(data);
        } catch (err) {
            console.error("Failed to fetch profile", err);
            alert("Could not load profile data.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            let endpoint = '';
            let payload = { ...formData };

            if (user.role === 'JOB_SEEKER') {
                endpoint = '/seekers/profile';
                payload.age = parseInt(payload.age);
                payload.experienceYears = parseInt(payload.experienceYears);
                payload.expectedSalary = parseInt(payload.expectedSalary);
                if (typeof payload.skills === 'string') {
                    payload.skills = payload.skills.split(',').map(s => s.trim()).filter(s => s);
                }
                delete payload.id;
                delete payload.email;
            } else {
                endpoint = '/employers/profile';
                if (payload.employerType === 'HOUSEHOLD') {
                    payload.familySize = parseInt(payload.familySize);
                }
                delete payload.id;
                delete payload.email;
            }

            const res = await api.put(endpoint, payload);

            const updatedUser = { ...user, fullName: res.data.fullName || res.data.contactName };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);

            alert('Profile updated successfully!');
            navigate(-1);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="container" style={{ padding: '50px' }}>Loading...</div>;

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '800px' }}>
            <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px', cursor: 'pointer', color: '#666' }}>
                <ArrowLeft size={18} /> {t('back_dashboard')}
            </button>

            <div className="card">
                <h2 style={{ marginBottom: '30px', color: 'var(--primary)' }}>{t('edit_profile')}</h2>

                <form onSubmit={handleSubmit}>
                    {user.role === 'JOB_SEEKER' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                            <div>
                                <label className="label">{t('full_name')}</label>
                                <input required className="input" name="fullName" value={formData.fullName || ''} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="label">{t('phone_number')}</label>
                                <input required className="input" name="phone" value={formData.phone || ''} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="label">{t('age')}</label>
                                <input required type="number" className="input" name="age" value={formData.age || ''} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="label">{t('marital_status')}</label>
                                <select className="input" name="maritalStatus" value={formData.maritalStatus || 'SINGLE'} onChange={handleChange}>
                                    <option value="SINGLE">{t('single')}</option>
                                    <option value="MARRIED">{t('married')}</option>
                                    <option value="DIVORCED">{t('divorced')}</option>
                                    <option value="WIDOWED">{t('widowed')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">{t('religion')}</label>
                                <input className="input" name="religion" value={formData.religion || ''} onChange={handleChange} />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label className="label">{t('skills_comma')}</label>
                                <input required className="input" name="skills" value={formData.skills || ''} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="label">{t('experience_years')}</label>
                                <input required type="number" className="input" name="experienceYears" value={formData.experienceYears || ''} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="label">{t('expected_salary')}</label>
                                <input required type="number" className="input" name="expectedSalary" value={formData.expectedSalary || ''} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="label">{t('preferred_arrangement')}</label>
                                <select className="input" name="preferredArrangement" value={formData.preferredArrangement || 'LIVE_IN'} onChange={handleChange}>
                                    <option value="LIVE_IN">{t('live_in')}</option>
                                    <option value="LIVE_OUT">{t('live_out')}</option>
                                    <option value="PART_TIME">{t('part_time')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">{t('preferred_location')}</label>
                                <input required className="input" name="preferredLocation" value={formData.preferredLocation || ''} onChange={handleChange} />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label className="label">{t('bio_about_me')}</label>
                                <textarea className="input" name="bio" value={formData.bio || ''} onChange={handleChange} style={{ minHeight: '100px' }} />
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                            <div>
                                <label className="label">{t('contact_person_name')}</label>
                                <input required className="input" name="contactName" value={formData.contactName || ''} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="label">{t('phone_number')}</label>
                                <input required className="input" name="phone" value={formData.phone || ''} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="label">{t('address_location')}</label>
                                <input required className="input" name="address" value={formData.address || ''} onChange={handleChange} />
                            </div>
                            {formData.employerType === 'HOUSEHOLD' && (
                                <div>
                                    <label className="label">{t('family_size')}</label>
                                    <input required type="number" className="input" name="familySize" value={formData.familySize || ''} onChange={handleChange} />
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" className="btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {saving ? t('saving') : t('save_changes')} <Save size={18} />
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
        .label { display: block; margin-bottom: 8px; font-weight: 500; font-size: 0.9rem; }
        .input { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #ddd; font-size: 1rem; font-family: inherit; }
      `}</style>
        </div>
    );
};

export default EditProfile;
