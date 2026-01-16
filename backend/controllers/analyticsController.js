const mongoose = require('mongoose');
const { UserAnalytics, GlobalAnalytics } = require('../models/Analytics');
const User = require('../models/User');
const Show = require('../models/Show');
const Watchlist = require('../models/Watchlist');
const Review = require('../models/Review');
const Club = require('../models/Club');

// @desc    Get user analytics
// @route   GET /api/analytics/:userId
// @access  Private
const getUserAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get or create user analytics
    let userAnalytics = await UserAnalytics.findOne({ userId });
    
    if (!userAnalytics) {
      // Create new analytics record if it doesn't exist
      userAnalytics = new UserAnalytics({ userId });
      
      // Initialize weekly and monthly activity
      const now = new Date();
      userAnalytics.weeklyActivity = {
        episodesWatched: 0,
        showsAdded: 0,
        reviewsPosted: 0,
        clubPosts: 0,
        pollVotes: 0,
        lastReset: now
      };
      
      userAnalytics.monthlyActivity = {
        episodesWatched: 0,
        showsAdded: 0,
        reviewsPosted: 0,
        clubPosts: 0,
        pollVotes: 0,
        lastReset: now
      };
      
      await userAnalytics.save();
    }

    // Populate user data
    await userAnalytics.populate('userId', 'name email avatar');

    res.json({
      success: true,
      data: userAnalytics
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get global analytics
// @route   GET /api/analytics/global
// @access  Admin Only
const getGlobalAnalytics = async (req, res) => {
  try {
    // Get or create global analytics
    let globalAnalytics = await GlobalAnalytics.findOne().sort({ createdAt: -1 });
    
    if (!globalAnalytics) {
      globalAnalytics = new GlobalAnalytics();
      await globalAnalytics.save();
    }

    // Update global statistics
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalShows = await Show.countDocuments();
    const totalReviews = await Review.countDocuments();
    const totalClubs = await Club.countDocuments();

    // Calculate total episodes tracked and watch time
    const watchlistStats = await Watchlist.aggregate([
      {
        $group: {
          _id: null,
          totalEpisodes: { $sum: '$progress.currentEpisode' },
          totalWatchTime: { $sum: { $multiply: ['$progress.currentEpisode', 24] } } // Assuming 24 min per episode
        }
      }
    ]);

    const totalEpisodesTracked = watchlistStats.length > 0 ? watchlistStats[0].totalEpisodes : 0;
    const totalWatchTime = watchlistStats.length > 0 ? watchlistStats[0].totalWatchTime : 0;

    // Get most watched shows
    const mostWatchedShows = await Watchlist.aggregate([
      {
        $group: {
          _id: '$showId',
          watchCount: { $sum: 1 }
        }
      },
      {
        $sort: { watchCount: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'shows',
          localField: '_id',
          foreignField: '_id',
          as: 'show'
        }
      },
      {
        $unwind: '$show'
      },
      {
        $project: {
          showId: '$_id',
          title: '$show.title',
          watchCount: 1
        }
      }
    ]);

         // Get top genres
     const topGenres = await Watchlist.aggregate([
       {
         $lookup: {
           from: 'shows',
           localField: 'showId',
           foreignField: '_id',
           as: 'show'
         }
       },
       {
         $unwind: '$show'
       },
       {
         $unwind: '$show.genres'
       },
       {
         $group: {
           _id: '$show.genres',
           count: { $sum: 1 }
         }
       },
       {
         $sort: { count: -1 }
       },
       {
         $limit: 10
       },
       {
         $project: {
           genre: '$_id',
           count: 1
         }
       }
     ]);

     // Transform the data to match the schema
     const transformedTopGenres = topGenres.map(item => ({
       genre: item.genre,
       count: item.count
     }));

     // Calculate active users
     const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
     const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
     const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

     const dailyActiveUsers = await UserAnalytics.countDocuments({
       lastActivity: { $gte: oneDayAgo }
     });

     const weeklyActiveUsers = await UserAnalytics.countDocuments({
       lastActivity: { $gte: oneWeekAgo }
     });

     const monthlyActiveUsers = await UserAnalytics.countDocuments({
       lastActivity: { $gte: oneMonthAgo }
     });

     // Update global analytics
     globalAnalytics.totalUsers = totalUsers;
     globalAnalytics.totalShows = totalShows;
     globalAnalytics.totalEpisodesTracked = totalEpisodesTracked;
     globalAnalytics.totalWatchTime = totalWatchTime;
     globalAnalytics.totalReviews = totalReviews;
     globalAnalytics.totalClubs = totalClubs;
     globalAnalytics.mostWatchedShows = mostWatchedShows;
     globalAnalytics.topGenres = transformedTopGenres;
     globalAnalytics.dailyActiveUsers = dailyActiveUsers;
     globalAnalytics.weeklyActiveUsers = weeklyActiveUsers;
     globalAnalytics.monthlyActiveUsers = monthlyActiveUsers;

    await globalAnalytics.save();

    res.json({
      success: true,
      data: globalAnalytics
    });
  } catch (error) {
    console.error('Get global analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Track episode watched
// @route   POST /api/analytics/track-episode
// @access  Private
const trackEpisodeWatched = async (req, res) => {
  try {
    const { showId, episodeNumber, episodeDuration = 24 } = req.body;
    const userId = req.user._id;

    // Get or create user analytics
    let userAnalytics = await UserAnalytics.findOne({ userId });
    
    if (!userAnalytics) {
      userAnalytics = new UserAnalytics({ userId });
      
      // Initialize weekly and monthly activity
      const now = new Date();
      userAnalytics.weeklyActivity = {
        episodesWatched: 0,
        showsAdded: 0,
        reviewsPosted: 0,
        clubPosts: 0,
        pollVotes: 0,
        lastReset: now
      };
      
      userAnalytics.monthlyActivity = {
        episodesWatched: 0,
        showsAdded: 0,
        reviewsPosted: 0,
        clubPosts: 0,
        pollVotes: 0,
        lastReset: now
      };
    }

    // Update episode statistics
    userAnalytics.episodesWatched += 1;
    userAnalytics.totalWatchTime += episodeDuration;
    userAnalytics.lastActivity = new Date();

    // Update weekly activity - simplified logic
    if (!userAnalytics.weeklyActivity) {
      userAnalytics.weeklyActivity = {
        episodesWatched: 0,
        showsAdded: 0,
        reviewsPosted: 0,
        clubPosts: 0,
        pollVotes: 0,
        lastReset: new Date()
      };
    }
    
    // Always update current week's activity
    userAnalytics.weeklyActivity.episodesWatched += 1;

    // Update monthly activity - simplified logic
    if (!userAnalytics.monthlyActivity) {
      userAnalytics.monthlyActivity = {
        episodesWatched: 0,
        showsAdded: 0,
        reviewsPosted: 0,
        clubPosts: 0,
        pollVotes: 0,
        lastReset: new Date()
      };
    }
    
    // Always update current month's activity
    userAnalytics.monthlyActivity.episodesWatched += 1;

    await userAnalytics.save();

    // Update global analytics recent activity
    await updateGlobalRecentActivity('episode_watched', userId, showId);

    res.json({
      success: true,
      message: 'Episode tracked successfully',
      data: {
        episodesWatched: userAnalytics.episodesWatched,
        totalWatchTime: userAnalytics.totalWatchTime
      }
    });
  } catch (error) {
    console.error('Track episode error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Track review posted
// @route   POST /api/analytics/track-review
// @access  Private
const trackReviewPosted = async (req, res) => {
  try {
    const { showId } = req.body;
    const userId = req.user._id;

    // Call internal tracking function
    await trackReviewPostedInternal(userId, showId);

    res.json({
      success: true,
      message: 'Review tracked successfully'
    });
  } catch (error) {
    console.error('Track review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Track show added to watchlist
// @route   POST /api/analytics/track-watchlist
// @access  Private
const trackWatchlistAdd = async (req, res) => {
  try {
    const { showId } = req.body;
    const userId = req.user._id;

    // Call internal tracking function
    await trackWatchlistAddInternal(userId, showId);

    res.json({
      success: true,
      message: 'Watchlist addition tracked successfully'
    });
  } catch (error) {
    console.error('Track watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Internal function for tracking watchlist additions
const trackWatchlistAddInternal = async (userId, showId) => {
  try {
    // Get or create user analytics
    let userAnalytics = await UserAnalytics.findOne({ userId });
    
    if (!userAnalytics) {
      userAnalytics = new UserAnalytics({ userId });
      
      // Initialize weekly and monthly activity
      const now = new Date();
      userAnalytics.weeklyActivity = {
        episodesWatched: 0,
        showsAdded: 0,
        reviewsPosted: 0,
        clubPosts: 0,
        pollVotes: 0,
        lastReset: now
      };
      
      userAnalytics.monthlyActivity = {
        episodesWatched: 0,
        showsAdded: 0,
        reviewsPosted: 0,
        clubPosts: 0,
        pollVotes: 0,
        lastReset: now
      };
    }

    // Update watchlist statistics
    userAnalytics.showsInWatchlist += 1;
    userAnalytics.lastActivity = new Date();

    // Update weekly activity
    if (!userAnalytics.weeklyActivity) {
      userAnalytics.weeklyActivity = {
        episodesWatched: 0,
        showsAdded: 0,
        reviewsPosted: 0,
        clubPosts: 0,
        pollVotes: 0,
        lastReset: new Date()
      };
    }
    userAnalytics.weeklyActivity.showsAdded += 1;

    // Update monthly activity
    if (!userAnalytics.monthlyActivity) {
      userAnalytics.monthlyActivity = {
        episodesWatched: 0,
        showsAdded: 0,
        reviewsPosted: 0,
        clubPosts: 0,
        pollVotes: 0,
        lastReset: new Date()
      };
    }
    userAnalytics.monthlyActivity.showsAdded += 1;

    // Update favorite genres
    const show = await Show.findById(showId);
    if (show && show.genres) {
      show.genres.forEach(genre => {
        const existingGenre = userAnalytics.favoriteGenres.find(g => g.genre === genre);
        if (existingGenre) {
          existingGenre.count += 1;
        } else {
          userAnalytics.favoriteGenres.push({ genre, count: 1 });
        }
      });
    }

    await userAnalytics.save();

    // Update global analytics recent activity
    await updateGlobalRecentActivity('show_added', userId, showId);
  } catch (error) {
    console.error('Internal track watchlist error:', error);
    throw error;
  }
};

// Internal function for tracking episode watched
const trackEpisodeWatchedInternal = async (userId, showId, episodeDuration = 24) => {
  try {

    
    // Get or create user analytics
    let userAnalytics = await UserAnalytics.findOne({ userId });
    
    if (!userAnalytics) {
      userAnalytics = new UserAnalytics({ userId });
      
      // Initialize weekly and monthly activity
      const now = new Date();
      userAnalytics.weeklyActivity = {
        episodesWatched: 0,
        showsAdded: 0,
        reviewsPosted: 0,
        clubPosts: 0,
        pollVotes: 0,
        lastReset: now
      };
      
      userAnalytics.monthlyActivity = {
        episodesWatched: 0,
        showsAdded: 0,
        reviewsPosted: 0,
        clubPosts: 0,
        pollVotes: 0,
        lastReset: now
      };
      
    } else {
      // Ensure weekly and monthly activity exist for existing records
      if (!userAnalytics.weeklyActivity) {
        userAnalytics.weeklyActivity = {
          episodesWatched: 0,
          showsAdded: 0,
          reviewsPosted: 0,
          clubPosts: 0,
          pollVotes: 0,
          lastReset: new Date()
        };
      }
      
      if (!userAnalytics.monthlyActivity) {
        userAnalytics.monthlyActivity = {
          episodesWatched: 0,
          showsAdded: 0,
          reviewsPosted: 0,
          clubPosts: 0,
          pollVotes: 0,
          lastReset: new Date()
        };
      }
    }

    // Update episode statistics
    userAnalytics.episodesWatched += 1;
    userAnalytics.totalWatchTime += episodeDuration;
    userAnalytics.lastActivity = new Date();

    

    // Update weekly activity - simplified logic
    if (!userAnalytics.weeklyActivity) {
      userAnalytics.weeklyActivity = {
        episodesWatched: 0,
        showsAdded: 0,
        reviewsPosted: 0,
        clubPosts: 0,
        pollVotes: 0,
        lastReset: new Date()
      };
    }
    
    // Always update current week's activity
    
    userAnalytics.weeklyActivity.episodesWatched += 1;
    

    // Update monthly activity - simplified logic
    if (!userAnalytics.monthlyActivity) {
      userAnalytics.monthlyActivity = {
        episodesWatched: 0,
        showsAdded: 0,
        reviewsPosted: 0,
        clubPosts: 0,
        pollVotes: 0,
        lastReset: new Date()
      };
    }
    
    // Always update current month's activity
    userAnalytics.monthlyActivity.episodesWatched += 1;
    

    await userAnalytics.save();
    

    // Update global analytics recent activity
    await updateGlobalRecentActivity('episode_watched', userId, showId);
  } catch (error) {
    console.error('❌ Internal track episode error:', error);
    throw error;
  }
};

// Internal function for tracking review posts
const trackReviewPostedInternal = async (userId, showId) => {
  try {
    
    
    // Get or create user analytics
    let userAnalytics = await UserAnalytics.findOne({ userId });
    
    if (!userAnalytics) {
      userAnalytics = new UserAnalytics({ userId });
      
      // Initialize weekly and monthly activity
      const now = new Date();
      userAnalytics.weeklyActivity = {
        episodesWatched: 0,
        showsAdded: 0,
        reviewsPosted: 0,
        clubPosts: 0,
        pollVotes: 0,
        lastReset: now
      };
      
      userAnalytics.monthlyActivity = {
        episodesWatched: 0,
        showsAdded: 0,
        reviewsPosted: 0,
        clubPosts: 0,
        pollVotes: 0,
        lastReset: now
      };
      
      
    }

    // Update review statistics
    userAnalytics.reviewsPosted += 1;
    userAnalytics.lastActivity = new Date();

    

    // Update weekly activity - simplified logic
    if (!userAnalytics.weeklyActivity) {
      userAnalytics.weeklyActivity = {
        episodesWatched: 0,
        showsAdded: 0,
        reviewsPosted: 0,
        clubPosts: 0,
        pollVotes: 0,
        lastReset: new Date()
      };
    }
    
    // Always update current week's activity
    userAnalytics.weeklyActivity.reviewsPosted += 1;

    // Update monthly activity - simplified logic
    if (!userAnalytics.monthlyActivity) {
      userAnalytics.monthlyActivity = {
        episodesWatched: 0,
        showsAdded: 0,
        reviewsPosted: 0,
        clubPosts: 0,
        pollVotes: 0,
        lastReset: new Date()
      };
    }
    
    // Always update current month's activity
    userAnalytics.monthlyActivity.reviewsPosted += 1;

    await userAnalytics.save();
    

    // Update global analytics recent activity
    await updateGlobalRecentActivity('review_posted', userId, showId);
  } catch (error) {
    console.error('❌ Internal track review error:', error);
    throw error;
  }
};

// Internal function for updating watchlist status
const updateWatchlistStatusInternal = async (userId, status) => {
  try {
    
    
    // Get or create user analytics
    let userAnalytics = await UserAnalytics.findOne({ userId });
    
    if (!userAnalytics) {
      userAnalytics = new UserAnalytics({ userId });
      
      // Initialize weekly and monthly activity
      const now = new Date();
      userAnalytics.weeklyActivity = {
        episodesWatched: 0,
        showsAdded: 0,
        reviewsPosted: 0,
        clubPosts: 0,
        pollVotes: 0,
        lastReset: now
      };
      
      userAnalytics.monthlyActivity = {
        episodesWatched: 0,
        showsAdded: 0,
        reviewsPosted: 0,
        clubPosts: 0,
        pollVotes: 0,
        lastReset: now
      };
      
      
    }

    // Update watchlist status counters
    // First, get current watchlist counts for this user
    const Watchlist = require('../models/Watchlist');
    const statusCounts = await Watchlist.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Reset all status counters
    userAnalytics.watchingShows = 0;
    userAnalytics.completedShows = 0;
    userAnalytics.onHoldShows = 0;
    userAnalytics.droppedShows = 0;
    userAnalytics.planToWatchShows = 0;

    // Update counters based on actual watchlist data
    statusCounts.forEach(statusCount => {
      switch (statusCount._id) {
        case 'Watching':
          userAnalytics.watchingShows = statusCount.count;
          break;
        case 'Completed':
          userAnalytics.completedShows = statusCount.count;
          break;
        case 'On Hold':
          userAnalytics.onHoldShows = statusCount.count;
          break;
        case 'Dropped':
          userAnalytics.droppedShows = statusCount.count;
          break;
        case 'Plan to Watch':
          userAnalytics.planToWatchShows = statusCount.count;
          break;
      }
    });

    userAnalytics.lastActivity = new Date();
    await userAnalytics.save();
    
  } catch (error) {
    console.error('❌ Internal update watchlist status error:', error);
    throw error;
  }
};

// @desc    Track club activity
// @route   POST /api/analytics/track-club
// @access  Private
const trackClubActivity = async (req, res) => {
  try {
    const { activityType, clubId } = req.body; // activityType: 'post', 'like', 'join', 'poll_vote'
    const userId = req.user._id;

    // Get or create user analytics
    let userAnalytics = await UserAnalytics.findOne({ userId });
    
    if (!userAnalytics) {
      userAnalytics = new UserAnalytics({ userId });
      
      // Initialize weekly and monthly activity
      const now = new Date();
      userAnalytics.weeklyActivity = {
        episodesWatched: 0,
        showsAdded: 0,
        reviewsPosted: 0,
        clubPosts: 0,
        pollVotes: 0,
        lastReset: now
      };
      
      userAnalytics.monthlyActivity = {
        episodesWatched: 0,
        showsAdded: 0,
        reviewsPosted: 0,
        clubPosts: 0,
        pollVotes: 0,
        lastReset: now
      };
    }

    // Update club statistics based on activity type
    switch (activityType) {
      case 'post':
        userAnalytics.clubPosts += 1;
        break;
      case 'like':
        userAnalytics.clubLikes += 1;
        break;
      case 'join':
        userAnalytics.clubsJoined += 1;
        break;
      case 'poll_vote':
        // Poll votes are tracked in weekly/monthly activity only
        break;
    }

    // Update weekly activity - simplified logic
    if (!userAnalytics.weeklyActivity) {
      userAnalytics.weeklyActivity = {
        episodesWatched: 0,
        showsAdded: 0,
        reviewsPosted: 0,
        clubPosts: 0,
        pollVotes: 0,
        lastReset: new Date()
      };
    }
    
    // Always update current week's activity
    if (activityType === 'post') {
      userAnalytics.weeklyActivity.clubPosts += 1;
    } else if (activityType === 'poll_vote') {
      userAnalytics.weeklyActivity.pollVotes += 1;
    }

    // Update monthly activity - simplified logic
    if (!userAnalytics.monthlyActivity) {
      userAnalytics.monthlyActivity = {
        episodesWatched: 0,
        showsAdded: 0,
        reviewsPosted: 0,
        clubPosts: 0,
        pollVotes: 0,
        lastReset: new Date()
      };
    }
    
    // Always update current month's activity
    if (activityType === 'post') {
      userAnalytics.monthlyActivity.clubPosts += 1;
    } else if (activityType === 'poll_vote') {
      userAnalytics.monthlyActivity.pollVotes += 1;
    }

    userAnalytics.lastActivity = new Date();
    await userAnalytics.save();

    res.json({
      success: true,
      message: 'Club activity tracked successfully',
      data: {
        clubPosts: userAnalytics.clubPosts,
        clubLikes: userAnalytics.clubLikes,
        clubsJoined: userAnalytics.clubsJoined
      }
    });
  } catch (error) {
    console.error('Track club activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update watchlist status tracking
// @route   POST /api/analytics/update-watchlist-status
// @access  Private
const updateWatchlistStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.user._id;

    // Call internal tracking function
    await updateWatchlistStatusInternal(userId, status);

    res.json({
      success: true,
      message: 'Watchlist status updated successfully'
    });
  } catch (error) {
    console.error('Update watchlist status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Helper function to update global recent activity
const updateGlobalRecentActivity = async (activityType, userId, showId) => {
  try {
    let globalAnalytics = await GlobalAnalytics.findOne().sort({ createdAt: -1 });
    
    if (!globalAnalytics) {
      globalAnalytics = new GlobalAnalytics();
    }

    // Add recent activity (keep only last 50 activities)
    globalAnalytics.recentActivity.unshift({
      type: activityType,
      userId,
      showId,
      timestamp: new Date()
    });

    // Keep only last 50 activities
    if (globalAnalytics.recentActivity.length > 50) {
      globalAnalytics.recentActivity = globalAnalytics.recentActivity.slice(0, 50);
    }

    await globalAnalytics.save();
  } catch (error) {
    console.error('Update global recent activity error:', error);
  }
};

// @desc    Get public analytics (basic stats for all users)
// @route   GET /api/analytics/public
// @access  Public
const getPublicAnalytics = async (req, res) => {
  try {
    // Get basic public statistics
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalShows = await Show.countDocuments();
    const totalReviews = await Review.countDocuments();
    const totalClubs = await Club.countDocuments();

    // Get top 5 most watched shows (public info)
    const mostWatchedShows = await Watchlist.aggregate([
      {
        $group: {
          _id: '$showId',
          watchCount: { $sum: 1 }
        }
      },
      {
        $sort: { watchCount: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'shows',
          localField: '_id',
          foreignField: '_id',
          as: 'show'
        }
      },
      {
        $unwind: '$show'
      },
      {
        $project: {
          showId: '$_id',
          title: '$show.title',
          watchCount: 1
        }
      }
    ]);

    // Get top 5 genres (public info)
    const topGenres = await Watchlist.aggregate([
      {
        $lookup: {
          from: 'shows',
          localField: 'showId',
          foreignField: '_id',
          as: 'show'
        }
      },
      {
        $unwind: '$show'
      },
      {
        $unwind: '$show.genres'
      },
      {
        $group: {
          _id: '$show.genres',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          genre: '$_id',
          count: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalShows,
        totalReviews,
        totalClubs,
        mostWatchedShows,
        topGenres
      }
    });
  } catch (error) {
    console.error('Get public analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get analytics dashboard data
// @route   GET /api/analytics/dashboard
// @access  Private
const getAnalyticsDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user analytics
    let userAnalytics = await UserAnalytics.findOne({ userId });
    
    if (!userAnalytics) {
      userAnalytics = new UserAnalytics({ userId });
      
      // Initialize weekly and monthly activity
      const now = new Date();
      userAnalytics.weeklyActivity = {
        episodesWatched: 0,
        showsAdded: 0,
        reviewsPosted: 0,
        clubPosts: 0,
        pollVotes: 0,
        lastReset: now
      };
      
      userAnalytics.monthlyActivity = {
        episodesWatched: 0,
        showsAdded: 0,
        reviewsPosted: 0,
        clubPosts: 0,
        pollVotes: 0,
        lastReset: now
      };
      
      await userAnalytics.save();
    } else {
      // Ensure weekly and monthly activity exist for existing records
      if (!userAnalytics.weeklyActivity) {
        userAnalytics.weeklyActivity = {
          episodesWatched: 0,
          showsAdded: 0,
          reviewsPosted: 0,
          clubPosts: 0,
          pollVotes: 0,
          lastReset: new Date()
        };
      }
      
      if (!userAnalytics.monthlyActivity) {
        userAnalytics.monthlyActivity = {
          episodesWatched: 0,
          showsAdded: 0,
          reviewsPosted: 0,
          clubPosts: 0,
          pollVotes: 0,
          lastReset: new Date()
        };
      }
      
      // Debug logging removed
    }

    // Get global analytics
    let globalAnalytics = await GlobalAnalytics.findOne().sort({ createdAt: -1 });
    
    if (!globalAnalytics) {
      globalAnalytics = new GlobalAnalytics();
      await globalAnalytics.save();
    }

    // Get user's recent activity
    const recentWatchlist = await Watchlist.find({ userId })
      .populate('showId', 'title poster genres')
      .sort({ updatedAt: -1 })
      .limit(5);

    const recentReviews = await Review.find({ userId })
      .populate('showId', 'title poster')
      .sort({ createdAt: -1 })
      .limit(5);

    // Calculate actual counts from watchlist data for accuracy
    const watchlistStats = await Watchlist.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          watchingShows: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'Watching'] },
                1,
                0
              ]
            }
          },
          completedShows: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'Completed'] },
                1,
                0
              ]
            }
          },
          onHoldShows: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'On Hold'] },
                1,
                0
              ]
            }
          },
          droppedShows: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'Dropped'] },
                1,
                0
              ]
            }
          },
          planToWatchShows: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'Plan to Watch'] },
                1,
                0
              ]
            }
          },
          totalShowsInWatchlist: { $sum: 1 },
          totalEpisodesWatched: { $sum: '$progress.currentEpisode' }
        }
      }
    ]);

    // Get watchlist status distribution for Activity Distribution chart
    const watchlistStatusDistribution = await Watchlist.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1
        }
      }
    ]);

    
    
    // Debug logging removed
    // Update user analytics with accurate counts
    if (watchlistStats.length > 0) {
      const stats = watchlistStats[0];
      userAnalytics.watchingShows = stats.watchingShows || 0;
      userAnalytics.completedShows = stats.completedShows || 0;
      userAnalytics.onHoldShows = stats.onHoldShows || 0;
      userAnalytics.droppedShows = stats.droppedShows || 0;
      userAnalytics.planToWatchShows = stats.planToWatchShows || 0;
      userAnalytics.showsInWatchlist = stats.totalShowsInWatchlist || 0;
      
      // Update episodes watched from actual watchlist data
      const calculatedEpisodesWatched = stats.totalEpisodesWatched || 0;
      if (calculatedEpisodesWatched !== userAnalytics.episodesWatched) {
        userAnalytics.episodesWatched = calculatedEpisodesWatched;
      }
      
      await userAnalytics.save();
    }

    

    // Get all users sorted by episodes watched for proper ranking
    const allUsersRanked = await UserAnalytics.find({}, 'episodesWatched userId')
      .populate('userId', 'name')
      .sort({ episodesWatched: -1, _id: 1 }); // Sort by episodes (desc) then by ID for consistency
    
    // Find user's position in the sorted list
    const userPosition = allUsersRanked.findIndex(user => 
      user._id.toString() === userAnalytics._id.toString()
    );
    
    // Calculate rank (1-based indexing)
    const userRanking = userPosition >= 0 ? userPosition + 1 : allUsersRanked.length;
    
    // Get total users for ranking calculation
    const totalUsers = allUsersRanked.length;
    
    // Get top 3 users with names for comparison
    const topUsers = allUsersRanked.slice(0, 3).map((user, index) => ({
      rank: index + 1,
      episodesWatched: user.episodesWatched,
      name: user.userId?.name || 'Unknown User'
    }));
    
    

    
    
    res.json({
      success: true,
      data: {
        userAnalytics,
        globalAnalytics,
        recentWatchlist,
        recentReviews,
        userRanking,
        totalUsers,
        watchlistStatusDistribution,
        topUsers
      }
    });
  } catch (error) {
    console.error('Get analytics dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getUserAnalytics,
  getGlobalAnalytics,
  trackEpisodeWatched,
  trackReviewPosted,
  trackWatchlistAdd,
  trackClubActivity,
  updateWatchlistStatus,
  getAnalyticsDashboard,
  getPublicAnalytics,
  // Internal functions for use by other controllers
  trackWatchlistAddInternal,
  trackReviewPostedInternal,
  updateWatchlistStatusInternal,
  trackEpisodeWatchedInternal
};
