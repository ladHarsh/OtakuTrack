const mongoose = require('mongoose');

// Schema for tracking individual user analytics
const userAnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Episode watching statistics
  episodesWatched: {
    type: Number,
    default: 0
  },
  totalWatchTime: {
    type: Number, // in minutes
    default: 0
  },
  // Watchlist statistics
  showsInWatchlist: {
    type: Number,
    default: 0
  },
  completedShows: {
    type: Number,
    default: 0
  },
  watchingShows: {
    type: Number,
    default: 0
  },
  onHoldShows: {
    type: Number,
    default: 0
  },
  droppedShows: {
    type: Number,
    default: 0
  },
  planToWatchShows: {
    type: Number,
    default: 0
  },
  // Review and interaction statistics
  reviewsPosted: {
    type: Number,
    default: 0
  },
  commentsPosted: {
    type: Number,
    default: 0
  },
  // Club participation
  clubPosts: {
    type: Number,
    default: 0
  },
  clubLikes: {
    type: Number,
    default: 0
  },
  clubsJoined: {
    type: Number,
    default: 0
  },
  // Genre preferences (tracked from watchlist)
  favoriteGenres: [{
    genre: {
      type: String,
      enum: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Thriller', 'Sports', 'Supernatural', 'Psychological', 'Historical', 'Military', 'Parody', 'School', 'Seinen', 'Shoujo', 'Shounen', 'Josei']
    },
    count: {
      type: Number,
      default: 0
    }
  }],
  // Activity tracking
  lastActivity: {
    type: Date,
    default: Date.now
  },
  // Weekly and monthly activity
  weeklyActivity: {
    episodesWatched: { type: Number, default: 0 },
    showsAdded: { type: Number, default: 0 },
    reviewsPosted: { type: Number, default: 0 },
    clubPosts: { type: Number, default: 0 },
    pollVotes: { type: Number, default: 0 }
  },
  monthlyActivity: {
    episodesWatched: { type: Number, default: 0 },
    showsAdded: { type: Number, default: 0 },
    reviewsPosted: { type: Number, default: 0 },
    clubPosts: { type: Number, default: 0 },
    pollVotes: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Schema for global site analytics
const globalAnalyticsSchema = new mongoose.Schema({
  // Site-wide statistics
  totalUsers: {
    type: Number,
    default: 0
  },
  totalShows: {
    type: Number,
    default: 0
  },
  totalEpisodesTracked: {
    type: Number,
    default: 0
  },
  totalWatchTime: {
    type: Number, // in minutes
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalClubs: {
    type: Number,
    default: 0
  },
  // Most popular content
  mostWatchedShows: [{
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show'
    },
    title: String,
    watchCount: {
      type: Number,
      default: 0
    }
  }],
  topGenres: [{
    genre: {
      type: String,
      enum: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Thriller', 'Sports', 'Supernatural', 'Psychological', 'Historical', 'Military', 'Parody', 'School', 'Seinen', 'Shoujo', 'Shounen', 'Josei']
    },
    count: {
      type: Number,
      default: 0
    }
  }],
  // Activity trends
  dailyActiveUsers: {
    type: Number,
    default: 0
  },
  weeklyActiveUsers: {
    type: Number,
    default: 0
  },
  monthlyActiveUsers: {
    type: Number,
    default: 0
  },
  // Recent activity
  recentActivity: [{
    type: {
      type: String,
      enum: ['episode_watched', 'review_posted', 'show_added', 'club_joined']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Create indexes for better query performance
userAnalyticsSchema.index({ 'lastActivity': -1 });
userAnalyticsSchema.index({ 'episodesWatched': -1 });

globalAnalyticsSchema.index({ createdAt: -1 });

// Virtual for user engagement score
userAnalyticsSchema.virtual('engagementScore').get(function() {
  const episodeScore = this.episodesWatched * 10;
  const reviewScore = this.reviewsPosted * 50;
  const clubScore = (this.clubPosts + this.clubLikes) * 5;
  const watchlistScore = this.showsInWatchlist * 2;
  
  return episodeScore + reviewScore + clubScore + watchlistScore;
});

// Virtual for average episodes per day
userAnalyticsSchema.virtual('avgEpisodesPerDay').get(function() {
  const daysSinceJoin = Math.max(1, Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)));
  return (this.episodesWatched / daysSinceJoin).toFixed(2);
});

// Ensure virtual fields are serialized
userAnalyticsSchema.set('toJSON', { virtuals: true });
userAnalyticsSchema.set('toObject', { virtuals: true });

globalAnalyticsSchema.set('toJSON', { virtuals: true });
globalAnalyticsSchema.set('toObject', { virtuals: true });

// Create models
const UserAnalytics = mongoose.model('UserAnalytics', userAnalyticsSchema);
const GlobalAnalytics = mongoose.model('GlobalAnalytics', globalAnalyticsSchema);

module.exports = {
  UserAnalytics,
  GlobalAnalytics
};
