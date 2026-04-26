import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success', duration = 4000) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, duration);
    }, []);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 10000,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                pointerEvents: 'none'
            }}>
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        style={{
                            pointerEvents: 'auto',
                            background: 'white',
                            padding: '16px 20px',
                            borderRadius: '16px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            border: `1px solid ${toast.type === 'error' ? '#fee2e2' : toast.type === 'success' ? '#dcfce7' : '#e0f2fe'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            minWidth: '300px',
                            maxWidth: '450px',
                            animation: 'toast-in 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Progress Bar */}
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            height: '3px',
                            background: toast.type === 'error' ? '#ef4444' : toast.type === 'success' ? '#10b981' : '#0ea5e9',
                            animation: 'toast-progress 4s linear forwards'
                        }}></div>

                        {toast.type === 'success' && <CheckCircle color="#10b981" size={20} />}
                        {toast.type === 'error' && <AlertCircle color="#ef4444" size={20} />}
                        {toast.type === 'info' && <Info color="#0ea5e9" size={20} />}
                        
                        <span style={{ fontSize: '0.95rem', fontWeight: '500', color: '#1e293b', flex: 1 }}>
                            {toast.message}
                        </span>
                        
                        <button 
                            onClick={() => removeToast(toast.id)}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes toast-in {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes toast-progress {
                    from { width: 100%; }
                    to { width: 0; }
                }
            `}</style>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context.addToast;
};
