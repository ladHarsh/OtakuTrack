const Watchlist = require('../models/Watchlist');
const Show = require('../models/Show');
const { trackWatchlistAddInternal, updateWatchlistStatusInternal, trackEpisodeWatchedInternal } = require('./analyticsController');

// @desc    Get user's watchlist
// @route   GET /api/watchlist
// @access  Private
const getUserWatchlist = async (req, res) => {
  try {
    const watchlist = await Watchlist.find({ userId: req.user._id })
      .populate('showId', 'title poster genres rating episodes')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: watchlist
    });
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get watchlist by status
// @route   GET /api/watchlist/status/:status
// @access  Private
const getWatchlistByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ['Watching', 'Completed', 'On Hold', 'Dropped', 'Plan to Watch'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const watchlist = await Watchlist.find({ 
      userId: req.user._id, 
      status: status 
    })
      .populate('showId', 'title poster genres rating episodes')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: watchlist
    });
  } catch (error) {
    console.error('Get watchlist by status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get watchlist item by show ID
// @route   GET /api/watchlist/show/:showId
// @access  Private
const getWatchlistItemByShow = async (req, res) => {
  try {
    const { showId } = req.params;

    const watchlistItem = await Watchlist.findOne({
      userId: req.user._id,
      showId: showId
    }).populate('showId', 'title poster genres rating episodes');

    if (!watchlistItem) {
      return res.json({
        success: true,
        data: null
      });
    }

    res.json({
      success: true,
      data: watchlistItem
    });
  } catch (error) {
    console.error('Get watchlist item by show error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add show to watchlist
// @route   POST /api/watchlist
// @access  Private
const addToWatchlist = async (req, res) => {
  try {
    const { showId, status, notes } = req.body;

    // Check if show exists
    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found'
      });
    }

    // Check if already in watchlist
    const existingItem = await Watchlist.findOne({
      userId: req.user._id,
      showId: showId
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Show already in watchlist'
      });
    }

    // Create watchlist item
    const watchlistItem = await Watchlist.create({
      userId: req.user._id,
      showId: showId,
      status: status || 'Plan to Watch',
      notes: notes || '',
      progress: {
        totalEpisodes: show.episodes ? show.episodes.length : 0
      }
    });

    const populatedItem = await Watchlist.findById(watchlistItem._id)
      .populate('showId', 'title poster genres rating episodes');

    // Track analytics
    try {
      await trackWatchlistAddInternal(req.user._id, showId);
    } catch (analyticsError) {
      console.error('Analytics tracking error:', analyticsError);
    }

    res.status(201).json({
      success: true,
      data: populatedItem
    });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update watchlist item
// @route   PUT /api/watchlist/:id
// @access  Private
const updateWatchlistItem = async (req, res) => {
  try {
    const { status, progress, rating, notes } = req.body;

    const watchlistItem = await Watchlist.findById(req.params.id);

    if (!watchlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist item not found'
      });
    }

    // Check if user owns this item
    if (watchlistItem.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this item'
      });
    }

    // Update fields
    if (status) watchlistItem.status = status;
    if (progress) watchlistItem.progress = { ...watchlistItem.progress, ...progress };
    if (rating !== undefined) watchlistItem.rating = rating;
    if (notes !== undefined) watchlistItem.notes = notes;

    // Update finish date if completed
    if (status === 'Completed' && !watchlistItem.finishDate) {
      watchlistItem.finishDate = new Date();
    }

    // Update last watched if progress changed
    if (progress && progress.currentEpisode) {
      watchlistItem.lastWatched = new Date();
    }

    const updatedItem = await watchlistItem.save();

    const populatedItem = await Watchlist.findById(updatedItem._id)
      .populate('showId', 'title poster genres rating episodes');

    // Track analytics for status changes
    if (status) {
      try {
        await updateWatchlistStatusInternal(req.user._id, status);
      } catch (analyticsError) {
        console.error('Analytics tracking error:', analyticsError);
      }
    }

    res.json({
      success: true,
      data: populatedItem
    });
  } catch (error) {
    console.error('Update watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Remove from watchlist
// @route   DELETE /api/watchlist/:id
// @access  Private
const removeFromWatchlist = async (req, res) => {
  try {
    const watchlistItem = await Watchlist.findById(req.params.id);

    if (!watchlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist item not found'
      });
    }

    // Check if user owns this item
    if (watchlistItem.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to remove this item'
      });
    }

    await Watchlist.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Removed from watchlist'
    });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update episode progress
