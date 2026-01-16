import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSearch, FaFilter, FaTimes, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { useQuery } from 'react-query';
import showApi from '../api/showApi';
import ShowCard from '../components/ShowCard';
import watchlistApi from '../api/watchlistApi';
import { useAuth } from '../context/AuthContext';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // const navigate = useNavigate(); // Removed unused
  const { isAuthenticated } = useAuth();
  
  // Get search query from URL
  const query = searchParams.get('q') || '';
  
  // Local state
  const [searchQuery, setSearchQuery] = useState(query);
  const [filters, setFilters] = useState({
    genre: '',
    type: '',
    year: '',
    status: '',
    sortBy: 'relevance'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch user's watchlist for status display
  const { data: watchlistData } = useQuery(
    ['user-watchlist'],
    () => watchlistApi.getUserWatchlist(),
    { enabled: isAuthenticated }
  );

  // Search shows with filters
  const { data: searchData, isLoading, error } = useQuery(
    ['search-shows', query, filters],
    () => showApi.searchShows(query, { 
      limit: 50,
      ...filters,
      genre: filters.genre || undefined,
      type: filters.type || undefined,
      year: filters.year || undefined,
      status: filters.status || undefined,
      sortBy: filters.sortBy === 'relevance' ? undefined : filters.sortBy
    }),
    { 
      enabled: !!query.trim(),
      keepPreviousData: true
    }
  );

  // Update URL when search changes
  useEffect(() => {
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  }, [searchQuery, setSearchParams]);

  // Sync local state with URL
  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      genre: '',
      type: '',
      year: '',
      status: '',
      sortBy: 'relevance'
    });
  };

  const getWatchlistItem = (showId) => {
    if (!watchlistData?.data) return null;
    return watchlistData.data.find(item => item.showId === showId);
  };

  const getSortIcon = (sortKey) => {
    if (filters.sortBy !== sortKey) return <FaSort className="text-gray-400" />;
    return filters.sortBy === sortKey ? <FaSortUp className="text-primary-600" /> : <FaSortDown className="text-primary-600" />;
  };

  const searchResults = searchData?.data || [];
  const totalResults = searchData?.pagination?.total || 0;



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Search Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Search Results
            </h1>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search for shows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Search
              </button>
            </form>

            {/* Results Count */}
            {query && (
              <div className="mt-4 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  {isLoading ? 'Searching...' : `${totalResults} result${totalResults !== 1 ? 's' : ''} found for "${query}"`}
                </p>
              </div>
            )}


          </div>
        </div>
      </div>

      {/* Filters and Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showFilters ? <FaTimes /> : <FaFilter />}
                </button>
              </div>
              
              <div className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
                {/* Genre Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Genre
                  </label>
                  <select
                    value={filters.genre}
                    onChange={(e) => handleFilterChange('genre', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Genres</option>
                    <option value="Action">Action</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Comedy">Comedy</option>
                    <option value="Drama">Drama</option>
                    <option value="Fantasy">Fantasy</option>
                    <option value="Horror">Horror</option>
                    <option value="Mystery">Mystery</option>
                    <option value="Romance">Romance</option>
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Slice of Life">Slice of Life</option>
                  </select>
                </div>

                {/* Type Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Types</option>
                    <option value="TV">TV</option>
                    <option value="Movie">Movie</option>
                    <option value="OVA">OVA</option>
                    <option value="Special">Special</option>
                  </select>
                </div>

                {/* Year Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Year
                  </label>
                  <select
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Years</option>
                    {Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Upcoming">Upcoming</option>
                  </select>
                </div>

                {/* Sort Options */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort By
                  </label>
                  <div className="space-y-2">
                    {[
                      { key: 'relevance', label: 'Relevance' },
                      { key: 'rating', label: 'Rating' },
                      { key: 'title', label: 'Title A-Z' },
                      { key: 'year', label: 'Year (Newest)' },
                      { key: 'newest', label: 'Recently Added' }
                    ].map(option => (
                      <button
                        key={option.key}
                        onClick={() => handleFilterChange('sortBy', option.key)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-md transition-colors duration-200 ${
                          filters.sortBy === option.key
                            ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span>{option.label}</span>
                        {getSortIcon(option.key)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1">
            {!query ? (
              <div className="text-center py-16">
                <FaSearch className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Start searching for shows
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Enter a show title, genre, or keyword to find what you're looking for
                </p>
              </div>
            ) : isLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Searching...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="mx-auto h-16 w-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                  <FaTimes className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Search failed
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  There was an error performing your search. Please try again.
                </p>

              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-16">
                <FaSearch className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No results found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search terms or filters
                </p>
              </div>
            ) : (
              <>
                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {searchResults.map((show) => (
                    <ShowCard
                      key={show._id}
                      show={show}
                      watchlistItem={getWatchlistItem(show._id)}
                      onUpdate={() => {
                        // Refresh watchlist data
                        window.location.reload();
                      }}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {searchData?.pagination && searchData.pagination.pages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex items-center space-x-2">
                      {Array.from({ length: searchData.pagination.pages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => {
                            const newParams = new URLSearchParams(searchParams);
                            newParams.set('page', page);
                            setSearchParams(newParams);
                          }}
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                            page === searchData.pagination.page
                              ? 'bg-primary-600 text-white'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
