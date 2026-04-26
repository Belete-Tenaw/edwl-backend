import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../services/authService';
import { toast } from 'react-toastify';
import '../index.css'; // Use existing global styles

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const Academy = () => {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = authService.getCurrentUser();

    useEffect(() => {
        fetchModules();
    }, []);

    const fetchModules = async () => {
        try {
            const headers = user ? { Authorization: `Bearer ${user.token}` } : {};
            const res = await axios.get(`${API_URL}/training`, { headers });
            setModules(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch training modules', error);
            setLoading(false);
        }
    };

    const handleComplete = async (moduleId) => {
        if (!user || user.role !== 'JOB_SEEKER') {
            toast.error("Only Job Seekers can complete modules and earn badges.");
            return;
        }
        try {
            await axios.post(`${API_URL}/training/${moduleId}/complete`, {}, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            toast.success("Module marked as completed! Keep going!");
            fetchModules(); // Refresh list to get completed status
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to complete module');
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading EDWL Academy Modules...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ color: 'var(--primary)', fontSize: '2.5rem', marginBottom: '10px' }}>EDWL Academy 🎓</h1>
                <p style={{ color: '#666', fontSize: '1.2rem' }}>Complete training modules to upskill and earn the <b>Certified</b> badge for your profile!</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                {modules.map(mod => (
                    <div key={mod.id} style={{ 
                        background: 'white', 
                        borderRadius: '12px', 
                        overflow: 'hidden',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        border: mod.isCompleted ? '2px solid #28a745' : '1px solid #eee',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ 
                            height: '180px', 
                            background: '#f8f9fa', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            borderBottom: '1px solid #eee'
                            }}>
                            {/* In production, embed video if mod.videoUrl is valid */}
                            <span style={{ color: '#aaa', fontSize: '3rem' }}>▶️</span>
                        </div>
                        <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ margin: '0 0 10px', color: '#333' }}>{mod.title}</h3>
                            <p style={{ color: '#666', marginBottom: '20px', flexGrow: 1 }}>{mod.description}</p>
                            <div style={{ marginTop: 'auto' }}>
                                {mod.isCompleted ? (
                                    <button disabled style={{ 
                                        width: '100%', padding: '12px', borderRadius: '6px', 
                                        border: 'none', background: '#d4edda', color: '#155724', 
                                        fontWeight: 'bold', cursor: 'not-allowed' 
                                    }}>
                                        ✅ Completed
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleComplete(mod.id)}
                                        style={{ 
                                            width: '100%', padding: '12px', borderRadius: '6px', 
                                            border: 'none', background: 'var(--primary)', color: 'white', 
                                            fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' 
                                        }}
                                        onMouseOver={(e) => e.target.style.opacity = 0.9}
                                        onMouseOut={(e) => e.target.style.opacity = 1}
                                    >
                                        Mark as Complete
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {modules.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', background: '#f8f9fa', borderRadius: '12px' }}>
                        <h3 style={{ color: '#666' }}>More modules are coming soon!</h3>
                        <p>Check back later to advance your skills.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Academy;
