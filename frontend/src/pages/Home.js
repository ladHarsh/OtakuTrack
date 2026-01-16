import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlay, FaHeart, FaStar } from 'react-icons/fa';
import { FiTrendingUp } from 'react-icons/fi';
import { useQuery } from 'react-query';
import showApi from '../api/showApi';
import { useAuth } from '../context/AuthContext';
import ShowCard from '../components/ShowCard';
import watchlistApi from '../api/watchlistApi';


const Home = () => {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');

  // Fetch all shows
  const { data: allShowsData, isLoading: allShowsLoading } = useQuery(
    ['all-shows'],
    () => showApi.getShows({ limit: 100 }), // Set a high limit to get all shows
    {
      onError: (error) => {
        console.error('Failed to fetch shows:', error);
      },

    }
  );

  // Get shows data
  const shows = allShowsData?.data || [];



  // Fetch user's watchlist for recommendations
  const { data: watchlistData } = useQuery(
    ['user-watchlist'],
    () => watchlistApi.getUserWatchlist(),
    { enabled: isAuthenticated }
  );

  // Search shows
  const { data: searchData, isLoading: searchLoading, refetch: searchShows } = useQuery(
    ['search-shows', searchQuery],
    () => showApi.searchShows(searchQuery, { limit: 20 }),
    { enabled: false }
  );

  // Get search results
  const searchResults = searchData?.data || [];
  const displayShows = submittedQuery ? searchResults : shows;

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      setSubmittedQuery(trimmed);
      searchShows();
    } else {
      setSubmittedQuery('');
    }
  };

  const handleGenreFilter = (genre) => {
    setSelectedGenre(genre === selectedGenre ? '' : genre);
  };

  // Clear submitted query when input is emptied
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSubmittedQuery('');
    }
  }, [searchQuery]);

  const genres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 
    'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life'
  ];

  const getWatchlistItem = (showId) => {
    if (!watchlistData?.data) return null;
    return watchlistData.data.find(item => item.showId._id === showId);
  };

  const renderShowGrid = (shows, title, icon, loading) => {
    return (
      <div className="mb-12">
        <div className="flex items-center mb-6">
          <div className="text-2xl mr-3">{icon}</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shows.map((show) => (
            <ShowCard 
              key={show._id}
              show={show} 
              watchlistItem={getWatchlistItem(show._id)}
              onUpdate={() => {
                if (isAuthenticated) {
                  // trigger refetch if needed
                }
              }}
            />
          ))}
        </div>
      </div>
    );
  };
  



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Welcome to{' '}
              <span className="text-secondary-300 drop-shadow-lg">OtakuTrack</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Track your favorite anime & TV series, discover new shows, and join the community
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSearch} className="flex">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search for shows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-6 py-4 text-lg bg-white/95 backdrop-blur-sm border-0 rounded-l-2xl focus:outline-none focus:ring-4 focus:ring-white/30 text-gray-900 dark:text-gray-900 placeholder-gray-600"
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 bg-secondary-500 hover:bg-secondary-600 text-white font-semibold rounded-r-2xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-secondary-300"
                >
                  <FaSearch className="text-xl" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">


        {/* Search Results: only after submit */}
        {submittedQuery && (
          <div className="mb-12">
            {renderShowGrid(displayShows, `Search Results for "${submittedQuery}"`, <FaSearch className="text-primary-600" />, searchLoading)}
          </div>
        )}

        {/* Similar by Genre when searching (combined) */}
        {submittedQuery && searchResults.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <FiTrendingUp className="text-2xl text-green-500 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Similar by Genre</h3>
            </div>
            <SimilarByGenres 
              genres={(searchResults[0]?.genres || []).slice(0, 2)} 
              excludeIds={new Set(searchResults.map(s => s._id))}
            />
          </div>
        )}

        {/* Genre Filter: only when not searching */}
        {!submittedQuery && (
          <div className="mb-8">
            <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filter by Genre</h5>
            <div className="flex flex-wrap gap-3">
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => handleGenreFilter(genre)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    selectedGenre === genre
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* All Shows: only when no genre is selected */}
        {!searchQuery.trim() && !selectedGenre && renderShowGrid(
          shows, 
          'All Shows', 
          <FaStar className="text-yellow-500" />, 
          allShowsLoading
        )}

        {/* Genre-specific shows */}
        {selectedGenre && (
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <FiTrendingUp className="text-2xl text-green-500 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedGenre} Shows
              </h3>
            </div>
            <GenreShows genre={selectedGenre} />
          </div>
        )}

        {/* Call to Action */}
        {!isAuthenticated && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 to-accent-600 p-8 md:p-12 text-center text-white">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <FaHeart className="text-3xl text-red-300" />
                </div>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Start Tracking Your Shows
              </h3>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Create an account to build your watchlist, track your progress, and discover new anime
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/register"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-2xl hover:bg-gray-100 transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                >
                  <FaPlay className="mr-2" />
                  Get Started
                </a>
                <a
                  href="/login"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all duration-200 hover:border-white/50"
                >
                  Sign In
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Genre-specific shows component
const GenreShows = ({ genre }) => {
  const { data, isLoading } = useQuery(
    ['genre-shows', genre],
    () => showApi.getShowsByGenre(genre, 50) // Increased limit to show more shows
  );

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🎬</div>
        <div className="empty-state-text">No {genre} shows found</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.data.map((show) => (
        <ShowCard key={show._id} show={show} />
      ))}
    </div>
  );
};

// Combined similar-by-genres component
const SimilarByGenres = ({ genres, excludeIds }) => {
  const { data, isLoading } = useQuery(
    ['similar-by-genres', genres.join(',')],
    () => showApi.getShowsByFilters({ genre: genres.join(',') , limit: 30 })
  );

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  const items = (data?.data || []).filter(s => !excludeIds.has(s._id));
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🎬</div>
        <div className="empty-state-text">No similar shows found</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((show) => (
        <ShowCard key={show._id} show={show} />
      ))}
    </div>
  );
};

export default Home;
