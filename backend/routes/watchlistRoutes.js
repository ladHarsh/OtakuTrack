const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getUserWatchlist,
  getWatchlistByStatus,
  getWatchlistItemByShow,
  addToWatchlist,
  updateWatchlistItem,
  removeFromWatchlist,
  updateProgress,
  getWatchlistStats
} = require('../controllers/watchlistController');

const router = express.Router();

// All routes are protected
router.use(protect);

// Watchlist management
router.get('/', getUserWatchlist);
router.get('/status/:status', getWatchlistByStatus);
router.get('/show/:showId', getWatchlistItemByShow);
router.get('/stats', getWatchlistStats);
router.post('/', addToWatchlist);
router.put('/:id', updateWatchlistItem);
router.delete('/:id', removeFromWatchlist);
router.put('/:id/progress', updateProgress);

module.exports = router;
