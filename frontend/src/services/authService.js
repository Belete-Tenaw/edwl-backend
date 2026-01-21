import api from './api';

const authService = {
    login: async (credentials, type) => {
        // type: 'seeker', 'employer', 'admin'
        const endpoint = `/auth/${type}/login`;
        const response = await api.post(endpoint, credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    register: async (data, type) => {
        // type: 'seeker', 'employer'
        const endpoint = `/auth/${type}/register`;
        const response = await api.post(endpoint, data);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) return JSON.parse(userStr);
        return null;
    }
};

export default authService;
