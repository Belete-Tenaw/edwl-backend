import api from './api';

const authService = {
    login: async (credentials, type) => {
        // type: 'seeker', 'employer', 'admin', 'agency'
        let endpoint = `/auth/${type}/login`;
        let payload = credentials;

        if (type === 'agency') {
            endpoint = '/agencies/login';
            payload = {
                registrationNo: credentials.identifier,
                password: credentials.password
            };
        }

        if (type === 'admin') {
            payload = {
                username: credentials.identifier,
                password: credentials.password
            };
        }

        const response = await api.post(endpoint, payload);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    register: async (data, type) => {
        // type: 'seeker', 'employer', 'agency'
        let endpoint = `/auth/${type}/register`;
        if (type === 'agency') {
            endpoint = '/agencies/register';
        }
        const response = await api.post(endpoint, data);
        if (response.data.token) {
            const readValue = (key) => {
                if (typeof FormData !== 'undefined' && data instanceof FormData) {
                    return data.get(key);
                }
                return data?.[key];
            };
            const roleByType = {
                seeker: 'JOB_SEEKER',
                employer: 'EMPLOYER',
                agency: 'AGENCY'
            };
            const fallbackUser = response.data.user || (
                response.data.userId || response.data.agency?.id
                    ? {
                        id: response.data.userId || response.data.agency?.id,
                        name: readValue('fullName') || readValue('contactName') || readValue('name') || 'EDWL User',
                        role: roleByType[type]
                    }
                    : null
            );

            localStorage.setItem('token', response.data.token);
            if (fallbackUser) {
                localStorage.setItem('user', JSON.stringify(fallbackUser));
            }
        }
        return response.data;
    },

    loginWithFirebase: async (data) => {
        // data contains { idToken, role }
        const response = await api.post('/auth/firebase-login', data);
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
        try {
            const userStr = localStorage.getItem('user');
            if (userStr && userStr !== 'undefined') {
                return JSON.parse(userStr);
            }
        } catch (error) {
            console.error('Error parsing user from localStorage:', error);
            localStorage.removeItem('user'); // Clean up corrupted data
        }
        return null;
    },

    forgotPassword: async (identifier) => {
        const response = await api.post('/auth/forgot-password', { identifier });
        return response.data;
    },

    resetPassword: async (data) => {
        // data: { identifier, token, newPassword }
        const response = await api.post('/auth/reset-password', data);
        return response.data;
    }
};

export default authService;
