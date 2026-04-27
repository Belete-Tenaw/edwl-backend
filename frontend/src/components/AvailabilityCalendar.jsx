import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AvailabilityCalendar = ({ availability, onChange }) => {
    const { t } = useTranslation();
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeSlots = ['Morning', 'Afternoon', 'Evening'];

    // Local state to manage toggles before parent update
    const [schedule, setSchedule] = useState(availability || {});

    const toggleSlot = (day, slot) => {
        const newSchedule = { ...schedule };
        if (!newSchedule[day]) newSchedule[day] = [];
        
        if (newSchedule[day].includes(slot)) {
            newSchedule[day] = newSchedule[day].filter(s => s !== slot);
        } else {
            newSchedule[day] = [...newSchedule[day], slot];
        }
        
        setSchedule(newSchedule);
        onChange(newSchedule);
    };

    return (
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Calendar size={20} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>{t('weekly_availability') || 'Weekly Availability'}</h3>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '25px' }}>
                {t('availability_desc') || 'Select the time slots you are available for work each day.'}
            </p>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '8px' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '10px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Day</th>
                            {timeSlots.map(slot => (
                                <th key={slot} style={{ textAlign: 'center', padding: '10px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={14} />
                                        {t(slot.toLowerCase()) || slot}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {days.map(day => (
                            <tr key={day}>
                                <td style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.95rem', padding: '10px' }}>{t(day.toLowerCase()) || day}</td>
                                {timeSlots.map(slot => {
                                    const isSelected = schedule[day]?.includes(slot);
                                    return (
                                        <td key={slot} style={{ textAlign: 'center', padding: '5px' }}>
                                            <button
                                                type="button"
                                                onClick={() => toggleSlot(day, slot)}
                                                style={{
                                                    width: '100%',
                                                    minWidth: '80px',
                                                    padding: '12px 8px',
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    background: isSelected ? 'rgba(0, 128, 128, 0.1)' : '#f8fafc',
                                                    color: isSelected ? 'var(--primary)' : '#94a3b8',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: '5px',
                                                    boxShadow: isSelected ? 'inset 0 0 0 2px var(--primary)' : 'none'
                                                }}
                                            >
                                                {isSelected ? <CheckCircle2 size={18} strokeWidth={3} /> : <Circle size={18} strokeWidth={1} />}
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', gap: '15px', padding: '15px', background: '#f8fafc', borderRadius: '12px', fontSize: '0.85rem', color: '#64748b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--primary)' }}></div>
                    Available
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#e2e8f0' }}></div>
                    Unavailable
                </div>
            </div>
        </div>
    );
};

export default AvailabilityCalendar;
