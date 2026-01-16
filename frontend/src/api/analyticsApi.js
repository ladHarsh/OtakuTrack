import axios from 'axios';

// Ensure API_URL ends with /api
let API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
if (!API_URL.endsWith('/api')) {
  API_URL += '/api';
}

// Create axios instance with auth token
const analyticsApi = axios.create({
  baseURL: `${API_URL}/analytics`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
analyticsApi.interceptors.request.use(
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

// Analytics API functions

/**
 * Get user analytics data
 * @param {string} userId - User ID
 * @returns {Promise} User analytics data
 */
export const getUserAnalytics = async (userId) => {
  try {
    const response = await analyticsApi.get(`/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get global analytics data (Admin only)
 * @returns {Promise} Global analytics data
 */
export const getGlobalAnalytics = async () => {
  try {
    const response = await analyticsApi.get('/global');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get public analytics data (Basic stats for all users)
 * @returns {Promise} Public analytics data
 */
export const getPublicAnalytics = async () => {
  try {
    const response = await analyticsApi.get('/public');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get analytics dashboard data for current user
 * @returns {Promise} Dashboard analytics data
 */
export const getAnalyticsDashboard = async () => {
  try {
    const response = await analyticsApi.get('/dashboard');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Track episode watched
 * @param {Object} data - Episode data
 * @param {string} data.showId - Show ID
 * @param {number} data.episodeNumber - Episode number
 * @param {number} data.episodeDuration - Episode duration in minutes
 * @returns {Promise} Tracking response
 */
export const trackEpisodeWatched = async (data) => {
  try {
    const response = await analyticsApi.post('/track-episode', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Track review posted
 * @param {Object} data - Review data
 * @param {string} data.showId - Show ID
 * @returns {Promise} Tracking response
 */
export const trackReviewPosted = async (data) => {
  try {
    const response = await analyticsApi.post('/track-review', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Track show added to watchlist
 * @param {Object} data - Watchlist data
 * @param {string} data.showId - Show ID
 * @returns {Promise} Tracking response
 */
export const trackWatchlistAdd = async (data) => {
  try {
    const response = await analyticsApi.post('/track-watchlist', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Track club activity
 * @param {Object} data - Club activity data
 * @param {string} data.activityType - Type of activity ('post', 'like', 'join')
 * @param {string} data.clubId - Club ID
 * @returns {Promise} Tracking response
 */
export const trackClubActivity = async (data) => {
  try {
    const response = await analyticsApi.post('/track-club', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update watchlist status tracking
 * @param {Object} data - Status data
 * @param {string} data.status - New status
 * @returns {Promise} Update response
 */
export const updateWatchlistStatus = async (data) => {
  try {
    const response = await analyticsApi.post('/update-watchlist-status', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default analyticsApi;
