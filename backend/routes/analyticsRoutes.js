const express = require('express');
const router = express.Router();
const {
  getUserAnalytics,
  getGlobalAnalytics,
  getPublicAnalytics,
  trackEpisodeWatched,
  trackReviewPosted,
  trackWatchlistAdd,
  trackClubActivity,
  updateWatchlistStatus,
  getAnalyticsDashboard
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// Public routes
router.get('/public', getPublicAnalytics);

// Protected routes
router.use(protect);

// Admin-only routes
router.get('/global', admin, getGlobalAnalytics);

// Get analytics dashboard (must come before :userId to avoid conflict)
router.get('/dashboard', getAnalyticsDashboard);

// Get user analytics
router.get('/:userId', getUserAnalytics);

// Tracking routes
router.post('/track-episode', trackEpisodeWatched);
router.post('/track-review', trackReviewPosted);
router.post('/track-watchlist', trackWatchlistAdd);
router.post('/track-club', trackClubActivity);
router.post('/update-watchlist-status', updateWatchlistStatus);

module.exports = router;
