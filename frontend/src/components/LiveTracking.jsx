import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Shield, Clock, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const LiveTracking = ({ contractId, userRole }) => {
    const { t } = useTranslation();
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval;
        if (isActive) {
            interval = setInterval(updateLocation, 10000);
        }
        return () => clearInterval(interval);
    }, [isActive]);

    const updateLocation = () => {
        if (userRole === 'JOB_SEEKER') {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setLocation({ latitude, longitude });
                    try {
                        await api.post('/api/safety/transit-update', {
                            contractId,
                            latitude,
                            longitude
                        });
                    } catch (err) {
                        console.error("Failed to send location:", err);
                    }
                },
                (err) => setError(err.message),
                { enableHighAccuracy: true }
            );
        } else {
            // Employer mode: Fetch worker location
            fetchWorkerLocation();
        }
    };

    const fetchWorkerLocation = async () => {
        try {
            const res = await api.get(`/api/safety/transit-location/${contractId}`);
            setLocation(res.data);
        } catch (err) {
            console.error("Failed to fetch location:", err);
        }
    };

    return (
        <div className="card" style={{ padding: '20px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: '8px', background: 'var(--primary)', borderRadius: '10px', color: 'white' }}>
                        <Navigation size={20} />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontWeight: '800' }}>Transit Tracking</h4>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Live Safety Link</p>
                    </div>
                </div>
                {userRole === 'JOB_SEEKER' && (
                    <button 
                        onClick={() => { setIsActive(!isActive); if(!isActive) updateLocation(); }}
                        style={{ 
                            background: isActive ? '#ef4444' : 'var(--primary)', 
                            color: 'white', border: 'none', padding: '8px 16px', 
                            borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' 
                        }}
                    >
                        {isActive ? 'Stop Sharing' : 'Start Sharing'}
                    </button>
                )}
            </div>

            <div style={{ height: '200px', background: '#e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ textAlign: 'center', color: '#64748b', zIndex: 1 }}>
                    <MapPin size={32} color={isActive || (userRole === 'EMPLOYER' && location) ? 'var(--primary)' : '#94a3b8'} style={{ marginBottom: '10px' }} />
                    <div style={{ fontSize: '0.85rem' }}>
                        {location ? `Location: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Waiting for live signal...'}
                    </div>
                </div>
                {/* Mock map background */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.3, background: 'repeating-linear-gradient(45deg, #cbd5e1 0px, #cbd5e1 1px, transparent 1px, transparent 10px)' }}></div>
            </div>

            <div style={{ marginTop: '15px', display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1, padding: '10px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
                    <Shield size={16} color="#10b981" /> Verified Connection
                </div>
                <div style={{ flex: 1, padding: '10px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
                    <Clock size={16} color="#3b82f6" /> Updates every 10s
                </div>
            </div>

            {error && (
                <div style={{ marginTop: '10px', color: '#ef4444', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <AlertTriangle size={14} /> {error}
                </div>
            )}
        </div>
    );
};

export default LiveTracking;
