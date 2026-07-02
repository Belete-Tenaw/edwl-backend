import api from './api';

const reviewService = {
    createReview: async (reviewData) => {
        const response = await api.post('/reviews', reviewData);
        return response.data;
    },

    getUserReviews: async (userType, userId) => {
        const response = await api.get(`/reviews/${userType}/${userId}`);
        return response.data;
    }
};

export default reviewService;
