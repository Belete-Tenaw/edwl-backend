import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { User, Briefcase, Mail, Phone, Lock, MapPin, Smile, DollarSign, Clock } from 'lucide-react';

const Register = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('seeker'); // seeker, employer
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Seeker State
    const [seekerData, setSeekerData] = useState({
        fullName: '', gender: 'FEMALE', age: '', religion: '', maritalStatus: 'SINGLE',
        phone: '', email: '', password: '', bio: '', skills: [],
        experienceYears: '', expectedSalary: '', preferredLocation: '',
        preferredArrangement: 'LIVE_IN', customSkill: '',
        profilePhoto: null, idDocument: null
    });

    // Employer State
    const [employerData, setEmployerData] = useState({
        employerType: 'HOUSEHOLD', contactName: '', phone: '', email: '',
        password: '', address: '', familySize: ''
    });

    const handleSeekerChange = (e) => setSeekerData({ ...seekerData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setSeekerData({ ...seekerData, [e.target.name]: e.target.files[0] });
    const handleSkillToggle = (skill) => {
        const currentSkills = [...seekerData.skills];
        const index = currentSkills.indexOf(skill);
        if (index > -1) {
            currentSkills.splice(index, 1);
        } else {
            currentSkills.push(skill);
        }
        setSeekerData({ ...seekerData, skills: currentSkills });
    };

    const handleEmployerChange = (e) => setEmployerData({ ...employerData, [e.target.name]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (activeTab === 'seeker') {
                // Use FormData for file uploads
                const formData = new FormData();
                let finalSkills = [...seekerData.skills];
                if (finalSkills.includes('other') && seekerData.customSkill) {
                    finalSkills = finalSkills.filter(s => s !== 'other');
                    finalSkills.push(seekerData.customSkill);
                }

                // Append all text fields
                Object.keys(seekerData).forEach(key => {
                    if (key !== 'profilePhoto' && key !== 'idDocument' && key !== 'skills') {
                        formData.append(key, seekerData[key]);
                    }
                });

                // Append complex/special fields
                formData.append('skills', JSON.stringify(finalSkills));
                if (seekerData.profilePhoto) formData.append('profilePhoto', seekerData.profilePhoto);
                if (seekerData.idDocument) formData.append('idDocument', seekerData.idDocument);

                await authService.register(formData, 'seeker');
                navigate('/dashboard/seeker');
            } else {
                const formData = new FormData();

                // Append all fields
                Object.keys(employerData).forEach(key => {
                    if (key === 'familySize') {
                        const val = employerData.employerType === 'HOUSEHOLD' ? parseInt(employerData.familySize) : null;
                        if (val !== null) formData.append(key, val);
                    } else if (employerData[key] !== null && employerData[key] !== undefined) {
                        formData.append(key, employerData[key]);
                    }
                });

                await authService.register(formData, 'employer');
                navigate('/dashboard/employer');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed.');
            window.scrollTo(0, 0);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '800px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--primary)' }}>{t('create_account_title')}</h2>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
                <div className="tabs-container" style={{ display: 'flex', background: '#f0f0f0', borderRadius: '12px', padding: '5px', width: '100%', maxWidth: '400px' }}>
                    <button
                        type="button"
                        onClick={() => setActiveTab('seeker')}
                        style={{
                            flex: 1, padding: '12px',
                            background: activeTab === 'seeker' ? 'white' : 'transparent',
                            color: activeTab === 'seeker' ? 'var(--primary)' : '#666',
                            boxShadow: activeTab === 'seeker' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
                            borderRadius: '8px', fontWeight: 'bold'
                        }}
                    >
                        {t('i_am_worker')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('employer')}
                        style={{
                            flex: 1, padding: '12px',
                            background: activeTab === 'employer' ? 'white' : 'transparent',
                            color: activeTab === 'employer' ? 'var(--primary)' : '#666',
                            boxShadow: activeTab === 'employer' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
                            borderRadius: '8px', fontWeight: 'bold'
                        }}
                    >
                        {t('i_am_employer')}
                    </button>
                </div>
            </div>

            {error && (
                <div style={{ background: '#ffeeee', color: '#cc0000', padding: '15px', borderRadius: '8px', marginBottom: '30px', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            <div className="card">
                <form onSubmit={handleRegister}>
                    {activeTab === 'seeker' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                            <div>
                                <label className="label">{t('full_name')}</label>
                                <input required className="input" name="fullName" value={seekerData.fullName} onChange={handleSeekerChange} placeholder={t('enter_full_name')} />
                            </div>
                            <div>
                                <label className="label">{t('phone_number')}</label>
                                <input required className="input" name="phone" value={seekerData.phone} onChange={handleSeekerChange} placeholder="+251..." />
                            </div>
                            <div>
                                <label className="label">{t('email_address')}</label>
                                <input required type="email" className="input" name="email" value={seekerData.email} onChange={handleSeekerChange} placeholder="email@example.com" />
                            </div>
                            <div>
                                <label className="label">{t('password')}</label>
                                <input required type="password" className="input" name="password" value={seekerData.password} onChange={handleSeekerChange} placeholder={t('create_password')} />
                            </div>
                            <div>
                                <label className="label">{t('gender')}</label>
                                <select className="input" name="gender" value={seekerData.gender} onChange={handleSeekerChange}>
                                    <option value="FEMALE">{t('female')}</option>
                                    <option value="MALE">{t('male')}</option>
                                    <option value="OTHER">{t('other_gender')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">{t('age')}</label>
                                <input required type="number" className="input" name="age" value={seekerData.age} onChange={handleSeekerChange} placeholder={t('age_example')} />
                            </div>
                            <div>
                                <label className="label">{t('marital_status')}</label>
                                <select className="input" name="maritalStatus" value={seekerData.maritalStatus} onChange={handleSeekerChange}>
                                    <option value="SINGLE">{t('single')}</option>
                                    <option value="MARRIED">{t('married')}</option>
                                    <option value="DIVORCED">{t('divorced')}</option>
                                    <option value="WIDOWED">{t('widowed')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">{t('religion')}</label>
                                <input className="input" name="religion" value={seekerData.religion} onChange={handleSeekerChange} placeholder={t('optional')} />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label className="label">{t('skills_select_multiple')}</label>
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
                                                checked={seekerData.skills.includes(key)}
                                                onChange={() => handleSkillToggle(key)}
                                            />
                                            {value}
                                        </label>
                                    ))}
                                </div>
                                {seekerData.skills.includes('other') && (
                                    <div style={{ marginTop: '10px' }}>
                                        <input
                                            className="input"
                                            name="customSkill"
                                            value={seekerData.customSkill}
                                            onChange={handleSeekerChange}
                                            placeholder={t('specify_other')}
                                            required
                                        />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="label">{t('experience_years')}</label>
                                <input required type="number" className="input" name="experienceYears" value={seekerData.experienceYears} onChange={handleSeekerChange} placeholder="0" />
                            </div>
                            <div>
                                <label className="label">{t('expected_salary')}</label>
                                <input required type="number" className="input" name="expectedSalary" value={seekerData.expectedSalary} onChange={handleSeekerChange} placeholder="3000" />
                            </div>
                            <div>
                                <label className="label">{t('preferred_arrangement')}</label>
                                <select className="input" name="preferredArrangement" value={seekerData.preferredArrangement} onChange={handleSeekerChange}>
                                    <option value="LIVE_IN">{t('live_in')}</option>
                                    <option value="LIVE_OUT">{t('live_out')}</option>
                                    <option value="PART_TIME">{t('part_time')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">{t('preferred_location')}</label>
                                <input required className="input" name="preferredLocation" value={seekerData.preferredLocation} onChange={handleSeekerChange} placeholder={t('location_placeholder')} />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label className="label">{t('bio_about_me')}</label>
                                <textarea className="input" name="bio" value={seekerData.bio} onChange={handleSeekerChange} style={{ minHeight: '100px' }} placeholder={t('tell_about_yourself')} />
                            </div>

                            {/* Document Uploads */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '15px 0' }} />
                                <h4 style={{ marginBottom: '15px', color: '#444' }}>{t('security_verification')}</h4>
                            </div>

                            <div>
                                <label className="label">{t('profile_photo')} <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    required
                                    type="file"
                                    className="input"
                                    name="profilePhoto"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>{t('upload_photo_msg')}</p>
                            </div>

                            <div>
                                <label className="label">{t('id_passport')}</label>
                                <input
                                    type="file"
                                    className="input"
                                    name="idDocument"
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                />
                                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>{t('upload_id_msg')}</p>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                            <div>
                                <label className="label">{t('employer_type')}</label>
                                <select className="input" name="employerType" value={employerData.employerType} onChange={handleEmployerChange}>
                                    <option value="HOUSEHOLD">{t('private_household')}</option>
                                    <option value="BUSINESS">{t('business_type')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">{t('contact_person_name')}</label>
                                <input required className="input" name="contactName" value={employerData.contactName} onChange={handleEmployerChange} placeholder={t('full_name')} />
                            </div>
                            <div>
                                <label className="label">{t('phone_number')}</label>
                                <input required className="input" name="phone" value={employerData.phone} onChange={handleEmployerChange} placeholder="+251..." />
                            </div>
                            <div>
                                <label className="label">{t('email_address')}</label>
                                <input required type="email" className="input" name="email" value={employerData.email} onChange={handleEmployerChange} placeholder="email@example.com" />
                            </div>
                            <div>
                                <label className="label">{t('password')}</label>
                                <input required type="password" className="input" name="password" value={employerData.password} onChange={handleEmployerChange} placeholder={t('create_password')} />
                            </div>
                            <div>
                                <label className="label">{t('address_location')}</label>
                                <input required className="input" name="address" value={employerData.address} onChange={handleEmployerChange} placeholder={t('city_subcity')} />
                            </div>
                            {employerData.employerType === 'HOUSEHOLD' && (
                                <div>
                                    <label className="label">{t('family_size')}</label>
                                    <input required type="number" className="input" name="familySize" value={employerData.familySize} onChange={handleEmployerChange} placeholder={t('number_family_members')} />
                                </div>
                            )}

                            {/* Document Uploads for Employer */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '15px 0' }} />
                                <h4 style={{ marginBottom: '15px', color: '#444' }}>{t('security_verification')} {t('optional')}</h4>
                            </div>

                            <div>
                                <label className="label">{t('profile_photo')}</label>
                                <input
                                    type="file"
                                    className="input"
                                    name="profilePhoto"
                                    accept="image/*"
                                    onChange={(e) => setEmployerData({ ...employerData, profilePhoto: e.target.files[0] })}
                                />
                                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>{t('upload_photo_msg')}</p>
                            </div>

                            <div>
                                <label className="label">{t('id_passport')}</label>
                                <input
                                    type="file"
                                    className="input"
                                    name="idDocument"
                                    accept="image/*,.pdf"
                                    onChange={(e) => setEmployerData({ ...employerData, idDocument: e.target.files[0] })}
                                />
                                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>{t('upload_id_msg')}</p>
                            </div>
                        </div>
                    )}

                    <div style={{ margin: '20px 0', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <input
                            type="checkbox"
                            required
                            id="termsConsent"
                            style={{ marginTop: '5px' }}
                        />
                        <label htmlFor="termsConsent" style={{ fontSize: '0.9rem', color: '#555' }}>
                            {t('i_agree_to')} <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{t('terms_and_conditions')}</a> {t('and')} <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{t('privacy_policy')}</a>.
                        </label>
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? t('creating_account') : t('register_now')}
                    </button>
                </form>
            </div>

            <style>{`
        .label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          font-size: 0.9rem;
        }
        .input {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #ddd;
          font-size: 1rem;
          font-family: inherit;
        }
        .input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(255, 69, 0, 0.1);
        }
      `}</style>
        </div>
    );
};

export default Register;
