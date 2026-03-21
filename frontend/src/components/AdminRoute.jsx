import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

export const AdminRoute = ({ children }) => {
    const user = authService.getCurrentUser();

    // Check if user exists and has ADMIN role
    if (!user || user.role !== 'ADMIN') {
        console.warn('Unauthorized access attempt to /admin');
        return <Navigate to="/login" replace />;
    }

    return children;
};
