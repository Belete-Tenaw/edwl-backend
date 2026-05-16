import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle, Loader2, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useToast } from './Toast';
import { useTranslation } from 'react-i18next';

/**
 * SafeCheckIn Component
 * Allows workers to tap "I've Arrived" when they reach their workplace.
 * Records GPS location and notifies both the worker and employer in real-time.
 * 
 * Props:
 *   contracts: Array — list of active contracts to select from
 */
const SafeCheckIn = ({ contracts = [] }) => {
    const { t } = useTranslation();
    const addToast = useToast();
    const [checkedIn, setCheckedIn] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedContractId, setSelectedContractId] = useState('');
    const [checkInTime, setCheckInTime] = useState(null);
    const [geoStatus, setGeoStatus] = useState('idle'); // 'idle' | 'locating' | 'found' | 'denied'
    const [coords, setCoords] = useState(null);

    // Filter to only ACTIVE contracts
    const activeContracts = contracts.filter(c =>
        c.status === 'ACTIVE' || c.status === 'SIGNED_BY_SEEKER'
    );

    useEffect(() => {
        if (activeContracts.length === 1) {
            setSelectedContractId(activeContracts[0].id);
        }
    }, [contracts]);

    const acquireLocation = () => {
        return new Promise((resolve) => {
            if (!('geolocation' in navigator)) {
                resolve(null);
                return;
            }
            setGeoStatus('locating');
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const c = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                    setCoords(c);
                    setGeoStatus('found');
                    resolve(c);
                },
                () => {
                    setGeoStatus('denied');
                    resolve(null);
                },
                { timeout: 8000 }
            );
        });
    };

    const handleCheckIn = async () => {
        if (!selectedContractId) {
            addToast('Please select an active contract first.', 'error');
            return;
        }
        setLoading(true);
        try {
            const location = await acquireLocation();
            await api.post('/safety/check-in', {
                contractId: selectedContractId,
                latitude: location?.latitude || null,
                longitude: location?.longitude || null
            });
            setCheckedIn(true);
            setCheckInTime(new Date());
            addToast('✅ Safe Check-In recorded! Your employer has been notified.', 'success');
        } catch (err) {
            addToast(err.response?.data?.error || 'Check-in failed. Please try again.', 'error');
            setGeoStatus('idle');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setCheckedIn(false);
        setCheckInTime(null);
        setCoords(null);
        setGeoStatus('idle');
    };

    if (activeContracts.length === 0) return null;

    return (
        <div style={{
            background: checkedIn
                ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)'
                : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: `1px solid ${checkedIn ? '#6ee7b7' : '#93c5fd'}`,
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '24px',
            transition: 'all 0.4s ease'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                    width: '48px', height: '48px', borderRadius: '14px',
                    background: checkedIn ? '#10b981' : '#3b82f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: checkedIn ? '0 4px 12px rgba(16,185,129,0.3)' : '0 4px 12px rgba(59,130,246,0.3)',
                    transition: 'all 0.4s ease'
                }}>
                    {checkedIn ? <ShieldCheck size={26} color="white" /> : <MapPin size={26} color="white" />}
                </div>
                <div>
                    <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.05rem', color: checkedIn ? '#065f46' : '#1e40af' }}>
                        {checkedIn ? '✅ Checked In Successfully' : '🏠 Safe Arrival Check-In'}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: checkedIn ? '#059669' : '#3b82f6', fontWeight: '600' }}>
                        {checkedIn
                            ? `Recorded at ${checkInTime?.toLocaleTimeString()} • Employer notified`
                            : 'Tap when you arrive at work — keeps you & your employer informed'}
                    </p>
                </div>
            </div>

            {!checkedIn ? (
                <>
                    {/* Contract Selector (only if multiple active contracts) */}
                    {activeContracts.length > 1 && (
                        <select
                            value={selectedContractId}
                            onChange={e => setSelectedContractId(e.target.value)}
                            style={{
                                width: '100%', padding: '10px 14px', borderRadius: '12px',
                                border: '1px solid #bfdbfe', background: 'white',
                                fontSize: '0.9rem', fontWeight: '600', color: '#1e3a8a',
                                marginBottom: '14px', cursor: 'pointer'
                            }}
                        >
                            <option value="">— Select active contract —</option>
                            {activeContracts.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.employer?.contactName || 'Employer'} — {c.jobType || 'Domestic Work'}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Location status indicator */}
                    {geoStatus === 'locating' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#2563eb', fontSize: '0.85rem', fontWeight: '600' }}>
                            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                            Acquiring your GPS location…
                        </div>
                    )}
                    {geoStatus === 'found' && coords && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#059669', fontSize: '0.85rem', fontWeight: '600' }}>
                            <MapPin size={16} />
                            GPS found: {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
                        </div>
                    )}
                    {geoStatus === 'denied' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#d97706', fontSize: '0.85rem', fontWeight: '600' }}>
                            <AlertCircle size={16} />
                            Location denied — check-in will be recorded without GPS
                        </div>
                    )}

                    {/* CTA Button */}
                    <button
                        id="safe-checkin-btn"
                        onClick={handleCheckIn}
                        disabled={loading || !selectedContractId}
                        style={{
                            width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
                            background: loading || !selectedContractId
                                ? '#93c5fd'
                                : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                            color: 'white', fontWeight: '800', fontSize: '1rem', cursor: loading || !selectedContractId ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            boxShadow: loading || !selectedContractId ? 'none' : '0 4px 14px rgba(59,130,246,0.4)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {loading
                            ? <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Recording check-in…</>
                            : <><MapPin size={20} /> I've Arrived Safely</>
                        }
                    </button>
                </>
            ) : (
                /* Checked-in success state */
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                        padding: '16px', background: 'white', borderRadius: '14px',
                        border: '1px solid #a7f3d0', marginBottom: '14px'
                    }}>
                        <CheckCircle size={40} color="#10b981" />
                        <div>
                            <div style={{ fontWeight: '800', color: '#065f46', fontSize: '1rem' }}>Safe Arrival Logged</div>
                            <div style={{ color: '#6ee7b7', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '4px' }}>
                                <Clock size={14} /> {checkInTime?.toLocaleTimeString()}
                            </div>
                        </div>
                        {coords && (
                            <div style={{ fontSize: '0.78rem', color: '#059669', background: '#ecfdf5', padding: '6px 14px', borderRadius: '20px', border: '1px solid #a7f3d0' }}>
                                📍 GPS: {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleReset}
                        style={{
                            background: 'transparent', border: '1px solid #6ee7b7', color: '#059669',
                            padding: '8px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700'
                        }}
                    >
                        Reset (check in again)
                    </button>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default SafeCheckIn;
