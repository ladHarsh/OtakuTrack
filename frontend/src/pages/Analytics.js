import React, { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext'; // Removed unused
import { getAnalyticsDashboard, getGlobalAnalytics, getPublicAnalytics } from '../api/analyticsApi';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Analytics = () => {
  // const { } = useAuth(); // Removed unused
  const [dashboardData, setDashboardData] = useState(null);
  const [globalData, setGlobalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAdmin, setIsAdmin] = useState(false);

  // Color palette for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Colors for watchlist statuses
  const STATUS_COLORS = {
    'Watching': '#10B981',      // Green
    'Completed': '#3B82F6',     // Blue
    'On Hold': '#F59E0B',       // Amber
    'Dropped': '#EF4444',       // Red
    'Plan to Watch': '#8B5CF6'  // Purple
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Analytics data is fetched once on component mount
  // No auto-refresh to avoid unnecessary API calls

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Always fetch dashboard data
      const dashboardResponse = await getAnalyticsDashboard();
      setDashboardData(dashboardResponse.data);
      
      // Try to fetch global analytics (admin only)
      try {
        const globalResponse = await getGlobalAnalytics();
        setGlobalData(globalResponse.data);
        setIsAdmin(true); // User has admin access
      } catch (globalError) {
        // If global analytics fails, fetch public analytics instead
        if (globalError.message?.includes('Admin privileges required') || globalError.message?.includes('Access denied')) {
          const publicResponse = await getPublicAnalytics();
          setGlobalData(publicResponse.data);
          setIsAdmin(false); // User doesn't have admin access
        } else {
          console.error('Global analytics error:', globalError);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };



  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Helper function to calculate dynamic Y-axis ticks
  const calculateDynamicYTicks = (data, dataKey = 'count') => {
    if (!data || data.length === 0) return {};
    
    const maxValue = Math.max(...data.map(item => item[dataKey] || 0));
    
    // Calculate appropriate tick interval based on max value
    let interval;
    if (maxValue <= 5) {
      interval = 1; // 0, 1, 2, 3, 4, 5
    } else if (maxValue <= 20) {
      interval = Math.ceil(maxValue / 10); // 0, 2, 4, 6, 8, 10...
    } else if (maxValue <= 100) {
      interval = Math.ceil(maxValue / 10); // 0, 10, 20, 30...
    } else {
      interval = Math.ceil(maxValue / 20); // 0, 25, 50, 75, 100...
    }
    
    return {
      domain: [0, 'dataMax'],
      tickFormatter: (value) => {
        // Only show ticks that are multiples of the interval
        return value % interval === 0 ? value : '';
      }
    };
  };

  const calculateEngagementScore = (analytics) => {
    if (!analytics) return 0;
    
    const episodesScore = Math.min(analytics.episodesWatched * 2, 50); // Max 50 points
    const reviewsScore = Math.min(analytics.reviewsPosted * 10, 30); // Max 30 points
    const clubScore = Math.min((analytics.clubPosts + analytics.clubLikes) * 5, 20); // Max 20 points
    
    return Math.round(episodesScore + reviewsScore + clubScore);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">❌</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const userAnalytics = dashboardData?.userAnalytics;
  // const globalAnalytics = dashboardData?.globalAnalytics; // Removed unused variable
  const engagementScore = calculateEngagementScore(userAnalytics);

  // Prepare chart data
  const activityData = dashboardData?.watchlistStatusDistribution?.map(item => ({
    name: item.status,
    value: item.count
  })) || [];
  
  // Fallback to old activity data if no watchlist status data
  const fallbackActivityData = [
    { name: 'Episodes Watched', value: userAnalytics?.episodesWatched || 0 },
    { name: 'Reviews Posted', value: userAnalytics?.reviewsPosted || 0 },
    { name: 'Club Posts', value: userAnalytics?.clubPosts || 0 },
    { name: 'Club Likes', value: userAnalytics?.clubLikes || 0 }
  ].filter(item => item.value > 0);
  
  // Use watchlist status data if available, otherwise fallback
  const finalActivityData = activityData.length > 0 ? activityData : fallbackActivityData;

  // Prepare genre data
  const genreData = userAnalytics?.favoriteGenres?.slice(0, 10) || [];

  // Weekly activity data preparation - removed for now



  // Global analytics data
  const globalStatsData = [
    { name: 'Total Users', value: globalData?.totalUsers || 0 },
    { name: 'Total Shows', value: globalData?.totalShows || 0 },
    { name: 'Total Episodes', value: globalData?.totalEpisodesTracked || 0 },
    { name: 'Total Reviews', value: globalData?.totalReviews || 0 }
  ];

  const mostWatchedShows = globalData?.mostWatchedShows || [];
  const topGenres = globalData?.topGenres || [];
  const dailyActiveUsers = globalData?.dailyActiveUsers || 0;
  const weeklyActiveUsers = globalData?.weeklyActiveUsers || 0;
  const monthlyActiveUsers = globalData?.monthlyActiveUsers || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your anime watching progress and community engagement
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {['overview', 'activity'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
                {tab}
            </button>
          ))}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('global')}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === 'global'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Global Activity
              </button>
            )}
          </nav>
        </div>

        {/* Overview Tab */}
          {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* User Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
                    </svg>
                    </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Watching Shows</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{userAnalytics?.watchingShows || 0}</p>
                    </div>
                  </div>
                </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Episodes Watched</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{userAnalytics?.episodesWatched || 0}</p>
                    </div>
                  </div>
                </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Reviews Posted</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{userAnalytics?.reviewsPosted || 0}</p>
                    </div>
                  </div>
                </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Engagement Score</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{engagementScore}</p>
                    </div>
                  </div>
                </div>
              </div>

            {/* Detailed Watchlist Status - removed per request */}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Watchlist Status Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Watchlist Status Distribution</h3>
                {finalActivityData.length > 0 ? (
                  <>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                          data={finalActivityData}
                            cx="50%"
                            cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                          fill="#8884d8"
                            dataKey="value"
                        >
                          {finalActivityData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} 
                            />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    
                    {/* Custom Legend */}
                    <div className="mt-4 flex flex-wrap justify-center gap-4">
                      {finalActivityData.map((entry, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: STATUS_COLORS[entry.name] || COLORS[index % COLORS.length] }}
                          ></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {entry.name}: {entry.value}
                            </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">No Activity Data</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Add shows to your watchlist to see your activity distribution</p>
                </div>
              )}
            </div>

              {/* Favorite Genres */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Favorite Genres</h3>
                {genreData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={genreData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="genre" />
                      <YAxis {...calculateDynamicYTicks(genreData, 'count')} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">No Genre Data</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Add shows to your watchlist to see your favorite genres</p>
                  </div>
                )}
                </div>
              </div>

            {/* User Ranking */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Ranking</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{dashboardData?.userRanking || 1}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Rank</p>
                    </div>
                    <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{dashboardData?.totalUsers || 0}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                    </div>
                    <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{dashboardData?.userAnalytics?.episodesWatched || 0}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Your Episodes</p>
                      </div>
                    </div>
              
              {/* Top Users Leaderboard */}
              {dashboardData?.topUsers && dashboardData.topUsers.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Top 3 Users</h4>
                  <div className="space-y-2">
                    {dashboardData.topUsers.map((topUser, index) => (
                      <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                        topUser.rank === 1 ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700' :
                        topUser.rank === 2 ? 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700' :
                        topUser.rank === 3 ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700' :
                        'bg-gray-50 dark:bg-gray-800'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            topUser.rank === 1 ? 'bg-yellow-400 text-white' :
                            topUser.rank === 2 ? 'bg-gray-400 text-white' :
                            topUser.rank === 3 ? 'bg-orange-400 text-white' :
                            'bg-gray-300 text-gray-700'
                          }`}>
                            {topUser.rank}
                          </span>
                          <span className="text-gray-600 dark:text-gray-300">{topUser.name}</span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{topUser.episodesWatched} episodes</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              </div>
            </div>
          )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
                      <div className="space-y-6">
              {/* Weekly Activity - Temporarily removed for debugging */}

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Watchlist */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Watchlist</h3>
                <div className="space-y-3">
                  {dashboardData?.recentWatchlist?.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <img
                        src={item.showId?.poster}
                        alt={item.showId?.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{item.showId?.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Episode {item.progress?.currentEpisode}</p>
                      </div>
                </div>
                  ))}
                </div>
              </div>

              {/* Recent Reviews */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Reviews</h3>
                <div className="space-y-3">
                  {dashboardData?.recentReviews?.map((review, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <img
                        src={review.showId?.poster}
                        alt={review.showId?.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{review.showId?.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Rating: {review.rating}/10</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Global Tab */}
        {activeTab === 'global' && globalData && (
          <div className="space-y-6">
            {/* Admin Status Note */}
            {!isAdmin && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Note:</strong> You're viewing public analytics data. Admin users can access detailed global analytics.
                    </p>
                </div>
              </div>
            </div>
          )}

            {/* Global Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {globalStatsData.map((stat, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(stat.value)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stat.name}</p>
                    </div>
                  </div>
              ))}
                </div>

            {/* Most Watched Shows */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Most Watched Shows</h3>
              <div className="space-y-3">
                {mostWatchedShows.slice(0, 10).map((show, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-bold text-gray-400 dark:text-gray-500">#{index + 1}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{show.title}</span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{show.watchCount} watchers</span>
                    </div>
                ))}
                  </div>
                </div>

            {/* Top Genres */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Genres</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topGenres}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="genre" />
                  <YAxis {...calculateDynamicYTicks(topGenres, 'count')} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
                </div>

            {/* Active Users - Only show for admin users */}
            {isAdmin && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{dailyActiveUsers}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Daily Active Users</p>
                    </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{weeklyActiveUsers}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Weekly Active Users</p>
                    </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{monthlyActiveUsers}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Active Users</p>
                    </div>
                  </div>
            )}
                </div>
        )}
        
        {/* Global Tab - No Data Fallback */}
        {activeTab === 'global' && !globalData && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading global analytics...</p>
            </div>
          )}
      </div>
    </div>
  );
};

export default Analytics;
