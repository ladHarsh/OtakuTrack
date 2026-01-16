import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  FaPlus, FaUsers, FaComments, FaPoll, FaSignInAlt, 
  FaSignOutAlt, FaEdit, FaEye, FaSearch, FaFilter
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import clubApi from '../api/clubApi';
import toast from 'react-hot-toast';

const Clubs = () => {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('members');
  const [createFormData, setCreateFormData] = useState({
    name: '',
    description: '',
    category: 'General'
  });

  // Fetch clubs with filters
  const { data: clubsData, isLoading } = useQuery(
    ['clubs', searchQuery, selectedCategory, sortBy],
    () => clubApi.getClubs({
      search: searchQuery,
      category: selectedCategory,
      sortBy: sortBy
    })
  );

  // Create club mutation
  const createClubMutation = useMutation(
    (data) => clubApi.createClub(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['clubs']);
        setShowCreateForm(false);
        setCreateFormData({ name: '', description: '', category: 'General' });
        toast.success('Club created successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create club');
      }
    }
  );

  // Join club mutation
  const joinClubMutation = useMutation(
    (clubId) => clubApi.joinClub(clubId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['clubs']);
        toast.success('Joined club successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to join club');
      }
    }
  );

  // Leave club mutation
  const leaveClubMutation = useMutation(
    (clubId) => clubApi.leaveClub(clubId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['clubs']);
        toast.success('Left club successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to leave club');
      }
    }
  );

  const clubs = clubsData?.data || [];

  const handleCreateClub = (e) => {
    e.preventDefault();
    if (!createFormData.name.trim() || !createFormData.description.trim() || !createFormData.category) {
      toast.error('Please fill in all fields');
      return;
    }

    createClubMutation.mutate(createFormData);
  };

  const handleJoinClub = (clubId) => {
    if (!isAuthenticated) {
      toast.error('Please login to join clubs');
      return;
    }
    joinClubMutation.mutate(clubId);
  };

  const handleLeaveClub = (clubId) => {
    if (window.confirm('Are you sure you want to leave this club?')) {
      leaveClubMutation.mutate(clubId);
    }
  };

  const isMember = (club) => {
    return club.members?.some(member => member.userId === user?._id);
  };

  const isOwner = (club) => {
    return club.createdBy?._id === user?._id;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSortBy('members');
  };

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="section-header">
          <h1 className="section-title">Anime Clubs</h1>
          <p className="section-subtitle">
            Join communities and discuss your favorite shows with fellow fans
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card mb-8">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search clubs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input pl-10 w-full"
                />
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="form-input w-full"
                >
                  <option value="">All Categories</option>
                  <option value="General">General</option>
                  <option value="Genre">Genre</option>
                  <option value="Show">Show</option>
                  <option value="Seasonal">Seasonal</option>
                  <option value="Discussion">Discussion</option>
                  <option value="Fan Art">Fan Art</option>
                  <option value="Cosplay">Cosplay</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-input w-full"
                >
                  <option value="members">Most Members</option>
                  <option value="posts">Most Posts</option>
                  <option value="newest">Newest</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div>
                <button
                  onClick={clearFilters}
                  className="btn-outline w-full flex items-center justify-center"
                >
                  <FaFilter className="mr-2" />
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Create Club Button */}
        {isAuthenticated && (
          <div className="mb-8 text-center">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="btn-primary inline-flex items-center"
            >
              <FaPlus className="mr-2" />
              {showCreateForm ? 'Cancel' : 'Create Club'}
            </button>
          </div>
        )}

        {/* Create Club Form */}
        {showCreateForm && (
          <div className="card mb-8">
            <div className="card-header">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create New Club
              </h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleCreateClub} className="space-y-4">
                <div>
                  <label htmlFor="clubName" className="form-label">
                    Club Name
                  </label>
                  <input
                    type="text"
                    id="clubName"
                    value={createFormData.name}
                    onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                    className="form-input"
                    placeholder="Enter club name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="clubDescription" className="form-label">
                    Description
                  </label>
                  <textarea
                    id="clubDescription"
                    value={createFormData.description}
                    onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                    className="form-input"
                    rows="4"
                    placeholder="Describe what this club is about"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="clubCategory" className="form-label">
                    Category
                  </label>
                  <select
                    id="clubCategory"
                    value={createFormData.category}
                    onChange={(e) => setCreateFormData({ ...createFormData, category: e.target.value })}
                    className="form-input"
                    required
                  >
                    <option value="General">General</option>
                    <option value="Genre">Genre</option>
                    <option value="Show">Show</option>
                    <option value="Seasonal">Seasonal</option>
                    <option value="Discussion">Discussion</option>
                    <option value="Fan Art">Fan Art</option>
                    <option value="Cosplay">Cosplay</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={createClubMutation.isLoading}
                  >
                    {createClubMutation.isLoading ? 'Creating...' : 'Create Club'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Results Summary */}
        {clubs.length > 0 && (
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              Showing {clubs.length} club{clubs.length !== 1 ? 's' : ''}
              {searchQuery && ` matching "${searchQuery}"`}
              {selectedCategory && ` in ${selectedCategory} category`}
            </p>
          </div>
        )}

        {/* Clubs Grid */}
        {clubs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-text">
              {searchQuery || selectedCategory 
                ? 'No clubs found matching your criteria. Try adjusting your filters.'
                : 'No clubs found. ' + (isAuthenticated ? 'Be the first to create one!' : 'Login to create or join clubs!')
              }
            </div>
            {!isAuthenticated && (
              <div className="mt-6">
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="btn-primary inline-flex items-center"
                >
                  <FaSignInAlt className="mr-2" />
                  Login to Join
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid-3">
            {clubs.map((club) => (
              <div key={club._id} className="club-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {club.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {club.description}
                    </p>
                  </div>
                  <span className="inline-block bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 text-xs px-2 py-1 rounded-full">
                    {club.category}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <FaUsers className="mr-1" />
                      <span>{club.memberCount || club.members?.length || 0} members</span>
                    </div>
                    <div className="flex items-center">
                      <FaComments className="mr-1" />
                      <span>{club.postCount || club.posts?.length || 0} posts</span>
                    </div>
                    <div className="flex items-center">
                      <FaPoll className="mr-1" />
                      <span>{club.polls?.length || 0} polls</span>
                    </div>
                  </div>
                  <div className="text-xs">
                    Created by {club.createdBy?.name || 'Unknown'}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => window.location.href = `/clubs/${club._id}`}
                    className="btn-outline text-sm px-3 py-2"
                  >
                    <FaEye className="mr-1" />
                    View Club
                  </button>

                  <div className="flex space-x-2">
                    {isMember(club) ? (
                      <button
                        onClick={() => handleLeaveClub(club._id)}
                        className="btn-secondary text-sm px-3 py-2"
                        disabled={leaveClubMutation.isLoading}
                      >
                        <FaSignOutAlt className="mr-1" />
                        Leave
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoinClub(club._id)}
                        className="btn-primary text-sm px-3 py-2"
                        disabled={joinClubMutation.isLoading}
                      >
                        <FaSignInAlt className="mr-1" />
                        Join
                      </button>
                    )}

                    {isOwner(club) && (
                      <button
                        onClick={() => window.location.href = `/clubs/${club._id}/edit`}
                        className="btn-outline text-sm px-3 py-2"
                      >
                        <FaEdit className="mr-1" />
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {clubs.length > 0 && (
          <div className="mt-12">
            <div className="card">
              <div className="card-header">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Club Statistics
                </h3>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                      {clubs.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Clubs
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-secondary-600 dark:text-secondary-400">
                      {clubs.reduce((sum, club) => sum + (club.memberCount || club.members?.length || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Members
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-success-600 dark:text-success-400">
                      {clubs.reduce((sum, club) => sum + (club.postCount || club.posts?.length || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Posts
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-warning-600 dark:text-warning-400">
                      {clubs.reduce((sum, club) => sum + (club.polls?.length || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Polls
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Clubs;
