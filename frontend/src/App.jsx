console.log('--- App.jsx: Loading component ---');
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AdminRoute } from './components/AdminRoute';
import authService from './services/authService';
// Helper to handle Chunk Load Errors (happens after major updates)
const lazyWithRetry = (componentImport) =>
    lazy(async () => {
        const pageHasAlreadyBeenForceReloaded = window.sessionStorage.getItem('page-force-reloaded');
        try {
            const component = await componentImport();
            window.sessionStorage.removeItem('page-force-reloaded');
            return component;
        } catch (error) {
            console.error('Error loading chunk:', error);
            if (!pageHasAlreadyBeenForceReloaded) {
                window.sessionStorage.setItem('page-force-reloaded', 'true');
                return window.location.reload();
            }
            throw error;
        }
    });

// Lazy Load Pages
const Home = lazyWithRetry(() => import('./pages/Home'));
const Login = lazyWithRetry(() => import('./pages/Login'));
const Register = lazyWithRetry(() => import('./pages/Register'));
const Contact = lazyWithRetry(() => import('./pages/Contact'));
const SeekerDashboard = lazyWithRetry(() => import('./pages/dashboards/SeekerDashboard'));
const EmployerDashboard = lazyWithRetry(() => import('./pages/dashboards/EmployerDashboard'));
const AdminDashboard = lazyWithRetry(() => import('./pages/dashboards/AdminDashboard'));
const Messages = lazyWithRetry(() => import('./pages/Messages'));
const EditProfile = lazyWithRetry(() => import('./pages/EditProfile'));
const Pricing = lazyWithRetry(() => import('./pages/Pricing'));
const Activate = lazyWithRetry(() => import('./pages/Activate'));
const PrivacyPolicy = lazyWithRetry(() => import('./pages/PrivacyPolicy'));
const TermsAndConditions = lazyWithRetry(() => import('./pages/TermsAndConditions'));
const About = lazyWithRetry(() => import('./pages/About'));
const Safety = lazyWithRetry(() => import('./pages/Safety'));
const NotFound = lazyWithRetry(() => import('./pages/NotFound'));

const Loading = () => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: 'var(--primary)',
        background: 'white',
        zIndex: 9999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    }}>
        <div style={{ width: '50px', height: '50px', border: '5px solid #f3f3f3', borderTop: '5px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '20px', fontWeight: 'bold' }}>Loading EDWL...</p>
        <style>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
    </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
    const user = authService.getCurrentUser();
    if (!user) return <Navigate to="/login" />;
    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
    return children;
};

function App() {
    return (
        <Router>
            <div className="app">
                <Suspense fallback={<Loading />}>
                    <Navbar />
                    <main>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/pricing" element={<Pricing />} />
                            <Route path="/activate" element={<Activate />} />
                            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/safety" element={<Safety />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="*" element={<NotFound />} />

                            <Route path="/messages" element={
                                <ProtectedRoute allowedRoles={['JOB_SEEKER', 'EMPLOYER']}>
                                    <Messages />
                                </ProtectedRoute>
                            } />

                            <Route path="/profile/edit" element={
                                <ProtectedRoute allowedRoles={['JOB_SEEKER', 'EMPLOYER']}>
                                    <EditProfile />
                                </ProtectedRoute>
                            } />

                            <Route path="/dashboard/seeker" element={
                                <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
                                    <SeekerDashboard />
                                </ProtectedRoute>
                            } />

                            <Route path="/dashboard/employer" element={
                                <ProtectedRoute allowedRoles={['EMPLOYER']}>
                                    <EmployerDashboard />
                                </ProtectedRoute>
                            } />

                            <Route path="/admin" element={
                                <AdminRoute>
                                    <AdminDashboard />
                                </AdminRoute>
                            } />
                        </Routes>
                    </main>
                    <Footer />
                </Suspense>
            </div>
        </Router>
    );
}

export default App;
