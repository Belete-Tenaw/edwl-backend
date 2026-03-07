import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const reviewService = {
    createReview: async (reviewData) => {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/reviews`, reviewData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    getUserReviews: async (userType, userId) => {
        const response = await axios.get(`${API_URL}/reviews/${userType}/${userId}`);
        return response.data;
    }
};

export default reviewService;
