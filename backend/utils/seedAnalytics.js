const { UserAnalytics, GlobalAnalytics } = require('../models/Analytics');
const User = require('../models/User');
const Show = require('../models/Show');
const Watchlist = require('../models/Watchlist');
const Review = require('../models/Review');
const Club = require('../models/Club');

// Dummy data for testing analytics
const seedAnalyticsData = async () => {
  try {
    console.log('🌱 Seeding analytics data...');

    // Get existing users, shows, and other data
    const users = await User.find({});
    const shows = await Show.find({});
    const watchlists = await Watchlist.find({});
    const reviews = await Review.find({});
    const clubs = await Club.find({});

    if (users.length === 0) {
      console.log('❌ No users found. Please seed users first.');
      return;
    }

    if (shows.length === 0) {
      console.log('❌ No shows found. Please seed shows first.');
      return;
    }

    // Clear existing analytics data
    await UserAnalytics.deleteMany({});
    await GlobalAnalytics.deleteMany({});

    console.log('🧹 Cleared existing analytics data');

    // Create user analytics for each user
    const userAnalyticsPromises = users.map(async (user, index) => {
      // Generate realistic analytics data
      const episodesWatched = Math.floor(Math.random() * 500) + 10;
      const totalWatchTime = episodesWatched * 24; // 24 minutes per episode
      const showsInWatchlist = Math.floor(Math.random() * 50) + 5;
      const completedShows = Math.floor(Math.random() * 20) + 1;
      const watchingShows = Math.floor(Math.random() * 10) + 1;
      const reviewsPosted = Math.floor(Math.random() * 30) + 1;
      const commentsPosted = Math.floor(Math.random() * 50) + 5;
      const clubPosts = Math.floor(Math.random() * 20) + 1;
      const clubLikes = Math.floor(Math.random() * 100) + 10;
      const clubsJoined = Math.floor(Math.random() * 5) + 1;

      // Generate favorite genres
      const allGenres = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Thriller'];
      const favoriteGenres = allGenres
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 5) + 2)
        .map(genre => ({
          genre,
          count: Math.floor(Math.random() * 20) + 1
        }));

      // Generate weekly and monthly activity
      const weeklyActivity = {
        episodesWatched: Math.floor(Math.random() * 20) + 1,
        timeSpent: Math.floor(Math.random() * 480) + 60, // 1-8 hours
        reviewsPosted: Math.floor(Math.random() * 5) + 1,
        clubActivity: Math.floor(Math.random() * 10) + 1
      };

      const monthlyActivity = {
        episodesWatched: Math.floor(Math.random() * 80) + 10,
        timeSpent: Math.floor(Math.random() * 1920) + 240, // 4-32 hours
        reviewsPosted: Math.floor(Math.random() * 15) + 1,
        clubActivity: Math.floor(Math.random() * 30) + 5
      };

      const userAnalytics = new UserAnalytics({
        userId: user._id,
        episodesWatched,
        totalWatchTime,
        showsInWatchlist,
        completedShows,
        watchingShows,
        reviewsPosted,
        commentsPosted,
        clubPosts,
        clubLikes,
        clubsJoined,
        favoriteGenres,
        lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random activity within last week
        weeklyActivity,
        monthlyActivity
      });

      return userAnalytics.save();
    });

    await Promise.all(userAnalyticsPromises);
    console.log(`✅ Created analytics for ${users.length} users`);

    // Create global analytics
    const totalUsers = users.length;
    const totalShows = shows.length;
    const totalEpisodesTracked = watchlists.reduce((sum, item) => sum + (item.progress?.currentEpisode || 0), 0);
    const totalWatchTime = totalEpisodesTracked * 24; // 24 minutes per episode
    const totalReviews = reviews.length;
    const totalClubs = clubs.length;

    // Generate most watched shows
    const mostWatchedShows = shows
      .sort(() => 0.5 - Math.random())
      .slice(0, 10)
      .map(show => ({
        showId: show._id,
        title: show.title,
        watchCount: Math.floor(Math.random() * 1000) + 50
      }))
      .sort((a, b) => b.watchCount - a.watchCount);

    // Generate top genres
    const allGenres = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Thriller'];
    const topGenres = allGenres
      .sort(() => 0.5 - Math.random())
      .slice(0, 8)
      .map(genre => ({
        genre,
        count: Math.floor(Math.random() * 500) + 50
      }))
      .sort((a, b) => b.count - a.count);

    // Calculate active users
    const dailyActiveUsers = Math.floor(totalUsers * (0.3 + Math.random() * 0.4)); // 30-70% of total users
    const weeklyActiveUsers = Math.floor(totalUsers * (0.6 + Math.random() * 0.3)); // 60-90% of total users
    const monthlyActiveUsers = Math.floor(totalUsers * (0.8 + Math.random() * 0.2)); // 80-100% of total users

    // Generate recent activity
    const recentActivity = [];
    const activityTypes = ['episode_watched', 'review_posted', 'show_added', 'club_joined'];
    
    for (let i = 0; i < 50; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomShow = shows[Math.floor(Math.random() * shows.length)];
      const randomActivityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      
      recentActivity.push({
        type: randomActivityType,
        userId: randomUser._id,
        showId: randomShow._id,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time within last week
      });
    }

    // Sort by timestamp (most recent first)
    recentActivity.sort((a, b) => b.timestamp - a.timestamp);

    const globalAnalytics = new GlobalAnalytics({
      totalUsers,
      totalShows,
      totalEpisodesTracked,
      totalWatchTime,
      totalReviews,
      totalClubs,
      mostWatchedShows,
      topGenres,
      dailyActiveUsers,
      weeklyActiveUsers,
      monthlyActiveUsers,
      recentActivity
    });

    await globalAnalytics.save();
    console.log('✅ Created global analytics');

    console.log('🎉 Analytics seeding completed successfully!');
    console.log(`📊 Generated analytics for ${users.length} users`);
    console.log(`📈 Created global analytics with ${totalShows} shows and ${totalReviews} reviews`);

  } catch (error) {
    console.error('❌ Error seeding analytics data:', error);
    throw error;
  }
};

// Function to update analytics when new data is added
const updateAnalyticsForNewData = async (dataType, data) => {
  try {
    switch (dataType) {
      case 'watchlist':
        // Update user analytics when watchlist is modified
        const userAnalytics = await UserAnalytics.findOne({ userId: data.userId });
        if (userAnalytics) {
          userAnalytics.showsInWatchlist += 1;
          userAnalytics.lastActivity = new Date();
          await userAnalytics.save();
        }
        break;

      case 'review':
        // Update user analytics when review is posted
        const reviewAnalytics = await UserAnalytics.findOne({ userId: data.userId });
        if (reviewAnalytics) {
          reviewAnalytics.reviewsPosted += 1;
          reviewAnalytics.lastActivity = new Date();
          await reviewAnalytics.save();
        }
        break;

      case 'episode':
        // Update user analytics when episode is watched
        const episodeAnalytics = await UserAnalytics.findOne({ userId: data.userId });
        if (episodeAnalytics) {
          episodeAnalytics.episodesWatched += 1;
          episodeAnalytics.totalWatchTime += data.duration || 24;
          episodeAnalytics.lastActivity = new Date();
          await episodeAnalytics.save();
        }
        break;

      default:
        console.log('Unknown data type for analytics update');
    }
  } catch (error) {
    console.error('Error updating analytics:', error);
  }
};

module.exports = {
  seedAnalyticsData,
  updateAnalyticsForNewData
};
