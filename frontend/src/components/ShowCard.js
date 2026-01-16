import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaEye, FaStar, FaPlus, FaEdit, FaTimes,FaPause, FaClock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import watchlistApi from '../api/watchlistApi';
import { useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

const ShowCard = ({ show, watchlistItem = null, onUpdate }) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    status: watchlistItem?.status || 'Plan to Watch',
    notes: watchlistItem?.notes || '',
    rating: watchlistItem?.rating || 0
  });
  const [quickNote, setQuickNote] = useState('');
  const [showQuickNote, setShowQuickNote] = useState(false);

  // Add to watchlist mutation
  const addToWatchlistMutation = useMutation(
    (data) => watchlistApi.addToWatchlist({ showId: show._id, status: data.status, notes: data.notes }),
    {
      onSuccess: () => {
        toast.success('Added to watchlist!');
        setShowAddModal(false);
        queryClient.invalidateQueries(['user-watchlist']);
        queryClient.invalidateQueries(['watchlist-item']);
        if (onUpdate) onUpdate();
      },
      onError: () => {
        toast.error('Failed to add to watchlist');
      }
    }
  );

  // Update watchlist mutation
  const updateWatchlistMutation = useMutation(
    (data) => watchlistApi.updateWatchlistItem(watchlistItem._id, data),
    {
      onSuccess: () => {
        toast.success('Watchlist updated!');
        setShowEditModal(false);
        queryClient.invalidateQueries(['user-watchlist']);
        queryClient.invalidateQueries(['watchlist-item']);
        if (onUpdate) onUpdate();
      },
      onError: () => {
        toast.error('Failed to update watchlist');
      }
    }
  );

  const handleAddToWatchlist = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add shows to your watchlist');
      return;
    }
    setShowAddModal(true);
  };

  const handleSubmitAdd = (e) => {
    e.preventDefault();
    addToWatchlistMutation.mutate(formData);
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    updateWatchlistMutation.mutate(formData);
  };

  const handleStatusChange = (newStatus) => {
    if (watchlistItem) {
      // Show immediate feedback
      const statusMessages = {
        'Watching': 'Started watching!',
        'Completed': 'Marked as completed!',
        'On Hold': 'Put on hold',
        'Dropped': 'Marked as dropped',
        'Plan to Watch': 'Added to plan to watch'
      };
      
      toast.success(statusMessages[newStatus] || 'Status updated!');
      updateWatchlistMutation.mutate({ status: newStatus });
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'Watching': 'status-watching',
      'Completed': 'status-completed',
      'On Hold': 'status-on-hold',
      'Dropped': 'status-dropped',
      'Plan to Watch': 'status-plan-to-watch'
    };
    return statusClasses[status] || 'status-plan-to-watch';
  };

  const getProgressPercentage = () => {
    if (!watchlistItem) return 0;
    const { currentEpisode, totalEpisodes } = watchlistItem.progress;
    if (totalEpisodes === 0) return 0;
    return Math.round((currentEpisode / totalEpisodes) * 100);
  };

  const renderRatingStars = (rating) => {
    return Array.from({ length: 10 }, (_, i) => (
      <FaStar
        key={i}
        className={`rating-star ${i < rating ? 'active' : ''}`}
      />
    ));
  };

  return (
    <>
      <div className="show-card group">
        <div className="relative overflow-hidden rounded-xl">
          <img
            src={show.poster}
            alt={show.title}
            className="show-card-image"
          />
          
          {/* Status Badge */}
          {watchlistItem && (
            <div className={`absolute top-3 left-3 ${getStatusBadgeClass(watchlistItem.status)}`}>
              {watchlistItem.status}
            </div>
          )}

          {/* Rating Badge */}
          {show.rating?.average > 0 && (
            <div className="absolute top-3 right-3 bg-secondary-500 text-white px-2 py-1 rounded-full text-sm font-medium">
              ⭐ {show.rating.average}
            </div>
          )}

          {/* Action Buttons */}
          <div className="show-card-overlay">
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
              <div className="flex gap-2 justify-center">
                {watchlistItem ? (
                  <>
                    <button
                      className="status-change-button"
                      onClick={() => setShowEditModal(true)}
                      title="Edit Watchlist"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="status-change-button"
                      onClick={() => handleStatusChange(
                        watchlistItem.status === 'Watching' ? 'Completed' : 'Watching'
                      )}
                      title={watchlistItem.status === 'Watching' ? 'Mark as Completed' : 'Mark as Watching'}
                    >
                      {watchlistItem.status === 'Watching' ? <FaEye /> : <FaPlay />}
                    </button>
                    <button
                      className="status-change-button"
                      onClick={() => handleStatusChange(
                        watchlistItem.status === 'On Hold' || watchlistItem.status === 'Dropped' ? 'Watching' : 'On Hold'
                      )}
                      title={watchlistItem.status === 'On Hold' || watchlistItem.status === 'Dropped' ? 'Resume Watching' : 'Mark as On Hold'}
                    >
                      {watchlistItem.status === 'On Hold' || watchlistItem.status === 'Dropped' ? <FaPlay /> : <FaPause />}
                    </button>
                    <button
                      className="status-change-button"
                                                         onClick={() => {
                                     if (watchlistItem.status === 'On Hold') {
                                       handleStatusChange('Watching');
                                     } else {
                                       setShowQuickNote(true);
                                       setQuickNote('');
                                     }
                                   }}
                      title={watchlistItem.status === 'On Hold' ? 'Resume Watching' : 'Mark as On Hold'}
                    >
                      <FaPause />
                    </button>
                    <button
                      className="status-change-button"
                                                         onClick={() => {
                                     if (watchlistItem.status === 'Dropped') {
                                       handleStatusChange('Plan to Watch');
                                     } else {
                                       setShowQuickNote(true);
                                       setQuickNote('');
                                     }
                                   }}
                      title={watchlistItem.status === 'Dropped' ? 'Add to Plan to Watch' : 'Mark as Dropped'}
                    >
                      <FaTimes />
                    </button>
                    <button
                      className="status-change-button"
                      onClick={() => handleStatusChange('Plan to Watch')}
                      title="Mark as Plan to Watch"
                    >
                      <FaClock />
                    </button>
                  </>
                ) : (
                  <button
                    className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    onClick={handleAddToWatchlist}
                  >
                    <FaPlus />
                    Add to Watchlist
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 min-h-[2.5rem] line-clamp-2">
            <Link to={`/shows/${show._id}`} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
              {show.title}
            </Link>
          </h3>

          {/* Status Badge */}
          {watchlistItem && (
            <div className="mb-3">
              <span className={`status-badge ${getStatusBadgeClass(watchlistItem.status)}`}>
                {watchlistItem.status}
              </span>
            </div>
          )}

          {/* Genres */}
          <div className="mb-3">
            {show.genres?.slice(0, 3).map((genre, index) => (
              <span key={index} className="inline-block bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full mr-2 mb-1">
                {genre}
              </span>
            ))}
          </div>

          {/* Progress Bar */}
          {watchlistItem && (
            <div className="mb-3">
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                <span>Progress</span>
                <span>{watchlistItem.progress.currentEpisode}/{watchlistItem.progress.totalEpisodes}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Rating */}
          {watchlistItem?.rating && (
            <div className="mb-3">
              <div className="rating-stars text-sm">
                {renderRatingStars(watchlistItem.rating)}
                <span className="ml-2 text-gray-500 dark:text-gray-400">({watchlistItem.rating}/10)</span>
              </div>
            </div>
          )}

          {/* Show Info (hide on watchlist) */}
          {!watchlistItem && (
            <div className="mt-auto">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {show.type} • {show.year} • {show.totalEpisodes} episodes
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add to Watchlist Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add to Watchlist</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmitAdd}>
              <div className="modal-body">
                <div className="mb-4">
                  <label className="form-label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-input"
                  >
                    <option value="Plan to Watch">Plan to Watch</option>
                    <option value="Watching">Watching</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Dropped">Dropped</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="form-label">Notes (Optional)</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add your thoughts about this show..."
                    className="form-input"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addToWatchlistMutation.isLoading}
                  className="btn-primary"
                >
                  {addToWatchlistMutation.isLoading ? 'Adding...' : 'Add to Watchlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Watchlist Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Watchlist</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmitEdit}>
              <div className="modal-body">
                <div className="mb-4">
                  <label className="form-label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-input"
                  >
                    <option value="Plan to Watch">Plan to Watch</option>
                    <option value="Watching">Watching</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Dropped">Dropped</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="form-label">Rating</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                    className="form-input"
                  >
                    <option value={0}>No Rating</option>
                    {Array.from({ length: 10 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}/10</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="form-label">Notes</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add your thoughts about this show..."
                    className="form-input"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateWatchlistMutation.isLoading}
                  className="btn-primary"
                >
                  {updateWatchlistMutation.isLoading ? 'Updating...' : 'Update Watchlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Note Modal for Status Changes */}
      {showQuickNote && (
        <div className="modal-overlay" onClick={() => setShowQuickNote(false)}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Note</h3>
              <button
                onClick={() => setShowQuickNote(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="mb-4">
                <label className="form-label">Note (Optional)</label>
                <textarea
                  rows={3}
                  value={quickNote}
                  onChange={(e) => setQuickNote(e.target.value)}
                  placeholder="Why are you putting this on hold or dropping it?"
                  className="form-input"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setShowQuickNote(false)}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const newStatus = watchlistItem.status === 'Watching' ? 'On Hold' : 'Dropped';
                  updateWatchlistMutation.mutate({ 
                    status: newStatus, 
                    notes: quickNote.trim() || watchlistItem.notes 
                  });
                  setShowQuickNote(false);
                }}
                className="btn-primary"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShowCard;
