import React, { useState } from 'react';
import api from '../services/api';
import { X, Check } from 'lucide-react';

const JobPostModal = ({ onClose, onJobPosted }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requiredSkills: '', // comma separated
        salaryOffered: '',
        jobType: 'Full-time',
        preferredArrangement: 'LIVE_IN',
        address: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(s => s),
                salaryOffered: parseInt(formData.salaryOffered)
            };

            const res = await api.post('/jobs', payload);
            onJobPosted(res.data);
            onClose();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to post job');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="card" style={{ width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent' }}>
                    <X size={24} color="#999" />
                </button>

                <h2 style={{ marginBottom: '20px', color: 'var(--primary)' }}>Post a New Job</h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Job Title</label>
                        <input
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. Experienced Housemaid Needed"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Monthly Salary (ETB)</label>
                            <input
                                required
                                type="number"
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                name="salaryOffered"
                                value={formData.salaryOffered}
                                onChange={handleChange}
                                placeholder="3000"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Location</label>
                            <input
                                required
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Bole, Addis Ababa"
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Arrangement</label>
                            <select
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                name="preferredArrangement"
                                value={formData.preferredArrangement}
                                onChange={handleChange}
                            >
                                <option value="LIVE_IN">Live-in</option>
                                <option value="LIVE_OUT">Live-out</option>
                                <option value="PART_TIME">Part-time</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Job Type</label>
                            <input
                                required
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                name="jobType"
                                value={formData.jobType}
                                onChange={handleChange}
                                placeholder="Full-time, Contract..."
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Required Skills (Comma separated)</label>
                        <input
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                            name="requiredSkills"
                            value={formData.requiredSkills}
                            onChange={handleChange}
                            placeholder="Cooking, Cleaning, Laundry..."
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Description</label>
                        <textarea
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '100px', fontFamily: 'inherit' }}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe the responsibilities and requirements..."
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: '#f5f5f5', color: '#333' }}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {loading ? 'Posting...' : 'Post Job'} <Check size={18} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JobPostModal;
