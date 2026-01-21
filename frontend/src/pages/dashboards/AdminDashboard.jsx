import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Users, CreditCard, Shield } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ seekers: 0, employers: 0 });
    const [codeData, setCodeData] = useState({ days: 30 });
    const [generatedCode, setGeneratedCode] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/admin/users');
                setStats({
                    seekers: res.data.seekers.length,
                    employers: res.data.employers.length
                });
            } catch (err) {
                console.error("Failed to fetch admin stats", err);
            }
        };
        fetchUsers();
    }, []);

    const handleGenerateCode = async () => {
        try {
            const res = await api.post('/admin/generate-code', codeData);
            setGeneratedCode(res.data);
        } catch (err) {
            alert('Failed to generate code');
        }
    };

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            <h1 style={{ marginBottom: '30px' }}>Admin Dashboard</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ padding: '15px', background: '#ffe0b2', borderRadius: '12px' }}>
                        <Users size={32} color="#e65100" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '2rem', margin: 0 }}>{stats.seekers}</h3>
                        <p style={{ color: '#666' }}>Job Seekers</p>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ padding: '15px', background: '#e1f5fe', borderRadius: '12px' }}>
                        <BriefcaseIcon size={32} color="#0277bd" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '2rem', margin: 0 }}>{stats.employers}</h3>
                        <p style={{ color: '#666' }}>Employers</p>
                    </div>
                </div>
            </div>

            <div className="card" style={{ maxWidth: '500px' }}>
                <h3 style={{ marginBottom: '20px' }}>Generate Subscription Code</h3>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <select
                        value={codeData.days}
                        onChange={(e) => setCodeData({ days: e.target.value })}
                        style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                    >
                        <option value="30">Monthly (30 Days)</option>
                        <option value="90">Quarterly (90 Days)</option>
                        <option value="180">Semi-Annual (180 Days)</option>
                        <option value="365">Annual (365 Days)</option>
                    </select>
                    <button className="btn-primary" onClick={handleGenerateCode}>Generate</button>
                </div>

                {generatedCode && (
                    <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px dashed #ccc', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>Code Generated:</p>
                        <h2 style={{ letterSpacing: '2px', color: 'var(--primary)' }}>{generatedCode.code}</h2>
                        <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '5px' }}>Expires: {new Date(generatedCode.expiresAt).toLocaleDateString()}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const BriefcaseIcon = ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
);

export default AdminDashboard;
