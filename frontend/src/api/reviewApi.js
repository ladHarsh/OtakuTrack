import api from './authApi';

export const reviewApi = {
  // Get reviews for a show
  getReviewsByShow: async (showId, params = {}) => {
    const response = await api.get(`/reviews/show/${showId}`, { params });
    return response.data;
  },

  // Get user's reviews
  getUserReviews: async () => {
    const response = await api.get('/reviews/user');
    return response.data;
  },

  // Create review
  addReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  // Update review
  updateReview: async (id, reviewData) => {
    const response = await api.put(`/reviews/${id}`, reviewData);
    return response.data;
  },

  // Delete review
  deleteReview: async (id) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },

  // Like review
  likeReview: async (id) => {
    const response = await api.post(`/reviews/${id}/like`);
    return response.data;
  },

  // Dislike review
  dislikeReview: async (id) => {
    const response = await api.post(`/reviews/${id}/dislike`);
    return response.data;
  },

  // Mark review as helpful
  markHelpful: async (id) => {
    const response = await api.post(`/reviews/${id}/helpful`);
    return response.data;
  },

  // Report review
  reportReview: async (id, reportData) => {
    const response = await api.post(`/reviews/${id}/report`, reportData);
    return response.data;
  },

  // Get reviews by rating
  getReviewsByRating: async (showId, rating, params = {}) => {
    const response = await api.get(`/reviews/show/${showId}`, { 
      params: { 
        rating,
        ...params 
      } 
    });
    return response.data;
  },

  // Get helpful reviews
  getHelpfulReviews: async (showId, params = {}) => {
    const response = await api.get(`/reviews/show/${showId}`, { 
      params: { 
        sortBy: 'helpful',
        ...params 
      } 
    });
    return response.data;
  },
};

export default reviewApi;
