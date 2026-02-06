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
            let currentSkills = [];
            let customSkill = '';
            if (data.skills && Array.isArray(data.skills)) {
                const list = t('skills_list', { returnObjects: true });
                currentSkills = data.skills.filter(s => Object.keys(list).includes(s));
                const custom = data.skills.find(s => !Object.keys(list).includes(s));
                if (custom) {
                    currentSkills.push('other');
                    customSkill = custom;
                }
            }
            setFormData({ ...data, skills: currentSkills, customSkill });
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

    const handleFileChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    };

    const handleSkillToggle = (skill) => {
        const currentSkills = [...(formData.skills || [])];
        const index = currentSkills.indexOf(skill);
        if (index > -1) {
            currentSkills.splice(index, 1);
        } else {
            currentSkills.push(skill);
        }
        setFormData({ ...formData, skills: currentSkills });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            let endpoint = '';
            const dataToSend = new FormData();

            if (user.role === 'JOB_SEEKER') {
                endpoint = '/seekers/profile';

                let finalSkills = Array.isArray(formData.skills) ? [...formData.skills] : [];
                if (finalSkills.includes('other') && formData.customSkill) {
                    finalSkills = finalSkills.filter(s => s !== 'other');
                    finalSkills.push(formData.customSkill);
                }

                dataToSend.append('fullName', formData.fullName);
                dataToSend.append('phone', formData.phone);
                dataToSend.append('age', formData.age);
                dataToSend.append('maritalStatus', formData.maritalStatus || 'SINGLE');
                dataToSend.append('religion', formData.religion || '');
                dataToSend.append('skills', JSON.stringify(finalSkills));
                dataToSend.append('experienceYears', formData.experienceYears);
                dataToSend.append('expectedSalary', formData.expectedSalary);
                dataToSend.append('preferredArrangement', formData.preferredArrangement || 'LIVE_IN');
                dataToSend.append('preferredLocation', formData.preferredLocation);
                dataToSend.append('bio', formData.bio || '');

                if (formData.profilePhoto instanceof File) {
                    dataToSend.append('profilePhoto', formData.profilePhoto);
                }
                if (formData.idDocument instanceof File) {
                    dataToSend.append('idDocument', formData.idDocument);
                }
            } else {
                endpoint = '/employers/profile';

                dataToSend.append('contactName', formData.contactName);
                dataToSend.append('phone', formData.phone);
                dataToSend.append('address', formData.address);
                if (formData.familySize) dataToSend.append('familySize', formData.familySize);

                if (formData.profilePhoto instanceof File) {
                    dataToSend.append('profilePhoto', formData.profilePhoto);
                }
                if (formData.idDocument instanceof File) {
                    dataToSend.append('idDocument', formData.idDocument);
                }
            }

            const res = await api.put(endpoint, dataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

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
                                <label className="label">{t('skills_required')} (Select multiple)</label>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                    gap: '10px',
                                    background: '#f9f9f9',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd'
                                }}>
                                    {Object.entries(t('skills_list', { returnObjects: true })).map(([key, value]) => (
                                        <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={(formData.skills || []).includes(key)}
                                                onChange={() => handleSkillToggle(key)}
                                            />
                                            {value}
                                        </label>
                                    ))}
                                </div>
                                {(formData.skills || []).includes('other') && (
                                    <div style={{ marginTop: '10px' }}>
                                        <input
                                            className="input"
                                            name="customSkill"
                                            value={formData.customSkill || ''}
                                            onChange={handleChange}
                                            placeholder={t('specify_other')}
                                            required
                                        />
                                    </div>
                                )}
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
                            <div>
                                <label className="label">{t('profile_photo')} (Image)</label>
                                <input type="file" className="input" name="profilePhoto" accept="image/*" onChange={handleFileChange} />
                            </div>
                            <div>
                                <label className="label">{t('id_document')} (Image)</label>
                                <input type="file" className="input" name="idDocument" accept="image/*" onChange={handleFileChange} />
                                <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '5px' }}>{t('re_verify_hint') || "Updating your ID will require re-verification by admin."}</p>
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
                            <div>
                                <label className="label">{t('profile_photo')} (Image)</label>
                                <input type="file" className="input" name="profilePhoto" accept="image/*" onChange={handleFileChange} />
                            </div>
                            <div>
                                <label className="label">{t('id_document')} (Image)</label>
                                <input type="file" className="input" name="idDocument" accept="image/*" onChange={handleFileChange} />
                                <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '5px' }}>{t('re_verify_hint') || "Updating your ID will require re-verification by admin."}</p>
                            </div>
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
