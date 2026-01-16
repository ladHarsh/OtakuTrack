const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getReviewsByShow,
  getUserReviews,
  createReview,
  updateReview,
  deleteReview,
  interactWithReview,
  reportReview
} = require('../controllers/reviewController');

const router = express.Router();

// Public routes
router.get('/show/:showId', getReviewsByShow);

// Protected routes
router.use(protect);

router.get('/user', getUserReviews);
router.post('/', createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);
router.post('/:id/:action', interactWithReview); // like, dislike, helpful
router.post('/:id/report', reportReview);

module.exports = router;
