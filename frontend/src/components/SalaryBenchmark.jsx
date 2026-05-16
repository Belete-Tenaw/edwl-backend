import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, BarChart2, AlertCircle, CheckCircle, Loader2, ChevronDown } from 'lucide-react';
import api from '../services/api';

/**
 * SalaryBenchmark Component
 * Fetches real market salary data from EDWL contracts + job posts.
 * Shows employers a fair-pay range before they post a job.
 *
 * Props:
 *   jobType  (string) — synced with the job post form
 *   region   (string) — optional region filter
 *   salary   (number) — current salary value in the form (to compare)
 *   onChange (fn)     — optional callback when employer clicks "Use suggested salary"
 */
const SalaryBenchmark = ({ jobType = '', region = '', salary = 0, onChange }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState(true);

    const fetchBenchmark = useCallback(async () => {
        if (!jobType) return;
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (jobType) params.append('jobType', jobType);
            if (region)  params.append('region', region);
            const res = await api.get(`/jobs/salary/benchmark?${params.toString()}`);
            setData(res.data);
        } catch (err) {
            setError('Unable to load salary data right now.');
        } finally {
            setLoading(false);
        }
    }, [jobType, region]);

    // Auto-fetch whenever jobType or region changes (debounced)
    useEffect(() => {
        const t = setTimeout(fetchBenchmark, 600);
        return () => clearTimeout(t);
    }, [fetchBenchmark]);

    const fairnessColor = () => {
        if (!data || !salary) return '#64748b';
        if (salary < data.market.low) return '#e11d48';
        if (salary > data.market.high) return '#f59e0b';
        return '#10b981';
    };

    const fairnessLabel = () => {
        if (!data || !salary) return null;
        if (salary < data.market.low) return { text: 'Below Market', color: '#e11d48', bg: '#fff1f2' };
        if (salary > data.market.high) return { text: 'Above Market', color: '#d97706', bg: '#fffbeb' };
        return { text: 'Fair Market Rate', color: '#059669', bg: '#ecfdf5' };
    };

    const label = fairnessLabel();

    if (!jobType) return null;

    return (
        <div style={{
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            border: '1px solid #bae6fd',
            borderRadius: '16px',
            padding: '18px',
            marginTop: '16px',
            transition: 'all 0.3s ease'
        }}>
            {/* Header row */}
            <div
                onClick={() => setExpanded(e => !e)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: expanded ? '16px' : 0 }}
            >
                <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, boxShadow: '0 4px 10px rgba(14,165,233,0.3)'
                }}>
                    <BarChart2 size={18} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0c4a6e' }}>
                        AI Salary Benchmark
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: '600' }}>
                        {jobType} · {region || 'Ethiopia'} {data ? `· ${data.dataPoints} data points` : ''}
                    </div>
                </div>
                {/* Live fairness chip */}
                {label && salary > 0 && (
                    <div style={{
                        padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem',
                        fontWeight: '800', background: label.bg, color: label.color,
                        border: `1px solid ${label.color}30`
                    }}>
                        {label.text}
                    </div>
                )}
                <ChevronDown
                    size={18} color="#0369a1"
                    style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
                />
            </div>

            {expanded && (
                <>
                    {loading && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0369a1', fontSize: '0.85rem', fontWeight: '600' }}>
                            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                            Fetching live market data…
                        </div>
                    )}

                    {error && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontSize: '0.85rem' }}>
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    {data && !loading && (
                        <>
                            {/* Visual salary bar */}
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#0369a1', fontWeight: '700', marginBottom: '6px' }}>
                                    <span>Low · {data.market.low.toLocaleString()} ETB</span>
                                    <span>Mid · {data.market.mid.toLocaleString()} ETB</span>
                                    <span>High · {data.market.high.toLocaleString()} ETB</span>
                                </div>
                                <div style={{ position: 'relative', height: '10px', background: '#e0f2fe', borderRadius: '5px', overflow: 'visible' }}>
                                    {/* Range fill */}
                                    <div style={{
                                        position: 'absolute',
                                        left: `${(data.market.low / data.market.high) * 100}%`,
                                        width: `${((data.market.mid - data.market.low) / data.market.high) * 100}%`,
                                        height: '100%',
                                        background: 'linear-gradient(90deg, #34d399, #10b981)',
                                        borderRadius: '5px'
                                    }} />
                                    {/* Current salary marker */}
                                    {salary > 0 && (
                                        <div style={{
                                            position: 'absolute',
                                            left: `${Math.min((salary / data.market.high) * 100, 98)}%`,
                                            top: '-4px',
                                            width: '18px', height: '18px',
                                            background: fairnessColor(),
                                            borderRadius: '50%',
                                            border: '3px solid white',
                                            boxShadow: `0 2px 8px ${fairnessColor()}50`,
                                            transform: 'translateX(-50%)',
                                            transition: 'left 0.4s ease'
                                        }}
                                            title={`Your salary: ${salary.toLocaleString()} ETB`}
                                        />
                                    )}
                                </div>
                                {salary > 0 && (
                                    <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '0.75rem', color: fairnessColor(), fontWeight: '800' }}>
                                        Your offer: {salary.toLocaleString()} ETB/month
                                    </div>
                                )}
                            </div>

                            {/* Stats grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                                {[
                                    { label: 'EDWL Avg Offer', value: data.offered.avg, color: '#0369a1' },
                                    { label: 'Contracts Avg', value: data.contracted.avg, color: '#7c3aed' },
                                    { label: 'Fair Range', value: `${data.recommendation.fairMin.toLocaleString()}–${data.recommendation.fairMax.toLocaleString()}`, color: '#059669', isRange: true }
                                ].map(stat => (
                                    <div key={stat.label} style={{
                                        background: 'white', borderRadius: '10px', padding: '10px',
                                        border: '1px solid #e0f2fe', textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
                                            {stat.label}
                                        </div>
                                        <div style={{ fontWeight: '900', color: stat.color, fontSize: stat.isRange ? '0.78rem' : '0.95rem' }}>
                                            {stat.isRange ? stat.value : stat.value > 0 ? `${stat.value.toLocaleString()} ETB` : '—'}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Recommendation message */}
                            <div style={{
                                display: 'flex', alignItems: 'flex-start', gap: '10px',
                                padding: '10px 14px', borderRadius: '10px',
                                background: data.recommendation.label.includes('✅') ? '#ecfdf5' : '#fffbeb',
                                border: `1px solid ${data.recommendation.label.includes('✅') ? '#6ee7b7' : '#fde68a'}`,
                                fontSize: '0.82rem', color: '#374151', fontWeight: '600', marginBottom: '14px'
                            }}>
                                {data.recommendation.label.includes('✅')
                                    ? <CheckCircle size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '1px' }} />
                                    : <AlertCircle size={16} color="#d97706" style={{ flexShrink: 0, marginTop: '1px' }} />
                                }
                                {data.recommendation.label}
                            </div>

                            {/* Suggested salary CTA */}
                            {onChange && data.recommendation.fairMin > 0 && (
                                <button
                                    type="button"
                                    onClick={() => onChange(data.recommendation.fairMin)}
                                    style={{
                                        width: '100%', padding: '10px', borderRadius: '10px',
                                        background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
                                        color: 'white', border: 'none', fontWeight: '800',
                                        fontSize: '0.85rem', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        boxShadow: '0 4px 10px rgba(14,165,233,0.3)'
                                    }}
                                >
                                    <TrendingUp size={16} />
                                    Use Suggested: {data.recommendation.fairMin.toLocaleString()} ETB/month
                                </button>
                            )}
                        </>
                    )}
                </>
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

export default SalaryBenchmark;
