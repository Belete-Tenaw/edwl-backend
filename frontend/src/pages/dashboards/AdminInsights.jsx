import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { Map, TrendingUp, Zap, Users, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const AdminInsights = () => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchInsights();
    }, []);

    const fetchInsights = async () => {
        try {
            const response = await api.get('/admin/insights');
            setInsights(response.data);
        } catch (err) {
            console.error("Error fetching insights:", err);
            setError("Failed to load market insights.");
        } finally {
            setLoading(true); // Wait, should be false
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Market Insights...</div>;
    if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error}</div>;
    if (!insights) return null;

    const heatmapData = insights.regionalBalance.workers.map(w => ({
        region: w.locationRegion || 'Unknown',
        workers: w._count,
        jobs: insights.regionalBalance.jobs.find(j => j.address === w.locationRegion)?._count || 0
    }));

    const salaryData = insights.trends.salaryByJobType.map(s => ({
        type: s.jobType,
        avgSalary: Math.round(s._avg.salaryOffered)
    }));

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid #bfdbfe' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e40af', marginBottom: '10px' }}>
                        <Zap size={20} />
                        <span style={{ fontWeight: 'bold' }}>Resolution Efficiency</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{insights.efficiency.avgDisputeResolutionHours} hrs</div>
                    <div style={{ fontSize: '0.85rem', color: '#60a5fa' }}>Avg. time to resolve disputes</div>
                </div>

                <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #bbf7d0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#166534', marginBottom: '10px' }}>
                        <Users size={20} />
                        <span style={{ fontWeight: 'bold' }}>Market Health</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        {insights.regionalBalance.jobs.reduce((a, b) => a + b._count, 0)} / {insights.regionalBalance.workers.reduce((a, b) => a + b._count, 0)}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#4ade80' }}>Total Jobs / Total Workers</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                <div className="card" style={{ padding: '20px' }}>
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Map size={18} /> Regional Heatmap (Supply vs Demand)
                    </h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={heatmapData}>
                                <XAxis dataKey="region" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="workers" fill="#3b82f6" name="Workers" />
                                <Bar dataKey="jobs" fill="#fbbf24" name="Jobs" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card" style={{ padding: '20px' }}>
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <TrendingUp size={18} /> Average Salary Trends (ETB)
                    </h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salaryData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="type" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="avgSalary" stroke="#f43f5e" strokeWidth={3} dot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            
            <div className="alert alert-info" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8fafc', borderRadius: '10px' }}>
                <AlertCircle size={24} color="#3b82f6" />
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                    <strong>Admin Tip:</strong> Markets with high worker supply but low job counts (e.g., specific regions) may benefit from targeted employer outreach campaigns.
                </p>
            </div>
        </div>
    );
};

export default AdminInsights;
