import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { compressImage } from '../utils/compression';

const Register = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('seeker'); // seeker, employer
    const [loading, setLoading] = useState(false);
    const [compressing, setCompressing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);

    const [seekerData, setSeekerData] = useState({
        fullName: '',
        phone: '',
        email: '',
        password: '',
        gender: 'FEMALE',
        age: '',
        maritalStatus: 'SINGLE',
        religion: '',
        skills: [],
        customSkill: '',
        languages: [],
        customLanguage: '',
        experienceYears: '',
        expectedSalary: '',
        preferredArrangement: 'LIVE_IN',
        preferredLocation: '',
        bio: '',
        profilePhoto: null,
        profilePhotoPreview: null,
        idDocument: null,
        idDocumentPreview: null,
        nationalIdUrl: null,
        nationalIdUrlPreview: null,
        guarantorIdUrl: null,
        guarantorIdUrlPreview: null,
        guarantorPhone: '',
        policeClearanceUrl: null,
        policeClearanceUrlPreview: null,
        healthCertificateUrl: null,
        healthCertificateUrlPreview: null
    });

    const [employerData, setEmployerData] = useState({
        employerType: 'HOUSEHOLD',
        contactName: '',
        phone: '',
        email: '',
        password: '',
        address: '',
        familySize: ''
    });

    const handleSeekerChange = (e) => setSeekerData({ ...seekerData, [e.target.name]: e.target.value });

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            let processedFile = file;
            if (file.type.startsWith('image/')) {
                setCompressing(true);
                processedFile = await compressImage(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.8 });
                console.log(`Compressed ${file.name}: ${(file.size / 1024).toFixed(1)}KB -> ${(processedFile.size / 1024).toFixed(1)}KB`);
                setCompressing(false);
            }

            setSeekerData({
                ...seekerData,
                [e.target.name]: processedFile,
                [`${e.target.name}Preview`]: URL.createObjectURL(processedFile)
            });
        } catch (err) {
            console.error("Compression error:", err);
            // Fallback to original file if compression fails
            setSeekerData({
                ...seekerData,
                [e.target.name]: file,
                [`${e.target.name}Preview`]: URL.createObjectURL(file)
            });
            setCompressing(false);
        }
    };
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

    const handleLanguageToggle = (language) => {
        const currentLanguages = [...seekerData.languages];
        const index = currentLanguages.indexOf(language);
        if (index > -1) {
            currentLanguages.splice(index, 1);
        } else {
            currentLanguages.push(language);
        }
        setSeekerData({ ...seekerData, languages: currentLanguages });
    };

    const handleEmployerChange = (e) => setEmployerData({ ...employerData, [e.target.name]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log("Registration process started...");

            if (!termsAccepted) {
                setError(t('must_accept_terms'));
                setLoading(false);
                window.scrollTo(0, 0);
                return;
            }

            if (activeTab === 'seeker') {
                // Pre-submission validation for Seeker
                const requiredFields = [
                    { key: 'fullName', label: t('full_name') },
                    { key: 'phone', label: t('phone_number'), condition: !seekerData.email },
                    { key: 'email', label: t('email_address'), condition: !seekerData.phone },
                    { key: 'age', label: t('age') },
                    { key: 'password', label: t('password') },
                    { key: 'experienceYears', label: t('experience_years') },
                    { key: 'expectedSalary', label: t('expected_salary') },
                    { key: 'preferredLocation', label: t('preferred_location') },
                    { key: 'profilePhoto', label: t('profile_photo') },
                    { key: 'idDocument', label: t('id_passport') }
                ];

                const missing = requiredFields.filter(f => {
                    const value = seekerData[f.key];
                    const isMissing = !value || (typeof value === 'string' && value.trim() === '');
                    const conditionMet = f.condition !== undefined ? f.condition : true;
                    return isMissing && conditionMet;
                });

                if (missing.length > 0) {
                    const missingLabels = missing.map(f => f.label).join(', ');
                    setError(`${t('missing_required_fields')}: ${missingLabels}`);
                    setLoading(false);
                    window.scrollTo(0, 0);
                    return;
                }

                // Use FormData for file uploads
                const formData = new FormData();
                let finalSkills = [...seekerData.skills];
                if (finalSkills.includes('other') && seekerData.customSkill) {
                    finalSkills = finalSkills.filter(s => s !== 'other');
                    finalSkills.push(seekerData.customSkill);
                }

                let finalLanguages = [...seekerData.languages];
                if (finalLanguages.includes('other') && seekerData.customLanguage) {
                    finalLanguages = finalLanguages.filter(l => l !== 'other');
                    finalLanguages.push(seekerData.customLanguage);
                }

                // Append all text fields (EXCEPT previews)
                Object.keys(seekerData).forEach(key => {
                    if (!['profilePhoto', 'idDocument', 'skills', 'languages', 'profilePhotoPreview', 'idDocumentPreview', 'customSkill', 'customLanguage'].includes(key)) {
                        formData.append(key, seekerData[key]);
                    }
                });

                // Append complex/special fields
                formData.append('skills', JSON.stringify(finalSkills));
                formData.append('languages', JSON.stringify(finalLanguages));
                if (seekerData.profilePhoto) formData.append('profilePhoto', seekerData.profilePhoto);
                if (seekerData.idDocument) formData.append('idDocument', seekerData.idDocument);
                if (seekerData.nationalIdUrl) formData.append('nationalIdUrl', seekerData.nationalIdUrl);
                if (seekerData.guarantorIdUrl) formData.append('guarantorIdUrl', seekerData.guarantorIdUrl);
                if (seekerData.policeClearanceUrl) formData.append('policeClearanceUrl', seekerData.policeClearanceUrl);
                if (seekerData.healthCertificateUrl) formData.append('healthCertificateUrl', seekerData.healthCertificateUrl);
                if (seekerData.guarantorPhone) formData.append('guarantorPhone', seekerData.guarantorPhone);

                console.log("Sending Seeker Registration FormData...");
                await authService.register(formData, 'seeker');
                setSuccess(true);
                setTimeout(() => navigate('/dashboard/seeker'), 3000);
            } else {
                // Pre-submission validation for Employer
                if (!employerData.phone && !employerData.email) {
                    setError(t('email_or_phone_required'));
                    setLoading(false);
                    window.scrollTo(0, 0);
                    return;
                }

                const formData = new FormData();
                Object.keys(employerData).forEach(key => {
                    if (key === 'familySize') {
                        const val = employerData.employerType === 'HOUSEHOLD' ? parseInt(employerData.familySize) : null;
                        if (val !== null) formData.append(key, val);
                    } else if (employerData[key] !== null && employerData[key] !== undefined) {
                        formData.append(key, employerData[key]);
                    }
                });

                console.log("Sending Employer Registration FormData...");
                await authService.register(formData, 'employer');
                setSuccess(true);
                setTimeout(() => navigate('/dashboard/employer'), 3000);
            }
        } catch (err) {
            console.error("Full Registration Error Object:", err);
            const backendError = err.response?.data?.error || err.response?.data?.message;
            const message = backendError || err.message || 'Registration failed.';
            setError(message);
            window.scrollTo(0, 0);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
                <div className="card" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px' }}>
                    <div style={{ background: '#e8f5e9', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <h2 style={{ color: '#2e7d32', marginBottom: '15px' }}>{t('registration_success')}</h2>
                    <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '30px' }}>{t('redirecting_dashboard')}</p>
                    <div className="loading-bar" style={{ height: '4px', background: '#eee', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: '100%', height: '100%', background: 'var(--primary)', animation: 'progress 3s linear' }}></div>
                    </div>
                </div>
                <style>{`
                    @keyframes progress {
                        from { width: 0; }
                        to { width: 100%; }
                    }
                `}</style>
            </div>
        );
    }

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
                                <input required className="input" name="fullName" value={seekerData.fullName} onChange={handleSeekerChange} placeholder={t('enter_full_name')} autoComplete="off" />
                            </div>
                            <div>
                                <label className="label">{t('phone_number')}</label>
                                <input className="input" name="phone" value={seekerData.phone} onChange={handleSeekerChange} placeholder="+251..." autoComplete="off" />
                            </div>
                            <div>
                                <label className="label">{t('email_address')}</label>
                                <input type="email" className="input" name="email" value={seekerData.email} onChange={handleSeekerChange} placeholder="email@example.com" autoComplete="off" />
                            </div>
                            <div>
                                <label className="label">{t('password')}</label>
                                <input required type="password" className="input" name="password" value={seekerData.password} onChange={handleSeekerChange} placeholder={t('create_password')} autoComplete="new-password" />
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
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label className="label">{t('select_languages')}</label>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                    gap: '10px',
                                    background: '#f9f9f9',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd'
                                }}>
                                    {Object.entries(t('languages_list', { returnObjects: true })).map(([key, value]) => (
                                        <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={seekerData.languages.includes(key)}
                                                onChange={() => handleLanguageToggle(key)}
                                            />
                                            {value}
                                        </label>
                                    ))}
                                </div>
                                {seekerData.languages.includes('other') && (
                                    <div style={{ marginTop: '10px' }}>
                                        <input
                                            className="input"
                                            name="customLanguage"
                                            value={seekerData.customLanguage}
                                            onChange={handleSeekerChange}
                                            placeholder={t('specify_other_language')}
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
                                    capture="environment"
                                    onChange={handleFileChange}
                                />
                                {seekerData.profilePhotoPreview && (
                                    <div style={{ marginTop: '10px', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                                        <img src={seekerData.profilePhotoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}
                                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>{t('upload_photo_msg')}</p>
                            </div>

                            <div>
                                <label className="label">{t('id_passport')} <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    required
                                    type="file"
                                    className="input"
                                    name="idDocument"
                                    accept="image/*,.pdf"
                                    capture="environment"
                                    onChange={handleFileChange}
                                />
                                {seekerData.idDocumentPreview && !seekerData.idDocument?.name?.toLowerCase().endsWith('.pdf') && (
                                    <div style={{ marginTop: '10px', width: '160px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                                        <img src={seekerData.idDocumentPreview} alt="ID Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}
                                {seekerData.idDocument?.name?.toLowerCase().endsWith('.pdf') && (
                                    <p style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '5px' }}>📄 PDF Selected</p>
                                )}
                                <p style={{ fontSize: '0.8rem', color: '#FF4500', fontWeight: 'bold', marginTop: '5px' }}>{t('id_mandatory_msg')}</p>
                            </div>

                            {/* Optional Verification Section */}
                            <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
                                <div style={{ background: '#f0f7ff', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #007bff', marginBottom: '20px' }}>
                                    <h5 style={{ margin: '0 0 5px 0', color: '#0056b3' }}>{t('optional_rank_msg')}</h5>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>{t('platinum_incentive_msg')}</p>
                                </div>
                            </div>

                            <div>
                                <label className="label">{t('national_id_fayda')} {t('optional')}</label>
                                <input
                                    type="file"
                                    className="input"
                                    name="nationalIdUrl"
                                    accept="image/*,.pdf"
                                    capture="environment"
                                    onChange={handleFileChange}
                                />
                                {seekerData.nationalIdUrlPreview && (
                                    <div style={{ marginTop: '10px', width: '100px', height: '60px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #ddd' }}>
                                        <img src={seekerData.nationalIdUrlPreview} alt="Fayda Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="label">{t('guarantor_id')} {t('optional')}</label>
                                <input
                                    type="file"
                                    className="input"
                                    name="guarantorIdUrl"
                                    accept="image/*,.pdf"
                                    capture="environment"
                                    onChange={handleFileChange}
                                />
                                {seekerData.guarantorIdUrlPreview && (
                                    <div style={{ marginTop: '10px', width: '100px', height: '60px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #ddd' }}>
                                        <img src={seekerData.guarantorIdUrlPreview} alt="Guarantor Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="label">{t('guarantor_phone')} {t('optional')}</label>
                                <input
                                    className="input"
                                    name="guarantorPhone"
                                    value={seekerData.guarantorPhone}
                                    onChange={handleSeekerChange}
                                    placeholder="+251..."
                                />
                            </div>

                            <div>
                                <label className="label">{t('police_clearance')} {t('optional')}</label>
                                <input
                                    type="file"
                                    className="input"
                                    name="policeClearanceUrl"
                                    accept="image/*,.pdf"
                                    capture="environment"
                                    onChange={handleFileChange}
                                />
                                {seekerData.policeClearanceUrlPreview && (
                                    <div style={{ marginTop: '10px', width: '100px', height: '60px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #ddd' }}>
                                        <img src={seekerData.policeClearanceUrlPreview} alt="Police Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="label">{t('health_certificate')} {t('optional')}</label>
                                <input
                                    type="file"
                                    className="input"
                                    name="healthCertificateUrl"
                                    accept="image/*,.pdf"
                                    capture="environment"
                                    onChange={handleFileChange}
                                />
                                {seekerData.healthCertificateUrlPreview && (
                                    <div style={{ marginTop: '10px', width: '100px', height: '60px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #ddd' }}>
                                        <img src={seekerData.healthCertificateUrlPreview} alt="Health Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}
                            </div>

                            <div style={{ gridColumn: '1 / -1', background: '#FFF5F0', padding: '15px', borderRadius: '8px', border: '1px border var(--primary)', marginTop: '10px' }}>
                                <p style={{ margin: 0, color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                    ✨ {t('platinum_incentive_msg')}
                                </p>
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
                                <input className="input" name="phone" value={employerData.phone} onChange={handleEmployerChange} placeholder="+251..." autoComplete="off" />
                            </div>
                            <div>
                                <label className="label">{t('email_address')}</label>
                                <input type="email" className="input" name="email" value={employerData.email} onChange={handleEmployerChange} placeholder="email@example.com" autoComplete="off" />
                            </div>
                            <div>
                                <label className="label">{t('password')}</label>
                                <input required type="password" className="input" name="password" value={employerData.password} onChange={handleEmployerChange} placeholder={t('create_password')} autoComplete="new-password" />
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

                        </div>
                    )}

                    <div style={{ margin: '20px 0', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <input
                            type="checkbox"
                            required
                            id="termsConsent"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            style={{ marginTop: '5px' }}
                        />
                        <label htmlFor="termsConsent" style={{ fontSize: '0.9rem', color: '#555' }}>
                            {t('i_agree_to')} <Link to="/terms-and-conditions" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{t('terms_and_conditions')}</Link> {t('and')} <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{t('privacy_policy')}</Link>.
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
            <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#ccc', marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                UI Version: 1.0.7-CACHE-PURGE-REQUIRED
            </div>
        </div>
    );
};

export default Register;
