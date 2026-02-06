import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { Users, Briefcase, CreditCard, Shield, AlertTriangle } from 'lucide-react';

const AdminDashboard = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState({ seekers: [], employers: [] });
    const [reports, setReports] = useState([]);
    const [generatedCode, setGeneratedCode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('verification'); // verification, reports, codes
    const [days, setDays] = useState(30);

    const fetchData = async () => {
        try {
            const [usersRes, reportsRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/reports')
            ]);
            setUsers({
                seekers: usersRes.data?.seekers || [],
                employers: usersRes.data?.employers || []
            });
            setReports(reportsRes.data || []);
        } catch (err) {
            console.error("Failed to fetch admin data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleVerify = async (id, type, status) => {
        try {
            await api.post('/admin/verify', { id, type, status });
            alert(`User ${status.toLowerCase()} successfully!`);
            fetchData();
        } catch (err) {
            alert('Failed to update verification status');
        }
    };

    const handleGenerate = async () => {
        try {
            const res = await api.post('/admin/generate-code', { days: parseInt(days) });
            setGeneratedCode(res.data);
        } catch (err) {
            alert(t('failed_to_generate_code') || 'Failed to generate code');
        }
    };

    if (loading) return <div className="container" style={{ padding: '40px 20px' }}>{t('loading')}</div>;

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ color: 'var(--primary)', margin: 0 }}>{t('admin_dashboard')}</h2>
                <div style={{ display: 'flex', gap: '10px', background: '#f0f0f0', padding: '5px', borderRadius: '10px' }}>
                    <button onClick={() => setActiveTab('verification')} style={{ padding: '8px 15px', borderRadius: '8px', border: 'none', background: activeTab === 'verification' ? 'white' : 'transparent', fontWeight: '500', cursor: 'pointer' }}>{t('verification')}</button>
                    <button onClick={() => setActiveTab('reports')} style={{ padding: '8px 15px', borderRadius: '8px', border: 'none', background: activeTab === 'reports' ? 'white' : 'transparent', fontWeight: '500', cursor: 'pointer' }}>{t('reports')}</button>
                    <button onClick={() => setActiveTab('codes')} style={{ padding: '8px 15px', borderRadius: '8px', border: 'none', background: activeTab === 'codes' ? 'white' : 'transparent', fontWeight: '500', cursor: 'pointer' }}>{t('codes')}</button>
                </div>
            </div>

            {activeTab === 'verification' && (
                <div>
                    <h3 style={{ marginBottom: '20px' }}>{t('pending_verification')}</h3>
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {[...users.seekers.map(s => ({ ...s, type: 'seeker' })), ...users.employers.map(e => ({ ...e, type: 'employer', fullName: e.contactName }))]
                            .filter(u => u.verificationStatus === 'NOT_STARTED' || u.verificationStatus === 'PENDING')
                            .map(user => (
                                <div key={user.id} className="card" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', background: '#eee' }}>
                                        {user.profilePhoto ? <img src={user.profilePhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Users size={40} style={{ margin: '20px' }} color="#ccc" />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 5px' }}>{user.fullName}</h4>
                                        <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>{user.phone} • {user.email}</p>
                                        <div style={{ marginTop: '10px' }}>
                                            {user.idDocument ? (
                                                <a href={user.idDocument} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600' }}>{t('view_id_document')}</a>
                                            ) : (
                                                <span style={{ fontSize: '0.85rem', color: '#999' }}>{t('no_id_uploaded')}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => handleVerify(user.id, user.type, 'APPROVED')} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer' }}>{t('approve')}</button>
                                        <button onClick={() => handleVerify(user.id, user.type, 'REJECTED')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer' }}>{t('reject')}</button>
                                    </div>
                                </div>
                            ))}
                        {users.seekers.length === 0 && users.employers.length === 0 && <p>{t('no_pending_verifications')}</p>}
                    </div>
                </div>
            )}

            {activeTab === 'reports' && (
                <div>
                    <h3 style={{ marginBottom: '20px' }}>{t('safety_reports')}</h3>
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {reports.length === 0 ? (
                            <p>{t('no_reports_found')}</p>
                        ) : (
                            reports.map(report => (
                                <div key={report.id} className="card" style={{ borderLeft: '4px solid #ef4444' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                        <div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#ef4444', textTransform: 'uppercase' }}>{t('reported_user')}</span>
                                            <h4 style={{ margin: '0' }}>{report.reportedJS?.fullName || report.reportedEmp?.contactName || 'Unknown'} ({report.reportedJS ? t('seeker') : t('employer')})</h4>
                                            <p style={{ margin: '5px 0', fontSize: '0.85rem', color: '#666' }}>ID: {report.reportedJSId || report.reportedEmpId}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#666', textTransform: 'uppercase' }}>{t('reporter')}</span>
                                            <p style={{ margin: '0', fontSize: '0.9rem' }}>{report.reporterJS?.fullName || report.reporterEmp?.contactName || 'Unknown'}</p>
                                            <p style={{ margin: '0', fontSize: '0.75rem', color: '#999' }}>{new Date(report.timestamp).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div style={{ background: '#fff5f5', padding: '15px', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                                        <strong>{t('reason')}:</strong> {report.reason}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'codes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ padding: '15px', background: '#ffe0b2', borderRadius: '12px' }}>
                                <Users size={32} color="#e65100" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '2rem', margin: 0 }}>{users.seekers.length}</h3>
                                <p style={{ color: '#666' }}>{t('job_seekers')}</p>
                            </div>
                        </div>
                        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ padding: '15px', background: '#e1f5fe', borderRadius: '12px' }}>
                                <Briefcase size={32} color="#0277bd" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '2rem', margin: 0 }}>{users.employers.length}</h3>
                                <p style={{ color: '#666' }}>{t('employers')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ maxWidth: '500px' }}>
                        <h3 style={{ marginBottom: '20px' }}>{t('generate_sub_code')}</h3>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                            <select
                                value={days}
                                onChange={(e) => setDays(e.target.value)}
                                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                            >
                                <option value="30">{t('monthly_30_opt')}</option>
                                <option value="90">{t('quarterly_90_opt')}</option>
                                <option value="180">{t('semi_annual_180_opt')}</option>
                                <option value="365">{t('annual_365_opt')}</option>
                            </select>
                            <button className="btn-primary" onClick={handleGenerate}>{t('generate')}</button>
                        </div>

                        {generatedCode && (
                            <div style={{ background: '#f0f9ff', padding: '20px', borderRadius: '12px', border: '2px dashed #0284c7', textAlign: 'center' }}>
                                <p style={{ fontSize: '0.9rem', color: '#0369a1', marginBottom: '10px', fontWeight: 'bold' }}>{t('code_generated')}</p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '10px' }}>
                                    <h2 style={{ letterSpacing: '3px', color: '#0284c7', margin: 0, fontSize: '2rem' }}>{generatedCode.code}</h2>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(generatedCode.code);
                                            alert('Code copied to clipboard!');
                                        }}
                                        style={{ padding: '5px 10px', fontSize: '0.8rem', background: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: '5px', cursor: 'pointer' }}
                                    >
                                        Copy
                                    </button>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{t('expires_at')} {new Date(generatedCode.expiresAt).toLocaleDateString()}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
