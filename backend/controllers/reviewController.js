const Review = require('../models/Review');
const Show = require('../models/Show');
const { trackReviewPostedInternal } = require('./analyticsController');

// @desc    Get reviews for a show
// @route   GET /api/reviews/show/:showId
// @access  Public
const getReviewsByShow = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { showId: req.params.showId };
    
    if (req.query.rating) {
      filter.rating = parseInt(req.query.rating);
    }
    
    if (req.query.sortBy === 'helpful') {
      // Sort by helpful score (helpful - dislikes)
      const reviews = await Review.find(filter)
        .populate('userId', 'name avatar')
        .sort({ 'helpful.length': -1, 'dislikes.length': 1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Review.countDocuments(filter);
      
      return res.json({
        success: true,
        data: reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    }

    // Default sort by rating and date
    const reviews = await Review.find(filter)
      .populate('userId', 'name avatar')
      .sort({ rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(filter);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get reviews by show error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/user
// @access  Private
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .populate('showId', 'title poster')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { showId, rating, comment, title, isSpoiler, spoilerFor, tags } = req.body;
    
    // Removed debug logging

    // Check if show exists
    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found'
      });
    }

    // Check if user already reviewed this show
    const existingReview = await Review.findOne({
      userId: req.user._id,
      showId: showId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this show'
      });
    }

    // Create review
    const review = await Review.create({
      userId: req.user._id,
      showId,
      rating,
      comment,
      title,
      isSpoiler: isSpoiler || false,
      spoilerFor: spoilerFor || {},
      tags: tags || []
    });

    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'name avatar')
      .populate('showId', 'title poster');

    // Update show rating
    await updateShowRating(showId);

    // Track analytics
    try {
      await trackReviewPostedInternal(req.user._id, showId);
    } catch (analyticsError) {
      console.error('Analytics tracking error:', analyticsError);
    }

    res.status(201).json({
      success: true,
      data: populatedReview
    });
  } catch (error) {
    console.error('Create review error:', error);
    
    // If it's a validation error, return 400 with specific message
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
  try {
    const { rating, comment, title, isSpoiler, spoilerFor, tags } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns this review
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    // Store old values for edit history
    const oldValues = {
      comment: review.comment,
      rating: review.rating
    };

    // Update fields
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    if (title !== undefined) review.title = title;
    if (isSpoiler !== undefined) review.isSpoiler = isSpoiler;
    if (spoilerFor !== undefined) review.spoilerFor = spoilerFor;
    if (tags !== undefined) review.tags = tags;

    // Mark as edited and add to history
    review.isEdited = true;
    review.editHistory.push({
      comment: oldValues.comment,
      rating: oldValues.rating,
      editedAt: new Date()
    });

    const updatedReview = await review.save();

    const populatedReview = await Review.findById(updatedReview._id)
      .populate('userId', 'name avatar')
      .populate('showId', 'title poster');

    // Update show rating
    await updateShowRating(review.showId);

    res.json({
      success: true,
      data: populatedReview
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns this review
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    const showId = review.showId;
    await Review.findByIdAndDelete(req.params.id);

    // Update show rating
    await updateShowRating(showId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Like/dislike review
// @route   POST /api/reviews/:id/like
// @route   POST /api/reviews/:id/dislike
// @route   POST /api/reviews/:id/helpful
// @access  Private
const interactWithReview = async (req, res) => {
  try {
    const { action } = req.params; // like, dislike, or helpful
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const userId = req.user._id;
    let updated = false;

    if (action === 'like') {
      // Remove from dislikes if exists
      review.dislikes = review.dislikes.filter(d => d.userId.toString() !== userId.toString());
      
      // Toggle like
      const likeIndex = review.likes.findIndex(l => l.userId.toString() === userId.toString());
      if (likeIndex === -1) {
        review.likes.push({ userId, timestamp: new Date() });
      } else {
        review.likes.splice(likeIndex, 1);
      }
      updated = true;
    } else if (action === 'dislike') {
      // Remove from likes if exists
      review.likes = review.likes.filter(l => l.userId.toString() !== userId.toString());
      
      // Toggle dislike
      const dislikeIndex = review.dislikes.findIndex(d => d.userId.toString() === userId.toString());
      if (dislikeIndex === -1) {
        review.dislikes.push({ userId, timestamp: new Date() });
      } else {
        review.dislikes.splice(dislikeIndex, 1);
      }
      updated = true;
    } else if (action === 'helpful') {
      // Toggle helpful
      const helpfulIndex = review.helpful.findIndex(h => h.userId.toString() === userId.toString());
      if (helpfulIndex === -1) {
        review.helpful.push({ userId, timestamp: new Date() });
      } else {
        review.helpful.splice(helpfulIndex, 1);
      }
      updated = true;
    }

    if (updated) {
      await review.save();
    }

    res.json({
      success: true,
      data: {
        likes: review.likes.length,
        dislikes: review.dislikes.length,
        helpful: review.helpful.length
      }
    });
  } catch (error) {
    console.error('Interact with review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Report review
// @route   POST /api/reviews/:id/report
// @access  Private
const reportReview = async (req, res) => {
  try {
    const { reason } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user already reported this review
    if (review.isReported) {
      return res.status(400).json({
        success: false,
        message: 'Review already reported'
      });
    }

    review.isReported = true;
    review.reportReason = reason;
    await review.save();

    res.json({
      success: true,
      message: 'Review reported successfully'
    });
  } catch (error) {
    console.error('Report review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Helper function to update show rating
const updateShowRating = async (showId) => {
  try {
    const reviews = await Review.find({ showId });
    
    if (reviews.length === 0) {
      await Show.findByIdAndUpdate(showId, {
        'rating.average': 0,
        'rating.count': 0
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Show.findByIdAndUpdate(showId, {
      'rating.average': Math.round(averageRating * 10) / 10,
      'rating.count': reviews.length
    });
  } catch (error) {
    console.error('Update show rating error:', error);
  }
};

module.exports = {
  getReviewsByShow,
  getUserReviews,
  createReview,
  updateReview,
  deleteReview,
  interactWithReview,
  reportReview
};
