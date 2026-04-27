import React, { useState } from 'react';
import { X, FileText, Calendar, DollarSign, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const ContractCreateModal = ({ worker, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        startDate: new Date().toISOString().split('T')[0],
        salaryAmount: worker.expectedSalary || '',
        jobType: 'HOUSEHOLD',
        termsConditions: `1. Working hours: 8:00 AM - 6:00 PM\n2. Weekly holiday: Sunday\n3. One meal provided per day\n4. Respectful treatment guaranteed`,
        includeInsurance: true
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/contracts', {
                jobSeekerId: worker.id,
                ...formData
            });
            alert("Contract draft sent to worker!");
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error("Contract creation error:", err);
            alert("Failed to create contract.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(4px)' }}>
            <div style={{ background: 'white', width: '90%', maxWidth: '500px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--primary)', color: 'white' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={20} /> Hire {worker.fullName}
                    </h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '25px' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b', marginBottom: '8px' }}>Start Date</label>
                        <div style={{ position: 'relative' }}>
                            <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input 
                                required 
                                type="date" 
                                name="startDate" 
                                value={formData.startDate} 
                                onChange={handleChange}
                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} 
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b', marginBottom: '8px' }}>Monthly Salary (ETB)</label>
                        <div style={{ position: 'relative' }}>
                            <DollarSign size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input 
                                required 
                                type="number" 
                                name="salaryAmount" 
                                value={formData.salaryAmount} 
                                onChange={handleChange}
                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} 
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b', marginBottom: '8px' }}>Terms & Conditions</label>
                        <textarea 
                            name="termsConditions" 
                            value={formData.termsConditions} 
                            onChange={handleChange}
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', minHeight: '120px', outline: 'none', fontSize: '0.9rem' }} 
                        />
                    </div>

                    <div style={{ marginBottom: '20px', padding: '12px', border: '1px solid #bae6fd', background: '#f0f9ff', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input 
                            type="checkbox" 
                            id="includeInsurance" 
                            name="includeInsurance"
                            checked={formData.includeInsurance}
                            onChange={(e) => setFormData({...formData, includeInsurance: e.target.checked})}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <label htmlFor="includeInsurance" style={{ fontSize: '0.85rem', color: '#0369a1', cursor: 'pointer' }}>
                            <strong>Add Insurance & Welfare Protection</strong> (+250 ETB/mo)
                            <br/><span style={{ opacity: 0.8, fontSize: '0.75rem' }}>Protects worker against medical emergencies.</span>
                        </label>
                    </div>

                    <div style={{ background: '#f0f9ff', padding: '15px', borderRadius: '12px', marginBottom: '25px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <ShieldCheck size={20} color="#0369a1" style={{ flexShrink: 0 }} />
                        <p style={{ fontSize: '0.75rem', color: '#0369a1', margin: 0 }}>
                            Digital contracts protect both parties. Once the worker signs, you can initiate a secure escrow payment.
                        </p>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn-primary" 
                        style={{ width: '100%', padding: '14px', fontWeight: 'bold', borderRadius: '12px' }}
                    >
                        {loading ? 'SENDING...' : 'SEND CONTRACT DRAFT'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ContractCreateModal;
