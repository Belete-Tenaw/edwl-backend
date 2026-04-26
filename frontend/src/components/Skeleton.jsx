import React from 'react';

const Skeleton = ({ width, height, borderRadius, style }) => {
    return (
        <div style={{
            width: width || '100%',
            height: height || '20px',
            borderRadius: borderRadius || '4px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #f7f7f7 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite linear',
            ...style
        }}>
            <style>{`
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
};

export const CardSkeleton = () => (
    <div style={{ 
        padding: '20px', 
        borderRadius: '16px', 
        border: '1px solid #f1f5f9', 
        background: 'white',
        marginBottom: '20px'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <div style={{ width: '60%' }}>
                <Skeleton width="80%" height="24px" style={{ marginBottom: '12px' }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Skeleton width="80px" height="16px" />
                    <Skeleton width="60px" height="16px" />
                </div>
            </div>
            <Skeleton width="100px" height="36px" borderRadius="8px" />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
            <Skeleton width="60px" height="24px" />
            <Skeleton width="60px" height="24px" />
            <Skeleton width="60px" height="24px" />
        </div>
    </div>
);

export default Skeleton;
