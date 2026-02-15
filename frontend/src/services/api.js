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
    (error) => {
        return Promise.reject(error);
    }
);

export const API_BASE_URL = import.meta.env.MODE === 'production'
    ? 'https://edwl-backend.onrender.com'
    : 'http://localhost:5000';

export default api;
