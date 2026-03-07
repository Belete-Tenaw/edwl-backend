import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api, { API_BASE_URL } from '../../services/api';
import { Users, Briefcase, CreditCard, Shield, AlertTriangle, FileText, Activity } from 'lucide-react';

// Helper function to get full document URL
const getDocumentUrl = (path) => {
    // Handle null, undefined, empty string, or string literals 'undefined'/'null'
    if (!path || path === 'undefined' || path === 'null' || path.trim() === '') return null;
    if (path.startsWith('http')) return path; // Already a full URL

    // Ensure path doesn't result in double slashes if API_BASE_URL ends with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
};

const AdminDashboard = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState({ seekers: [], employers: [] });
    const [reports, setReports] = useState([]);
    const [generatedCode, setGeneratedCode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('verification'); // verification, reports, codes
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED, BLOCKED
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

    const handleVerify = async (id, type, status, badge) => {
        try {
            await api.post('/admin/verify', { id, type, status, badge });
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

    const handleStatusChange = async (user, action) => {
        try {
            await api.post('/admin/status', { id: user.id, type: user.type, action });
            alert(action === 'ACTIVATE' ? t('user_activated') : t('user_blocked'));
            fetchData();
        } catch (err) {
            alert('Failed to update user status');
        }
    };

    const handleDeleteUser = async (user) => {
        if (!window.confirm(t('confirm_delete_user'))) return;
        try {
            await api.delete(`/admin/user/${user.type}/${user.id}`);
            alert('User profile deleted successfully!');
            fetchData();
        } catch (err) {
            alert('Failed to delete user');
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0 }}>{t('user_management')}</h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'BLOCKED'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    style={{
                                        padding: '5px 12px',
                                        borderRadius: '20px',
                                        border: '1px solid #ddd',
                                        background: statusFilter === s ? 'var(--primary)' : 'white',
                                        color: statusFilter === s ? 'white' : '#666',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {t(s.toLowerCase())}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '20px' }}>
                        {[...users.seekers.map(s => ({ ...s, type: 'seeker' })), ...users.employers.map(e => ({ ...e, type: 'employer', fullName: e.contactName }))]
                            .filter(u => {
                                if (statusFilter === 'ALL') return true;
                                if (statusFilter === 'BLOCKED') return !u.isActive;
                                if (statusFilter === 'PENDING') return u.verificationStatus === 'PENDING' || u.verificationStatus === 'NOT_STARTED';
                                return u.verificationStatus === statusFilter && u.isActive;
                            })
                            .map(user => (
                                <div key={user.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderLeft: user.type === 'seeker' ? '4px solid #f97316' : '4px solid #3b82f6' }}>
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                        <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', background: '#eee', flexShrink: 0 }}>
                                            {/* FIXED: Check for 'undefined' string before rendering image */}
                                            {user.profilePhoto && user.profilePhoto !== 'undefined' && user.profilePhoto !== 'null' ? (
                                                <img
                                                    src={user.profilePhoto.startsWith('http') ? user.profilePhoto : `${API_BASE_URL}${user.profilePhoto}`}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    alt="Profile"
                                                />
                                            ) : (
                                                <Users size={40} style={{ margin: '20px' }} color="#ccc" />
                                            )}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <h4 style={{ margin: '0' }}>{user.fullName}</h4>
                                                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', background: user.type === 'seeker' ? '#fff7ed' : '#eff6ff', color: user.type === 'seeker' ? '#c2410c' : '#1d4ed8', fontWeight: 'bold', textTransform: 'uppercase' }}>{user.type}</span>
                                            </div>
                                            <p style={{ fontSize: '0.9rem', color: '#666', margin: '5px 0' }}>{user.phone} • {user.email}</p>

                                            <div style={{ display: 'flex', gap: '15px', marginTop: '10px', flexWrap: 'wrap' }}>

                                                {/* FIXED: Check for 'undefined' string before rendering ID Link */}
                                                {user.idDocument && user.idDocument !== 'undefined' && user.idDocument !== 'null' ? (
                                                    <a href={getDocumentUrl(user.idDocument)} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <Shield size={14} /> {t('view_id_document')}
                                                    </a>
                                                ) : (
                                                    <span style={{ fontSize: '0.85rem', color: '#999' }}>{t('no_id_uploaded')}</span>
                                                )}

                                                {/* FIXED: Check for 'undefined' string before rendering Police Link */}
                                                {user.policeClearanceUrl && user.policeClearanceUrl !== 'undefined' && user.policeClearanceUrl !== 'null' && (
                                                    <a href={getDocumentUrl(user.policeClearanceUrl)} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#0284c7', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <FileText size={14} /> {t('police_clearance')}
                                                    </a>
                                                )}

                                                {/* FIXED: Check for 'undefined' string before rendering Health Link */}
                                                {user.healthCertificateUrl && user.healthCertificateUrl !== 'undefined' && user.healthCertificateUrl !== 'null' && (
                                                    <a href={getDocumentUrl(user.healthCertificateUrl)} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <Activity size={14} /> {t('health_certificate')}
                                                    </a>
                                                )}
                                                {user.nationalIdUrl && user.nationalIdUrl !== 'undefined' && user.nationalIdUrl !== 'null' && (
                                                    <a href={getDocumentUrl(user.nationalIdUrl)} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <Shield size={14} /> {t('national_id_fayda')}
                                                    </a>
                                                )}
                                                {user.guarantorIdUrl && user.guarantorIdUrl !== 'undefined' && user.guarantorIdUrl !== 'null' && (
                                                    <a href={getDocumentUrl(user.guarantorIdUrl)} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#8b5cf6', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <Users size={14} /> {t('guarantor_id')}
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'right', minWidth: '120px' }}>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                background: !user.isActive ? '#fee2e2' : user.verificationStatus === 'APPROVED' ? '#dcfce7' : '#fef9c3',
                                                color: !user.isActive ? '#b91c1c' : user.verificationStatus === 'APPROVED' ? '#15803d' : '#854d0e',
                                                fontWeight: 'bold'
                                            }}>
                                                {!user.isActive ? t('blocked') : t(user.verificationStatus.toLowerCase())}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={() => handleDeleteUser(user)}
                                                style={{ background: 'transparent', color: '#ef4444', border: '1px solid #fee2e2', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                                            >
                                                {t('delete_profile')}
                                            </button>
                                            {user.isActive ? (
                                                <button
                                                    onClick={() => handleStatusChange(user, 'SUSPEND')}
                                                    style={{ background: '#fef2f2', color: '#b91c1c', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                >
                                                    {t('block')}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleStatusChange(user, 'ACTIVATE')}
                                                    style={{ background: '#ecfdf5', color: '#059669', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                >
                                                    {t('unblock')}
                                                </button>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            {user.type === 'seeker' && user.verificationStatus !== 'APPROVED' && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#666' }}>{t('level_to_grant')}:</span>
                                                    <select
                                                        id={`badge-select-${user.id}`}
                                                        defaultValue="SILVER"
                                                        style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.85rem' }}
                                                    >
                                                        <option value="SILVER">{t('silver')}</option>
                                                        <option value="GOLD">{t('gold')}</option>
                                                        <option value="PLATINUM">{t('platinum')}</option>
                                                    </select>
                                                </div>
                                            )}

                                            {user.verificationStatus !== 'APPROVED' && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            const badge = user.type === 'seeker' ? document.getElementById(`badge-select-${user.id}`).value : undefined;
                                                            handleVerify(user.id, user.type, 'APPROVED', badge);
                                                        }}
                                                        style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                                    >
                                                        {t('approve')}
                                                    </button>
                                                    <button
                                                        onClick={() => handleVerify(user.id, user.type, 'REJECTED')}
                                                        style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                                    >
                                                        {t('reject')}
                                                    </button>
                                                </>
                                            )}
                                        </div>
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