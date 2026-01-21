import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import authService from './services/authService';

// Lazy Load Pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const SeekerDashboard = lazy(() => import('./pages/dashboards/SeekerDashboard'));
const EmployerDashboard = lazy(() => import('./pages/dashboards/EmployerDashboard'));
const AdminDashboard = lazy(() => import('./pages/dashboards/AdminDashboard'));
const Messages = lazy(() => import('./pages/Messages'));
const EditProfile = lazy(() => import('./pages/EditProfile'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Activate = lazy(() => import('./pages/Activate'));

const Loading = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--primary)' }}>
        Loading...
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
                <Navbar />
                <main>
                    <Suspense fallback={<Loading />}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/pricing" element={<Pricing />} />
                            <Route path="/activate" element={<Activate />} />

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
                                <ProtectedRoute allowedRoles={['ADMIN']}>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </Suspense>
                </main>
            </div>
        </Router>
    );
}

export default App;
