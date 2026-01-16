import api from './authApi';

export const showApi = {
  // Get all shows with filtering and pagination
  getShows: async (params = {}) => {
    const response = await api.get('/shows', { params });
    return response.data;
  },

  // Get single show by ID
  getShowById: async (id) => {
    const response = await api.get(`/shows/${id}`);
    return response.data;
  },

  // Get popular shows
  getPopularShows: async (limit = 10) => {
    const response = await api.get('/shows/popular', { params: { limit } });
    return response.data;
  },

  // Get trending shows
  getTrendingShows: async (limit = 10) => {
    const response = await api.get('/shows/trending', { params: { limit } });
    return response.data;
  },

  // Get shows by genre
  getShowsByGenre: async (genre, limit = 20) => {
    const response = await api.get(`/shows/genre/${genre}`, { params: { limit } });
    return response.data;
  },

  // Get similar shows
  getSimilarShows: async (id, limit = 10) => {
    const response = await api.get(`/shows/${id}/similar`, { params: { limit } });
    return response.data;
  },

  // Get seasonal shows
  getSeasonalShows: async (season, year, limit = 20) => {
    const response = await api.get(`/shows/seasonal/${season}/${year}`, { params: { limit } });
    return response.data;
  },

  // Search shows
  searchShows: async (query, params = {}) => {
    const response = await api.get('/shows', { 
      params: { 
        search: query,
        ...params 
      } 
    });
    return response.data;
  },

  // Get shows by multiple filters
  getShowsByFilters: async (filters = {}) => {
    const response = await api.get('/shows', { params: filters });
    return response.data;
  },



  // Create new show (Admin only)
  createShow: async (showData) => {
    const response = await api.post('/shows', showData);
    return response.data;
  },

  // Update show (Admin only)
  updateShow: async (id, showData) => {
    const response = await api.put(`/shows/${id}`, showData);
    return response.data;
  },

  // Delete show (Admin only)
  deleteShow: async (id) => {
    const response = await api.delete(`/shows/${id}`);
    return response.data;
  },
};

export default showApi;
