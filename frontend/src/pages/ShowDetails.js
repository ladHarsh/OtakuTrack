import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  FaPlay, FaStar, FaCalendar, 
  FaEye, FaPlus, FaCheck, FaTrash 
} from 'react-icons/fa';
import { FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import showApi from '../api/showApi';
import watchlistApi from '../api/watchlistApi';
import reviewApi from '../api/reviewApi';
import ReviewBox from '../components/ReviewBox';
import toast from 'react-hot-toast';

const ShowDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(); // Removed unused user
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [episodeProgress, setEpisodeProgress] = useState(0);
  // const [showReviewForm, setShowReviewForm] = useState(false); // Removed unused
  const currentProgressRef = useRef(0);

  // Fetch show details
  const { data: showData, isLoading: showLoading } = useQuery(
    ['show', id],
    () => showApi.getShowById(id)
  );

  // Fetch user's watchlist item for this show
  const { data: watchlistData } = useQuery(
    ['watchlist-item', id],
    () => watchlistApi.getWatchlistItem(id),
    { enabled: isAuthenticated }
  );

  // Fetch reviews for this show
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery(
    ['reviews', id],
    () => reviewApi.getReviewsByShow(id)
  );

  // Fetch user's review for this show
  const { data: userReviewData } = useQuery(
    ['user-reviews'],
    () => reviewApi.getUserReviews(),
    { enabled: isAuthenticated }
  );

  // Find user's review for this specific show
  const userReview = userReviewData?.data?.find(review => {
    const reviewShowId = typeof review.showId === 'object' ? review.showId._id : review.showId;
    return reviewShowId === id;
  });
  
  // Debug logging removed

  // Add to watchlist mutation
  const addToWatchlistMutation = useMutation(
    (data) => watchlistApi.addToWatchlist(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['watchlist-item', id]);
        queryClient.invalidateQueries(['user-watchlist']);
        toast.success('Added to watchlist!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to add to watchlist');
      }
    }
  );

  // Update watchlist mutation
  const updateWatchlistMutation = useMutation(
    (data) => watchlistApi.updateWatchlistItem(watchlistData?.data?._id, data),
    {
       onSuccess: (updatedData) => {
        // Update the ref to match the server response to prevent useEffect from overriding
        if (updatedData?.data?.progress?.currentEpisode !== undefined) {
          currentProgressRef.current = updatedData.data.progress.currentEpisode;
        }
        
        // Invalidate queries to update other components (like watchlist page)
        queryClient.invalidateQueries(['watchlist-item', id]);
        queryClient.invalidateQueries(['user-watchlist']);
        
        toast.success('Watchlist updated!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update watchlist');
        // Revert local state on error
        if (watchlistItem) {
          const serverProgress = watchlistItem.progress?.currentEpisode || 0;
          setEpisodeProgress(serverProgress);
          currentProgressRef.current = serverProgress;
        }
      }
    }
  );

  // Remove from watchlist mutation
  const removeFromWatchlistMutation = useMutation(
    () => watchlistApi.removeFromWatchlist(watchlistData?.data?._id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['watchlist-item', id]);
        queryClient.invalidateQueries(['user-watchlist']);
        toast.success('Removed from watchlist');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to remove from watchlist');
      }
    }
  );

  const show = showData?.data;
  const watchlistItem = watchlistData?.data;
  const reviews = reviewsData?.data || [];
  const totalEpisodes = show?.episodes?.length || show?.totalEpisodes || 0;

  // Initialize progress when watchlist item is first loaded
  useEffect(() => {
    if (watchlistItem && currentProgressRef.current === 0) {
      const serverProgress = watchlistItem.progress?.currentEpisode || 0;
      setEpisodeProgress(serverProgress);
      currentProgressRef.current = serverProgress;
    }
  }, [watchlistItem]);

  // Handle updates from server (only when ref doesn't match)
  useEffect(() => {
    if (watchlistItem) {
      const serverProgress = watchlistItem.progress?.currentEpisode || 0;
      // Only update if the server progress is different from our current ref
      if (serverProgress !== currentProgressRef.current) {
        setEpisodeProgress(serverProgress);
        currentProgressRef.current = serverProgress;
      }
    }
  }, [watchlistItem]);

  const handleAddToWatchlist = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    addToWatchlistMutation.mutate({
      showId: id,
      status: 'Plan to Watch',
      progress: { currentEpisode: 0, totalEpisodes: totalEpisodes }
    });
  };

  const handleUpdateProgress = (episodes) => {
    const newProgress = Math.max(0, Math.min(episodes, totalEpisodes));
    
    // Update local state immediately for instant UI feedback
    setEpisodeProgress(newProgress);
    currentProgressRef.current = newProgress;
    
    if (watchlistItem) {
      let newStatus = watchlistItem.status;
      
      // Auto-update status based on progress
      if (newProgress === 0) {
        newStatus = 'Plan to Watch';
      } else if (newProgress === totalEpisodes) {
        newStatus = 'Completed';
      } else {
        newStatus = 'Watching';
      }

      // Update the database
      updateWatchlistMutation.mutate({
        status: newStatus,
        progress: { currentEpisode: newProgress, totalEpisodes: totalEpisodes }
      });
    }
  };

  const handleStatusChange = (status) => {
    if (watchlistItem) {
      updateWatchlistMutation.mutate({ status });
    }
  };

  const handleRemoveFromWatchlist = () => {
    if (window.confirm('Are you sure you want to remove this show from your watchlist?')) {
      removeFromWatchlistMutation.mutate();
    }
  };

  if (showLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="empty-state">
            <div className="empty-state-icon">❌</div>
            <div className="empty-state-text">Show not found</div>
          </div>
        </div>
      </div>
    );
  }



  const averageRating = show?.rating?.average 
    ? show.rating.average.toFixed(1)
    : 'No ratings';


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="relative mb-8">
          <div className="relative h-96 rounded-2xl overflow-hidden">
            <img 
              src={show.poster || show.coverImage} 
              alt={show.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {show.title}
              </h1>
              <div className="flex items-center space-x-4 text-white/90">
                <div className="flex items-center">
                  <FaStar className="text-yellow-400 mr-2" />
                  <span>{averageRating}</span>
                </div>
                <div className="flex items-center">
                  <FaEye className="mr-2" />
                  <span>{totalEpisodes} episodes</span>
                </div>
                <div className="flex items-center">
                  <FaCalendar className="mr-2" />
                  <span>{show.year}</span>
                </div>
                <div className="flex items-center">
                  <FiTrendingUp className="mr-2" />
                  <span>{show.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          {!watchlistItem ? (
            <button 
              onClick={handleAddToWatchlist}
              className="btn-primary inline-flex items-center"
              disabled={addToWatchlistMutation.isLoading}
            >
              <FaPlus className="mr-2" />
              Add to Watchlist
            </button>
          ) : (
            <>
              <button 
                onClick={() => handleStatusChange('Watching')}
                className={`btn-primary inline-flex items-center ${
                  watchlistItem.status === 'Watching' ? 'ring-2 ring-primary-300' : ''
                }`}
              >
                <FaPlay className="mr-2" />
                Watching
              </button>
              <button 
                onClick={() => handleStatusChange('Completed')}
                className={`btn-secondary inline-flex items-center ${
                  watchlistItem.status === 'Completed' ? 'ring-2 ring-secondary-300' : ''
                }`}
              >
                <FaCheck className="mr-2" />
                Completed
              </button>
              <button 
                onClick={handleRemoveFromWatchlist}
                className="btn-outline inline-flex items-center"
                disabled={removeFromWatchlistMutation.isLoading}
              >
                <FaTrash className="mr-2" />
                Remove
              </button>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
          {['overview', 'episodes', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium rounded-t-lg transition-colors duration-200 ${
                activeTab === tab
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Description */}
              <div className="lg:col-span-2">
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Description
                    </h3>
                  </div>
                  <div className="card-body">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {show.description}
                    </p>
                  </div>
                </div>

                {/* Genres & Tags */}
                <div className="card mt-6">
                  <div className="card-header">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Genres & Tags
                    </h3>
                  </div>
                  <div className="card-body">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Genres
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {show.genres?.map((genre) => (
                          <span 
                            key={genre}
                            className="px-3 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 rounded-full text-sm font-medium"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                    {show.tags && show.tags.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                          Tags
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {show.tags.map((tag) => (
                            <span 
                              key={tag}
                              className="px-3 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full text-sm font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Info & Progress */}
              <div className="space-y-6">
                {/* Show Info */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Show Information
                    </h3>
                  </div>
                  <div className="card-body space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status</span>
                      <span className="font-medium text-gray-900 dark:text-white capitalize">
                        {show.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Year</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {show.year}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Episodes</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {totalEpisodes}
                      </span>
                    </div>
                    {show.rating && (
  <div className="flex items-center justify-between">
    <span className="text-gray-600 dark:text-gray-400">Rating</span>
    <span className="font-medium text-gray-900 dark:text-white">
      {show.rating.average ?? 'N/A'}/10
    </span>
  </div>
)}

                  </div>
                </div>

                {/* Progress Tracking */}
                {watchlistItem && (
                  totalEpisodes > 0 ? (
                    <div className="card">
                      <div className="card-header">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Your Progress
                        </h3>
                      </div>
                      <div className="card-body space-y-4">
                        <div>
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <span>Episodes Watched</span>
                            <span>{episodeProgress} / {totalEpisodes}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${totalEpisodes > 0 ? (episodeProgress / totalEpisodes) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateProgress(episodeProgress - 1)}
                            disabled={episodeProgress <= 0}
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => handleUpdateProgress(episodeProgress + 1)}
                            disabled={episodeProgress >= totalEpisodes}
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            +1
                          </button>
                        </div>
                        
                      </div>
                    </div>
                  ) : (
                    <div className="card">
                      <div className="card-header">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Your Progress
                        </h3>
                      </div>
                      <div className="card-body">
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          <p>No episodes available for tracking</p>
                          <p className="text-sm mt-2">This show doesn't have episode information yet</p>
                        </div>
                      </div>
                    </div>
                  )
                )}

                {/* Streaming Links */}
                {show.streamingLinks && show.streamingLinks.length > 0 && (
                  <div className="card">
                    <div className="card-header">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Watch Now
                      </h3>
                    </div>
                    <div className="card-body">
                      <div className="space-y-2">
                        {show.streamingLinks.map((link) => (
                          <a
                            key={link.platform}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-center rounded-lg transition-colors duration-200"
                          >
                            Watch on {link.platform}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'episodes' && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Episodes ({totalEpisodes})
                </h3>
              </div>
              <div className="card-body">
                {totalEpisodes > 0 ? (
                  <div className="space-y-3">
                    {Array.from({ length: totalEpisodes }, (_, index) => (
                      <div 
                        key={index}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors duration-200 ${
                          index < episodeProgress
                            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700'
                            : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-800 dark:text-primary-200">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              Episode {index + 1}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {show.duration || 24} min
                            </p>
                          </div>
                        </div>
                        {watchlistItem && (
                          <button
                            onClick={() => handleUpdateProgress(index + 1)}
                            className={`p-2 rounded-lg transition-colors duration-200 ${
                              index < episodeProgress
                                ? 'text-green-600 hover:text-green-700'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                          >
                            {index < episodeProgress ? <FaCheck /> : <FaPlay />}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {totalEpisodes > 0 ? (
                      <div>
                        <p className="text-lg font-medium mb-2">Episode List Generated</p>
                        <p className="text-sm">Showing {totalEpisodes} episodes based on total episode count</p>
                        <p className="text-sm mt-2">Individual episode details will appear when available</p>
                      </div>
                    ) : (
                      <p>No episode information available</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Review Form */}
              {isAuthenticated && (
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Write a Review
                    </h3>
                  </div>
                  <div className="card-body">
                    <ReviewBox 
                      showId={id}
                      review={userReview}
                      onReviewSubmit={() => {
                        queryClient.invalidateQueries(['reviews', id]);
                        queryClient.invalidateQueries(['user-reviews']);
                        // setShowReviewForm(false);
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Reviews List */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Reviews ({reviews.length})
                  </h3>
                </div>
                <div className="card-body">
                  {reviewsLoading ? (
                    <div className="loading-spinner">
                      <div className="spinner"></div>
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review._id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-primary-800 dark:text-primary-200">
                                  {review.userId?.name?.charAt(0) || 'U'}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {review.userId?.name || 'Anonymous'}
                                </h4>
                                <div className="flex items-center space-x-2">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <FaStar
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < Math.round(review.rating / 2)
                                            ? 'text-yellow-400'
                                            : 'text-gray-300 dark:text-gray-600'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {Math.round(review.rating / 2)}/5
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No reviews yet. Be the first to review this show!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShowDetails;
