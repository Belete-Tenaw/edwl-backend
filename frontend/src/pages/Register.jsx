import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { compressImage } from '../utils/compression';
import { validateAndFormatPhone } from '../utils/validation';
import { processVideoBio } from '../utils/videoProcessor';
import { Camera, Video, LogIn } from 'lucide-react';
import MediaUploader from '../components/MediaUploader';

const Register = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('seeker'); // seeker, employer
    const [loading, setLoading] = useState(false);
    const [compressing, setCompressing] = useState(false);
    const [error, setError] = useState('');
    const [isDuplicate, setIsDuplicate] = useState(false);
    const [duplicateField, setDuplicateField] = useState('');
    const [success, setSuccess] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [showVideoRecorder, setShowVideoRecorder] = useState(false);

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
        locationRegion: '',
        locationZone: '',
        locationWoreda: '',
        locationKebele: '',
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
        healthCertificateUrlPreview: null,
        videoBio: null,
        videoBioPreview: null,
        referralCodeUsed: ''
    });

    const [employerData, setEmployerData] = useState({
        employerType: 'HOUSEHOLD',
        contactName: '',
        phone: '',
        email: '',
        password: '',
        address: '',
        locationRegion: '',
        locationZone: '',
        locationWoreda: '',
        locationKebele: '',
        familySize: '',
        referralCodeUsed: ''
    });

    const seekerDataRef = useRef(seekerData);
    useEffect(() => {
        seekerDataRef.current = seekerData;
    }, [seekerData]);

    // Memory cleanup for preview URLs on unmount ONLY
    useEffect(() => {
        return () => {
            const previewFields = [
                'profilePhotoPreview', 'idDocumentPreview', 'nationalIdUrlPreview',
                'guarantorIdUrlPreview', 'policeClearanceUrlPreview', 'healthCertificateUrlPreview',
                'videoBioPreview'
            ];
            previewFields.forEach(field => {
                if (seekerDataRef.current[field]) {
                    URL.revokeObjectURL(seekerDataRef.current[field]);
                }
            });
        };
    }, []); // Clean up references using stable ref

    const handleSeekerChange = useCallback((e) => {
        const { name, value } = e.target;
        setSeekerData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSeekerBlur = useCallback((e) => {
        const { name, value } = e.target;
        if (name === 'phone' && value) {
            const validation = validateAndFormatPhone(value);
            if (validation.isValid) {
                setSeekerData(prev => ({ ...prev, phone: validation.formatted }));
            }
        }
    }, []);

    const handleMediaCapture = useCallback(async (name, file, previewUrl) => {
        if (!file) return;

        try {
            let processedFile = file;
            let processedPreview = previewUrl;


            if (file.type.startsWith('image/')) {
                setCompressing(true);
                processedFile = await compressImage(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.8 });
                if (processedFile !== file) URL.revokeObjectURL(previewUrl);
                processedPreview = URL.createObjectURL(processedFile);
                setCompressing(false);
            } else if (file.type.startsWith('video/')) {
                setLoading(true);
                const result = await processVideoBio(file);
                if (result.file !== file) URL.revokeObjectURL(previewUrl);
                processedFile = result.file;
                processedPreview = URL.createObjectURL(processedFile);
                setLoading(false);
            }

            setSeekerData(prev => {
                // Ensure we clean up the previous object URL safely using functional state update
                if (prev[`${name}Preview`] && prev[`${name}Preview`] !== processedPreview) {
                    URL.revokeObjectURL(prev[`${name}Preview`]);
                }
                return {
                    ...prev,
                    [name]: processedFile,
                    [`${name}Preview`]: processedPreview
                };
            });
        } catch (err) {
            console.error(`Error processing ${name}:`, err);
            setError(err.message || "Failed to process media.");
            setCompressing(false);
            setLoading(false);
        }
    }, [seekerData]);

    const handleSkillToggle = useCallback((skill) => {
        setSeekerData(prev => {
            const currentSkills = [...prev.skills];
            const index = currentSkills.indexOf(skill);
            if (index > -1) {
                currentSkills.splice(index, 1);
            } else {
                currentSkills.push(skill);
            }
            return { ...prev, skills: currentSkills };
        });
    }, []);

    const handleLanguageToggle = useCallback((language) => {
        setSeekerData(prev => {
            const currentLanguages = [...prev.languages];
            const index = currentLanguages.indexOf(language);
            if (index > -1) {
                currentLanguages.splice(index, 1);
            } else {
                currentLanguages.push(language);
            }
            return { ...prev, languages: currentLanguages };
        });
    }, []);

    const handleEmployerChange = useCallback((e) => {
        const { name, value } = e.target;
        setEmployerData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleEmployerBlur = useCallback((e) => {
        const { name, value } = e.target;
        if (name === 'phone' && value) {
            const validation = validateAndFormatPhone(value);
            if (validation.isValid) {
                setEmployerData(prev => ({ ...prev, phone: validation.formatted }));
            }
        }
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            

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

                if (seekerData.password.length < 6) {
                    setError("Password must be at least 6 characters long.");
                    setLoading(false);
                    window.scrollTo(0, 0);
                    return;
                }

                if (seekerData.phone) {
                    const validation = validateAndFormatPhone(seekerData.phone);
                    if (!validation.isValid) {
                        setError(validation.error);
                        setLoading(false);
                        window.scrollTo(0, 0);
                        return;
                    }
                    seekerData.phone = validation.formatted;
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

                // Append all text fields (EXCEPT files and previews — those are handled below)
                const FILE_FIELDS = ['profilePhoto', 'idDocument', 'nationalIdUrl', 'guarantorIdUrl', 'policeClearanceUrl', 'healthCertificateUrl', 'videoBio'];
                const PREVIEW_FIELDS = ['profilePhotoPreview', 'idDocumentPreview', 'nationalIdUrlPreview', 'guarantorIdUrlPreview', 'policeClearanceUrlPreview', 'healthCertificateUrlPreview', 'videoBioPreview'];
                const EXCLUDED_KEYS = [...FILE_FIELDS, ...PREVIEW_FIELDS, 'skills', 'languages', 'customSkill', 'customLanguage'];

                Object.keys(seekerData).forEach(key => {
                    if (!EXCLUDED_KEYS.includes(key) && seekerData[key] !== null && seekerData[key] !== undefined && seekerData[key] !== '') {
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
                if (seekerData.videoBio) formData.append('videoBio', seekerData.videoBio);
                if (seekerData.guarantorPhone) formData.append('guarantorPhone', seekerData.guarantorPhone);

                
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

                if (employerData.password.length < 6) {
                    setError("Password must be at least 6 characters long.");
                    setLoading(false);
                    window.scrollTo(0, 0);
                    return;
                }

                if (employerData.phone) {
                    const validation = validateAndFormatPhone(employerData.phone);
                    if (!validation.isValid) {
                        setError(validation.error);
                        setLoading(false);
                        window.scrollTo(0, 0);
                        return;
                    }
                    employerData.phone = validation.formatted;
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

                
                await authService.register(formData, 'employer');
                setSuccess(true);
                setTimeout(() => navigate('/dashboard/employer'), 3000);
            }
        } catch (err) {
            console.error("Full Registration Error Object:", err);
            // Detect duplicate account (409)
            if (err.response?.status === 409) {
                const field = err.response?.data?.duplicateField || 'email';
                setIsDuplicate(true);
                setDuplicateField(field);
                setError('');
            } else {
                const backendError = err.response?.data?.error || err.response?.data?.message;
                const message = backendError || err.message || 'Registration failed.';
                setIsDuplicate(false);
                setError(message);
            }
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

            {/* Returning User Nudge */}
            <div style={{ 
                background: '#fff', 
                padding: '20px', 
                borderRadius: '16px', 
                marginBottom: '40px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                border: '1px solid #f0f0f0'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: '#fff0e6', padding: '10px', borderRadius: '12px' }}>
                        <LogIn size={24} color="var(--primary)" />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{t('returning_user') || 'Already have an account?'}</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{t('signin_to_continue') || 'Sign in to access your profile instantly.'}</p>
                    </div>
                </div>
                <Link to="/login" className="btn-login" style={{ padding: '12px 30px' }}>
                    {t('login')}
                </Link>
            </div>

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

            {/* Duplicate account banner — polite guidance with action buttons */}
            {isDuplicate && (
                <div className="duplicate-banner">
                    <h4>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        {t('duplicate_account_title') || 'Account Already Exists'}
                    </h4>
                    <p>
                        {duplicateField === 'phone'
                            ? (t('duplicate_phone_msg') || 'This phone number is already registered in EDWL.')
                            : (t('duplicate_email_msg') || 'This email address is already registered in EDWL.')}
                        <br />
                        {t('duplicate_account_guidance') || 'Please log in to your account or reset your password if you forgot it.'}
                    </p>
                    <div className="duplicate-banner-actions">
                        <Link
                            to={`/login?duplicate=1&field=${duplicateField}&identifier=${activeTab === 'seeker' ? (duplicateField === 'email' ? seekerData.email : seekerData.phone) : (duplicateField === 'email' ? employerData.email : employerData.phone)}`}
                            className="btn-login"
                            id="dup-login-btn"
                            style={{ padding: '12px 24px', fontSize: '1rem', border: 'none' }}
                        >
                            {t('login_instead') || 'Log In'}
                        </Link>
                        <Link
                            to="/forgot-password"
                            className="btn-ghost"
                            id="dup-forgot-btn"
                            style={{ 
                                padding: '12px 24px', 
                                fontSize: '1rem', 
                                background: '#f8f9fa', 
                                color: '#333', 
                                border: '1px solid #ddd',
                                borderRadius: '8px'
                            }}
                        >
                            {t('forgot_password') || 'Forgot Password?'}
                        </Link>
                    </div>
                </div>
            )}

            {/* Generic error */}
            {!isDuplicate && error && (
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
                                <input className="input" name="phone" value={seekerData.phone} onChange={handleSeekerChange} onBlur={handleSeekerBlur} placeholder="+251..." autoComplete="off" />
                            </div>
                            <div>
                                <label className="label">{t('email_address')} {t('optional')}</label>
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
                            <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label className="label">{t('region') || 'Region'}</label>
                                    <input className="input" name="locationRegion" value={seekerData.locationRegion} onChange={handleSeekerChange} placeholder="e.g. Addis Ababa" />
                                </div>
                                <div>
                                    <label className="label">{t('woreda') || 'Woreda'}</label>
                                    <input className="input" name="locationWoreda" value={seekerData.locationWoreda} onChange={handleSeekerChange} placeholder="e.g. Bole" />
                                </div>
                            </div>
                            <div>
                                <label className="label">{t('preferred_location') || 'General Preferred Location'}</label>
                                <input required className="input" name="preferredLocation" value={seekerData.preferredLocation} onChange={handleSeekerChange} placeholder={t('location_placeholder')} />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label className="label">{t('bio_about_me')}</label>
                                <textarea className="input" name="bio" value={seekerData.bio} onChange={handleSeekerChange} style={{ minHeight: '100px' }} placeholder={t('tell_about_yourself')} />
                            </div>

                            <div style={{ gridColumn: '1 / -1' }}>
                                <MediaUploader
                                    type="video"
                                    label={t('video_bio')}
                                    id="videoBio"
                                    previewUrl={seekerData.videoBioPreview}
                                    onFileSelect={(file, url) => handleMediaCapture('videoBio', file, url)}
                                />
                                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '-10px' }}>{t('video_bio_msg') || 'Record a video introducing yourself (up to 20 minutes) to employers.'}</p>
                            </div>

                            {/* Document Uploads */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '15px 0' }} />
                                <h4 style={{ marginBottom: '15px', color: '#444' }}>{t('security_verification')}</h4>
                            </div>

                            <div>
                                <MediaUploader
                                    type="image"
                                    label={t('profile_photo')}
                                    id="profilePhoto"
                                    required={true}
                                    captureMode="user"
                                    previewUrl={seekerData.profilePhotoPreview}
                                    onFileSelect={(file, url) => handleMediaCapture('profilePhoto', file, url)}
                                />
                                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '-10px' }}>{t('upload_photo_msg')}</p>
                            </div>

                            <div>
                                <MediaUploader
                                    type="image"
                                    label={t('id_passport')}
                                    id="idDocument"
                                    required={true}
                                    previewUrl={seekerData.idDocumentPreview}
                                    onFileSelect={(file, url) => handleMediaCapture('idDocument', file, url)}
                                />
                                {seekerData.idDocument?.name?.toLowerCase().endsWith('.pdf') && (
                                    <p style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '-10px' }}>📄 PDF Selected</p>
                                )}
                                <p style={{ fontSize: '0.8rem', color: '#ff4d4d', fontWeight: '600', marginTop: '-10px' }}>{t('id_mandatory_msg')}</p>
                            </div>

                            {/* Optional Verification Section */}
                            <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
                                <div style={{ background: '#f0f7ff', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #007bff', marginBottom: '20px' }}>
                                    <h5 style={{ margin: '0 0 5px 0', color: '#0056b3' }}>{t('optional_rank_msg')}</h5>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>{t('platinum_incentive_msg')}</p>
                                </div>
                            </div>

                            <div>
                                <MediaUploader
                                    type="image"
                                    label={t('national_id_fayda') + ' ' + t('optional')}
                                    id="nationalIdUrl"
                                    previewUrl={seekerData.nationalIdUrlPreview}
                                    onFileSelect={(file, url) => handleMediaCapture('nationalIdUrl', file, url)}
                                />
                            </div>

                            <div>
                                <MediaUploader
                                    type="image"
                                    label={t('guarantor_id') + ' ' + t('optional')}
                                    id="guarantorIdUrl"
                                    previewUrl={seekerData.guarantorIdUrlPreview}
                                    onFileSelect={(file, url) => handleMediaCapture('guarantorIdUrl', file, url)}
                                />
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
                                <MediaUploader
                                    type="image"
                                    label={t('police_clearance') + ' ' + t('optional')}
                                    id="policeClearanceUrl"
                                    previewUrl={seekerData.policeClearanceUrlPreview}
                                    onFileSelect={(file, url) => handleMediaCapture('policeClearanceUrl', file, url)}
                                />
                            </div>

                            <div>
                                <MediaUploader
                                    type="image"
                                    label={t('health_certificate') + ' ' + t('optional')}
                                    id="healthCertificateUrl"
                                    previewUrl={seekerData.healthCertificateUrlPreview}
                                    onFileSelect={(file, url) => handleMediaCapture('healthCertificateUrl', file, url)}
                                />
                            </div>


                            <div style={{ gridColumn: '1 / -1', background: '#FFF5F0', padding: '15px', borderRadius: '8px', border: '1px solid var(--primary)', marginTop: '10px' }}>
                                <p style={{ margin: 0, color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                    ✨ {t('platinum_incentive_msg')}
                                </p>
                            </div>

                            <div style={{ gridColumn: '1 / -1', padding: '20px', background: '#f8fafc', borderRadius: '12px', marginTop: '10px', border: '1px solid #e2e8f0' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>
                                    {t('referral_code_optional')}
                                </label>
                                <input
                                    type="text"
                                    name="referralCodeUsed"
                                    value={seekerData.referralCodeUsed}
                                    onChange={handleSeekerChange}
                                    placeholder="e.g. BARK123"
                                    style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '1rem', outline: 'none' }}
                                />
                                <p style={{ marginTop: '8px', fontSize: '0.8rem', color: '#64748b' }}>
                                    {t('referral_bonus_msg')}
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
                                <input className="input" name="phone" value={employerData.phone} onChange={handleEmployerChange} onBlur={handleEmployerBlur} placeholder="+251..." autoComplete="off" />
                            </div>
                            <div>
                                <label className="label">{t('email_address')} {t('optional')}</label>
                                <input type="email" className="input" name="email" value={employerData.email} onChange={handleEmployerChange} placeholder="email@example.com" autoComplete="off" />
                            </div>
                            <div>
                                <label className="label">{t('password')}</label>
                                <input required type="password" className="input" name="password" value={employerData.password} onChange={handleEmployerChange} placeholder={t('create_password')} autoComplete="new-password" />
                            </div>
                            <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label className="label">{t('region') || 'Region'}</label>
                                    <input className="input" name="locationRegion" value={employerData.locationRegion} onChange={handleEmployerChange} placeholder="Addis Ababa" />
                                </div>
                                <div>
                                    <label className="label">{t('woreda') || 'Woreda'}</label>
                                    <input className="input" name="locationWoreda" value={employerData.locationWoreda} onChange={handleEmployerChange} placeholder="Bole" />
                                </div>
                            </div>
                            <div>
                                <label className="label">{t('exact_address_landmark') || 'Exact Address / Landmark'}</label>
                                <input required className="input" name="address" value={employerData.address} onChange={handleEmployerChange} placeholder={t('city_subcity')} />
                            </div>
                            {employerData.employerType === 'HOUSEHOLD' && (
                                <div>
                                    <label className="label">{t('family_size')}</label>
                                    <input required type="number" className="input" name="familySize" value={employerData.familySize} onChange={handleEmployerChange} placeholder={t('number_family_members')} />
                                </div>
                            )}

                            <div style={{ gridColumn: '1 / -1', padding: '20px', background: '#f8fafc', borderRadius: '12px', marginTop: '10px', border: '1px solid #e2e8f0' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>
                                    {t('referral_code_optional')}
                                </label>
                                <input
                                    type="text"
                                    name="referralCodeUsed"
                                    value={employerData.referralCodeUsed}
                                    onChange={handleEmployerChange}
                                    placeholder="e.g. BARK123"
                                    style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '1rem', outline: 'none' }}
                                />
                                <p style={{ marginTop: '8px', fontSize: '0.8rem', color: '#64748b' }}>
                                    {t('referral_bonus_msg')}
                                </p>
                            </div>
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
                    
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <p style={{ color: '#666', fontSize: '0.95rem' }}>
                            {t('returning_user') || 'Already have an account?'}{' '}
                            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>
                                {t('login')}
                            </Link>
                        </p>
                    </div>
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
                UI Version: 1.4.0-FORM_FIX
            </div>
        </div>
    );
};

export default Register;

