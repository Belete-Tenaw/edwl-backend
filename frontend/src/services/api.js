import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.MODE === 'production'
        ? 'https://edwl-backend.onrender.com/api'
        : '/api',
});

// Add a request interceptor to add the auth token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isPublicRequest = error.config?.url?.includes('/seekers/public');
        if (error.response && error.response.status === 401 && !isPublicRequest) {
            // Session expired
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login?expired=true';
            }
        }
        return Promise.reject(error);
    }
);

export const API_BASE_URL = import.meta.env.MODE === 'production'
    ? 'https://edwl-backend.onrender.com'
    : 'http://localhost:5000';

export default api;
