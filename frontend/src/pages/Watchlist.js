import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useQuery } from 'react-query';
import watchlistApi from '../api/watchlistApi';
import ShowCard from '../components/ShowCard';
import WatchlistTabs from '../components/WatchlistTabs';

const Watchlist = () => {
  const [activeTab, setActiveTab] = useState('all');

  const { data: watchlistData, isLoading } = useQuery(
    ['user-watchlist'],
    () => watchlistApi.getUserWatchlist()
  );

  if (isLoading) {
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

  const watchlist = watchlistData?.data || [];
  
  // Calculate counts for each status
  const counts = {
    all: watchlist.length,
    watching: watchlist.filter(item => item.status === 'Watching').length,
    completed: watchlist.filter(item => item.status === 'Completed').length,
    onHold: watchlist.filter(item => item.status === 'On Hold').length,
    dropped: watchlist.filter(item => item.status === 'Dropped').length,
    planToWatch: watchlist.filter(item => item.status === 'Plan to Watch').length
  };

  // Filter shows based on active tab
  const getFilteredShows = () => {
    if (activeTab === 'all') return watchlist;
    return watchlist.filter(item => {
      if (activeTab === 'on-hold') return item.status === 'On Hold';
      if (activeTab === 'plan-to-watch') return item.status === 'Plan to Watch';
      return item.status === activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
    });
  };

  const filteredShows = getFilteredShows();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="section-header">
          <h1 className="section-title">My Watchlist</h1>
          <p className="section-subtitle">
            Track your anime and TV series progress
          </p>
        </div>

        {/* Tabs */}
        <WatchlistTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          counts={counts}
        />

        {/* Content */}
        {filteredShows.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📺</div>
            <div className="empty-state-text">
              {activeTab === 'all' 
                ? "Your watchlist is empty. Start adding shows to track your progress!"
                : `No shows with status "${activeTab.replace('-', ' ')}"`
              }
            </div>
            <div className="mt-6">
              <button className="btn-primary inline-flex items-center">
                <FaPlus className="mr-2" />
                Add Shows
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShows.map((item) => (
              <ShowCard 
                key={item._id} 
                show={item.showId} 
                watchlistItem={item}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
