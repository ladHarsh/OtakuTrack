import api from './authApi';

export const clubApi = {
  // Get all clubs
  getClubs: async (params = {}) => {
    const response = await api.get('/clubs', { params });
    return response.data;
  },

  // Get single club by ID
  getClubById: async (id) => {
    const response = await api.get(`/clubs/${id}`);
    return response.data;
  },

  // Create new club
  createClub: async (clubData) => {
    const response = await api.post('/clubs', clubData);
    return response.data;
  },

  // Update club
  updateClub: async (id, clubData) => {
    const response = await api.put(`/clubs/${id}`, clubData);
    return response.data;
  },

  // Delete club
  deleteClub: async (id) => {
    const response = await api.delete(`/clubs/${id}`);
    return response.data;
  },

  // Join club
  joinClub: async (id) => {
    const response = await api.post(`/clubs/${id}/join`);
    return response.data;
  },

  // Leave club
  leaveClub: async (id) => {
    const response = await api.post(`/clubs/${id}/leave`);
    return response.data;
  },

  // Get club posts with pagination
  getClubPosts: async (clubId, params = {}) => {
    const response = await api.get(`/clubs/${clubId}/posts`, { params });
    return response.data;
  },

  // Get club polls with pagination
  getClubPolls: async (clubId, params = {}) => {
    const response = await api.get(`/clubs/${clubId}/polls`, { params });
    return response.data;
  },

  // Create post in club
  createPost: async (clubId, postData) => {
    const response = await api.post(`/clubs/${clubId}/posts`, postData);
    return response.data;
  },

  // Edit post in club
  editPost: async (clubId, postId, postData) => {
    const response = await api.put(`/clubs/${clubId}/posts/${postId}`, postData);
    return response.data;
  },

  // Delete post from club
  deletePost: async (clubId, postId) => {
    const response = await api.delete(`/clubs/${clubId}/posts/${postId}`);
    return response.data;
  },

  // Create poll in club
  createPoll: async (clubId, pollData) => {
    const response = await api.post(`/clubs/${clubId}/polls`, pollData);
    return response.data;
  },

  // Delete poll from club
  deletePoll: async (clubId, pollId) => {
    const response = await api.delete(`/clubs/${clubId}/polls/${pollId}`);
    return response.data;
  },

  // Vote on poll
  voteOnPoll: async (clubId, pollId, optionIndexes) => {
    const response = await api.post(`/clubs/${clubId}/polls/${pollId}/vote`, {
      optionIndexes,
    });
    return response.data;
  },

  // Get poll results with detailed statistics
  getPollResults: async (clubId, pollId) => {
    const response = await api.get(`/clubs/${clubId}/polls/${pollId}/results`);
    return response.data;
  },

  // Close poll manually
  closePoll: async (clubId, pollId) => {
    const response = await api.put(`/clubs/${clubId}/polls/${pollId}/close`);
    return response.data;
  },

  // Add comment to post
  addComment: async (clubId, postId, content) => {
    const response = await api.post(`/clubs/${clubId}/posts/${postId}/comments`, {
      content,
    });
    return response.data;
  },

  // Delete comment from post
  deleteComment: async (clubId, postId, commentId) => {
    const response = await api.delete(`/clubs/${clubId}/posts/${postId}/comments/${commentId}`);
    return response.data;
  },

  // Toggle post like
  togglePostLike: async (clubId, postId) => {
    const response = await api.post(`/clubs/${clubId}/posts/${postId}/like`);
    return response.data;
  },

  // Search clubs
  searchClubs: async (query, params = {}) => {
    const response = await api.get('/clubs', { 
      params: { 
        search: query,
        ...params 
      } 
    });
    return response.data;
  },

  // Get clubs by category
  getClubsByCategory: async (category, params = {}) => {
    const response = await api.get('/clubs', { 
      params: { 
        category,
        ...params 
      } 
    });
    return response.data;
  },

  // Get clubs by show
  getClubsByShow: async (showId) => {
    const response = await api.get(`/clubs/show/${showId}`);
    return response.data;
  },

  // Report club
  reportClub: async (id, reportData) => {
    const response = await api.post(`/clubs/${id}/report`, reportData);
    return response.data;
  },
};

export default clubApi;
