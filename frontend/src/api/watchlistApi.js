import api from './authApi';

export const watchlistApi = {
  // Get user's watchlist
  getUserWatchlist: async () => {
    const response = await api.get('/watchlist');
    return response.data;
  },

  // Get watchlist item for a specific show
  getWatchlistItem: async (showId) => {
    const response = await api.get(`/watchlist/show/${showId}`);
    return response.data;
  },

  // Get watchlist by status
  getWatchlistByStatus: async (status) => {
    const response = await api.get(`/watchlist/status/${status}`);
    return response.data;
  },

  // Add show to watchlist
  addToWatchlist: async (data) => {
    const response = await api.post('/watchlist', data);
    return response.data;
  },

  // Update watchlist item
  updateWatchlistItem: async (id, updates) => {
    const response = await api.put(`/watchlist/${id}`, updates);
    return response.data;
  },

  // Remove from watchlist
  removeFromWatchlist: async (id) => {
    const response = await api.delete(`/watchlist/${id}`);
    return response.data;
  },

  // Update episode progress
  updateProgress: async (id, currentEpisode, rewatchCount) => {
    const response = await api.put(`/watchlist/${id}/progress`, {
      currentEpisode,
      rewatchCount,
    });
    return response.data;
  },

  // Get watchlist statistics
  getWatchlistStats: async () => {
    const response = await api.get('/watchlist/stats');
    return response.data;
  },

  // Update show status
  updateStatus: async (id, status) => {
    const response = await api.put(`/watchlist/${id}`, { status });
    return response.data;
  },

  // Add rating to watchlist item
  addRating: async (id, rating) => {
    const response = await api.put(`/watchlist/${id}`, { rating });
    return response.data;
  },

  // Add notes to watchlist item
  addNotes: async (id, notes) => {
    const response = await api.put(`/watchlist/${id}`, { notes });
    return response.data;
  },
};

export default watchlistApi;
