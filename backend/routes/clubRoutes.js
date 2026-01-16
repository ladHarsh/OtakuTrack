const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getClubs,
  getClubById,
  createClub,
  updateClub,
  deleteClub,
  joinClub,
  leaveClub,
  createPost,
  createPoll,
  voteOnPoll,
  addComment,
  togglePostLike,
  deletePost,
  editPost,
  deletePoll,
  deleteComment,
  getClubPosts,
  getClubPolls,
  getPollResults,
  closePoll
} = require('../controllers/clubController');

const router = express.Router();

// Public routes
router.get('/', getClubs);
router.get('/:id', getClubById);
router.get('/:id/posts', getClubPosts);
router.get('/:id/polls', getClubPolls);
router.get('/:clubId/polls/:pollId/results', getPollResults);

// Protected routes
router.use(protect);

router.post('/', createClub);
router.put('/:id', updateClub);
router.delete('/:id', deleteClub);
router.post('/:id/join', joinClub);
router.post('/:id/leave', leaveClub);

// Post routes
router.post('/:id/posts', createPost);
router.put('/:clubId/posts/:postId', editPost);
router.delete('/:clubId/posts/:postId', deletePost);
router.post('/:clubId/posts/:postId/comments', addComment);
router.delete('/:clubId/posts/:postId/comments/:commentId', deleteComment);
router.post('/:clubId/posts/:postId/like', togglePostLike);

// Poll routes
router.post('/:id/polls', createPoll);
router.delete('/:clubId/polls/:pollId', deletePoll);
router.post('/:clubId/polls/:pollId/vote', voteOnPoll);
router.put('/:clubId/polls/:pollId/close', closePoll);

module.exports = router;