// @route   PUT /api/watchlist/:id/progress
// @access  Private
const updateProgress = async (req, res) => {
  try {
    const { currentEpisode, rewatchCount } = req.body;

    const watchlistItem = await Watchlist.findById(req.params.id);

    if (!watchlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist item not found'
      });
    }

    // Check if user owns this item
    if (watchlistItem.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this item'
      });
    }

    // Calculate how many new episodes were watched
    let newEpisodesWatched = 0;
    if (currentEpisode !== undefined) {
      const previousEpisode = watchlistItem.progress.currentEpisode;
      newEpisodesWatched = Math.max(0, currentEpisode - previousEpisode);
      watchlistItem.progress.currentEpisode = currentEpisode;
    }
    
    if (rewatchCount !== undefined) {
      watchlistItem.progress.rewatchCount = rewatchCount;
    }

    // Update last watched
    watchlistItem.lastWatched = new Date();

    // Auto-update status based on progress
    if (watchlistItem.progress.currentEpisode >= watchlistItem.progress.totalEpisodes) {
      watchlistItem.status = 'Completed';
      watchlistItem.finishDate = new Date();
    } else if (watchlistItem.progress.currentEpisode > 0) {
      watchlistItem.status = 'Watching';
    }

    const updatedItem = await watchlistItem.save();

    // Track analytics for new episodes watched
    if (newEpisodesWatched > 0) {
      try {
        // Get show duration for accurate time tracking
        const show = await Show.findById(watchlistItem.showId);
        const episodeDuration = show?.episodes?.[0]?.duration || 24; // Default 24 minutes
        
        // Track each new episode watched
        for (let i = 0; i < newEpisodesWatched; i++) {
          const result = await trackEpisodeWatchedInternal(req.user._id, watchlistItem.showId, episodeDuration);
        }
      } catch (analyticsError) {
        console.error('❌ Analytics tracking error:', analyticsError);
        console.error('   - Error details:', analyticsError.message);
        console.error('   - Stack trace:', analyticsError.stack);
      }
    }

    const populatedItem = await Watchlist.findById(updatedItem._id)
      .populate('showId', 'title poster genres rating episodes');

    res.json({
      success: true,
      data: populatedItem
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get watchlist statistics
// @route   GET /api/watchlist/stats
// @access  Private
const getWatchlistStats = async (req, res) => {
  try {
    const stats = await Watchlist.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalEpisodes: { $sum: '$progress.currentEpisode' }
        }
      }
    ]);

    const totalShows = await Watchlist.countDocuments({ userId: req.user._id });
    const completedShows = await Watchlist.countDocuments({ 
      userId: req.user._id, 
      status: 'Completed' 
    });

    const statsObj = {
      totalShows,
      completedShows,
      completionRate: totalShows > 0 ? Math.round((completedShows / totalShows) * 100) : 0,
      byStatus: {}
    };

    stats.forEach(stat => {
      statsObj.byStatus[stat._id] = {
        count: stat.count,
        totalEpisodes: stat.totalEpisodes
      };
    });

    res.json({
      success: true,
      data: statsObj
    });
  } catch (error) {
    console.error('Get watchlist stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getUserWatchlist,
  getWatchlistByStatus,
  getWatchlistItemByShow,
  addToWatchlist,
  updateWatchlistItem,
  removeFromWatchlist,
  updateProgress,
  getWatchlistStats
};
