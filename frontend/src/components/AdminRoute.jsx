import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

export const AdminRoute = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(null);
    const auth = getAuth();

    useEffect(() => {
        return auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    // Force refresh to get latest custom claims
                    const idTokenResult = await user.getIdTokenResult(true);
                    setIsAdmin(!!idTokenResult.claims.superAdmin);
                } catch (error) {
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }
        });
    }, [auth]);

    // Render loading spinner while checking auth status
    if (isAdmin === null) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                height: '100vh', color: 'var(--primary)', background: 'white'
            }}>
                <div style={{ width: '50px', height: '50px', border: '5px solid #f3f3f3', borderTop: '5px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ marginTop: '20px', fontWeight: 'bold' }}>Verifying Admin Access...</p>
                <style>{`
                  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              `}</style>
            </div>
        );
    }

    // Eject unauthorized users immediately
    if (!isAdmin) return <Navigate to="/login" replace />;

    return children;
};
