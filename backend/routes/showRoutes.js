const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getShows,
  getShowById,
  createShow,
  updateShow,
  deleteShow,
  getPopularShows,
  getTrendingShows,
  getShowsByGenre,
  getSimilarShows,
  getSeasonalShows,

} = require('../controllers/showController');

const router = express.Router();

// Public routes
router.get('/', getShows);
router.get('/popular', getPopularShows);
router.get('/trending', getTrendingShows);
router.get('/genre/:genre', getShowsByGenre);

router.get('/:id', getShowById);
router.get('/:id/similar', getSimilarShows);
router.get('/seasonal/:season/:year', getSeasonalShows);

// Protected routes (Admin only)
router.post('/', protect, admin, createShow);
router.put('/:id', protect, admin, updateShow);
router.delete('/:id', protect, admin, deleteShow);

module.exports = router;
