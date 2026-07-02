import axios from 'axios';

const api = axios.create({
    baseURL: '',
});

const normalizeApiUrl = (url = '') => {
    if (/^https?:\/\//i.test(url)) return url;

    const withSlash = url.startsWith('/') ? url : `/${url}`;
    if (withSlash === '/api' || withSlash.startsWith('/api/')) return withSlash;

    return `/api${withSlash}`;
};

// Add a request interceptor to add the auth token to headers
api.interceptors.request.use(
    (config) => {
        config.url = normalizeApiUrl(config.url);
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

// Allow overriding the production API base URL via Vite env var `VITE_API_BASE_URL`.
// If not provided, production uses same-origin paths (''), which relies on a
// Cloud Function or proxy at `/api`. For local development the default is localhost.
const VITE_API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export const API_BASE_URL = VITE_API_BASE || (import.meta.env.MODE === 'production' ? '' : 'http://localhost:5000');

const normalizeBase = (u) => (u && u.endsWith('/') ? u.slice(0, -1) : u);
const _base = normalizeBase(API_BASE_URL);

export const API_HEALTH_URL = _base
    ? `${_base}/health`
    : (import.meta.env.MODE === 'production' ? '/api/health' : 'http://localhost:5000/health');

export const SOCKET_BASE_URL = _base
    ? _base
    : (import.meta.env.MODE === 'production' ? null : 'http://localhost:5000');

export default api;
