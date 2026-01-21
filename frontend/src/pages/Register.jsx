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
        phone: '', email: '', password: '', bio: '', skills: '',
        experienceYears: '', expectedSalary: '', preferredLocation: '',
        preferredArrangement: 'LIVE_IN'
    });

    // Employer State
    const [employerData, setEmployerData] = useState({
        employerType: 'HOUSEHOLD', contactName: '', phone: '', email: '',
        password: '', address: '', familySize: ''
    });

    const handleSeekerChange = (e) => setSeekerData({ ...seekerData, [e.target.name]: e.target.value });
    const handleEmployerChange = (e) => setEmployerData({ ...employerData, [e.target.name]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (activeTab === 'seeker') {
                // Data formatting
                const payload = {
                    ...seekerData,
                    age: parseInt(seekerData.age),
                    experienceYears: parseInt(seekerData.experienceYears),
                    expectedSalary: parseInt(seekerData.expectedSalary),
                    skills: seekerData.skills.split(',').map(s => s.trim()).filter(s => s)
                };
                await authService.register(payload, 'seeker');
                navigate('/dashboard/seeker');
            } else {
                const payload = {
                    ...employerData,
                    familySize: employerData.employerType === 'HOUSEHOLD' ? parseInt(employerData.familySize) : null
                };
                await authService.register(payload, 'employer');
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
            <h2 style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--primary)' }}>Create an Account</h2>

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
                        I am a Job Seeker
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
                        I am an Employer
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
                                <label className="label">Full Name</label>
                                <input required className="input" name="fullName" value={seekerData.fullName} onChange={handleSeekerChange} placeholder="Enter full name" />
                            </div>
                            <div>
                                <label className="label">Phone Number</label>
                                <input required className="input" name="phone" value={seekerData.phone} onChange={handleSeekerChange} placeholder="+251..." />
                            </div>
                            <div>
                                <label className="label">Email Address</label>
                                <input required type="email" className="input" name="email" value={seekerData.email} onChange={handleSeekerChange} placeholder="email@example.com" />
                            </div>
                            <div>
                                <label className="label">Password</label>
                                <input required type="password" className="input" name="password" value={seekerData.password} onChange={handleSeekerChange} placeholder="Create password" />
                            </div>
                            <div>
                                <label className="label">Gender</label>
                                <select className="input" name="gender" value={seekerData.gender} onChange={handleSeekerChange}>
                                    <option value="FEMALE">Female</option>
                                    <option value="MALE">Male</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Age</label>
                                <input required type="number" className="input" name="age" value={seekerData.age} onChange={handleSeekerChange} placeholder="Example: 25" />
                            </div>
                            <div>
                                <label className="label">Marital Status</label>
                                <select className="input" name="maritalStatus" value={seekerData.maritalStatus} onChange={handleSeekerChange}>
                                    <option value="SINGLE">Single</option>
                                    <option value="MARRIED">Married</option>
                                    <option value="DIVORCED">Divorced</option>
                                    <option value="WIDOWED">Widowed</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Religion</label>
                                <input className="input" name="religion" value={seekerData.religion} onChange={handleSeekerChange} placeholder="Optional" />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label className="label">Skills (comma separated)</label>
                                <input required className="input" name="skills" value={seekerData.skills} onChange={handleSeekerChange} placeholder="Cooking, Cleaning, Child Care..." />
                            </div>
                            <div>
                                <label className="label">Experience (Years)</label>
                                <input required type="number" className="input" name="experienceYears" value={seekerData.experienceYears} onChange={handleSeekerChange} placeholder="0" />
                            </div>
                            <div>
                                <label className="label">Expected Salary (ETB)</label>
                                <input required type="number" className="input" name="expectedSalary" value={seekerData.expectedSalary} onChange={handleSeekerChange} placeholder="3000" />
                            </div>
                            <div>
                                <label className="label">Preferred Arrangement</label>
                                <select className="input" name="preferredArrangement" value={seekerData.preferredArrangement} onChange={handleSeekerChange}>
                                    <option value="LIVE_IN">Live-in</option>
                                    <option value="LIVE_OUT">Live-out</option>
                                    <option value="PART_TIME">Part-time</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Preferred Location</label>
                                <input required className="input" name="preferredLocation" value={seekerData.preferredLocation} onChange={handleSeekerChange} placeholder="Addis Ababa, Bole..." />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label className="label">Bio / About Me</label>
                                <textarea className="input" name="bio" value={seekerData.bio} onChange={handleSeekerChange} style={{ minHeight: '100px' }} placeholder="Tell employers about yourself..." />
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                            <div>
                                <label className="label">Employer Type</label>
                                <select className="input" name="employerType" value={employerData.employerType} onChange={handleEmployerChange}>
                                    <option value="HOUSEHOLD">Private Household</option>
                                    <option value="BUSINESS">Business (Hotel, Cafe...)</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Contact Person Name</label>
                                <input required className="input" name="contactName" value={employerData.contactName} onChange={handleEmployerChange} placeholder="Full Name" />
                            </div>
                            <div>
                                <label className="label">Phone Number</label>
                                <input required className="input" name="phone" value={employerData.phone} onChange={handleEmployerChange} placeholder="+251..." />
                            </div>
                            <div>
                                <label className="label">Email Address</label>
                                <input required type="email" className="input" name="email" value={employerData.email} onChange={handleEmployerChange} placeholder="email@example.com" />
                            </div>
                            <div>
                                <label className="label">Password</label>
                                <input required type="password" className="input" name="password" value={employerData.password} onChange={handleEmployerChange} placeholder="Create password" />
                            </div>
                            <div>
                                <label className="label">Address / Location</label>
                                <input required className="input" name="address" value={employerData.address} onChange={handleEmployerChange} placeholder="City, Sub-city, Woreda" />
                            </div>
                            {employerData.employerType === 'HOUSEHOLD' && (
                                <div>
                                    <label className="label">Family Size</label>
                                    <input required type="number" className="input" name="familySize" value={employerData.familySize} onChange={handleEmployerChange} placeholder="Number of family members" />
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ marginTop: '40px' }}>
                        <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Creating Account...' : 'Register Now'}
                        </button>
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
        </div>
    );
};

export default Register;
