const Show = require('../models/Show');
const RecommendationEngine = require('../utils/recommendationEngine');

// @desc    Get all shows with filtering and pagination
// @route   GET /api/shows
// @access  Public
const getShows = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {}; // Temporarily removed isActive filter for debugging
    
    if (req.query.genre) {
      filter.genres = { $in: req.query.genre.split(',') };
    }
    
    if (req.query.tag) {
      filter.tags = { $in: req.query.tag.split(',') };
    }
    
    if (req.query.type) {
      filter.type = req.query.type;
    }
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.year) {
      filter.year = parseInt(req.query.year);
    }
    
    if (req.query.season) {
      filter.season = req.query.season;
    }
    
    if (req.query.search) {
      const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const phrase = escapeRegex(req.query.search.trim());
      // Case-insensitive phrase match on title fields
      filter.$or = [
        { title: { $regex: phrase, $options: 'i' } },
        { originalTitle: { $regex: phrase, $options: 'i' } }
      ];
    }

    // Build sort object
    let sort = {};
    if (req.query.sortBy === 'rating') {
      sort = { 'rating.average': -1, 'rating.count': -1 };
    } else if (req.query.sortBy === 'title') {
      sort = { title: 1 };
    } else if (req.query.sortBy === 'year') {
      sort = { year: -1 };
    } else if (req.query.sortBy === 'newest') {
      sort = { createdAt: -1 };
    } else {
      sort = { 'rating.average': -1, 'rating.count': -1 }; // Default sort
    }

    const shows = await Show.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Show.countDocuments(filter);

    res.json({
      success: true,
      data: shows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get shows error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single show by ID
// @route   GET /api/shows/:id
// @access  Public
const getShowById = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('rating')
      .select('-__v');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found'
      });
    }

    res.json({
      success: true,
      data: show
    });
  } catch (error) {
    console.error('Get show by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new show
// @route   POST /api/shows
// @access  Private/Admin
const createShow = async (req, res) => {
  try {
    const show = await Show.create(req.body);

    res.status(201).json({
      success: true,
      data: show
    });
  } catch (error) {
    console.error('Create show error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update show
// @route   PUT /api/shows/:id
// @access  Private/Admin
const updateShow = async (req, res) => {
  try {
    const show = await Show.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found'
      });
    }

    res.json({
      success: true,
      data: show
    });
  } catch (error) {
    console.error('Update show error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete show
// @route   DELETE /api/shows/:id
// @access  Private/Admin
const deleteShow = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id);

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found'
      });
    }

    // Soft delete - just mark as inactive
    show.isActive = false;
    await show.save();

    res.json({
      success: true,
      message: 'Show deleted successfully'
    });
  } catch (error) {
    console.error('Delete show error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get popular shows
// @route   GET /api/shows/popular
// @access  Public
const getPopularShows = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const shows = await RecommendationEngine.getPopularShows(limit);

    res.json({
      success: true,
      data: shows
    });
  } catch (error) {
    console.error('Get popular shows error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get trending shows
// @route   GET /api/shows/trending
// @access  Public
const getTrendingShows = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const shows = await RecommendationEngine.getTrendingShows(limit);

    res.json({
      success: true,
      data: shows
    });
  } catch (error) {
    console.error('Get trending shows error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get shows by genre
// @route   GET /api/shows/genre/:genre
// @access  Public
const getShowsByGenre = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const shows = await RecommendationEngine.getShowsByGenre(req.params.genre, limit);

    res.json({
      success: true,
      data: shows
    });
  } catch (error) {
    console.error('Get shows by genre error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get similar shows
// @route   GET /api/shows/:id/similar
// @access  Public
const getSimilarShows = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const shows = await RecommendationEngine.getSimilarShows(req.params.id, limit);

    res.json({
      success: true,
      data: shows
    });
  } catch (error) {
    console.error('Get similar shows error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get seasonal shows
// @route   GET /api/shows/seasonal/:season/:year
// @access  Public
const getSeasonalShows = async (req, res) => {
  try {
    const { season, year } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const shows = await RecommendationEngine.getSeasonalRecommendations(season, parseInt(year), limit);

    res.json({
      success: true,
      data: shows
    });
  } catch (error) {
    console.error('Get seasonal shows error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getShows,
  getShowById,
  createShow,
  updateShow,
  deleteShow,
  getPopularShows,
  getTrendingShows,
  getShowsByGenre,
  getSimilarShows,
  getSeasonalShows
};
