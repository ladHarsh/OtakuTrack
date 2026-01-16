import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  FaUsers, FaShieldAlt, FaDownload, 
  FaBan, FaCheck, FaEye, FaEdit, FaTrash,
  FaExclamationTriangle, FaClipboardList,
  FaPlus, FaFilm
} from 'react-icons/fa';
// import { useAuth } from '../context/AuthContext'; // Removed unused
import adminApi from '../api/adminApi';
import { showApi } from '../api/showApi';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  // const { } = useAuth(); // Removed unused
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  // Removed unused state variables selectedUser and selectedClub
  const [selectedShow, setSelectedShow] = useState(null);
  const [showFormData, setShowFormData] = useState({
    title: '',
    description: '',
    type: 'TV',
    status: 'Ongoing',
    genres: [],
    year: new Date().getFullYear(),
    poster: '',
    studio: '',
    source: 'Original'
  });
  const [isAddingShow, setIsAddingShow] = useState(false);
  const [showMode, setShowMode] = useState('none');

  // Fetch admin statistics
  const { data: statsData, isLoading: statsLoading } = useQuery(
    ['admin-stats'],
    () => adminApi.getStats()
  );

  // Fetch users
  const { data: usersData, isLoading: usersLoading } = useQuery(
    ['admin-users'],
    () => adminApi.getUsers()
  );

  // Fetch clubs
  const { data: clubsData, isLoading: clubsLoading } = useQuery(
    ['admin-clubs'],
    () => adminApi.getClubs()
  );

  // Fetch shows
  const { data: showsData, isLoading: showsLoading } = useQuery(
    ['admin-shows'],
    () => showApi.getShows({ limit: 100 })
  );

  // Ban user mutation
  const banUserMutation = useMutation(
    (userId) => adminApi.banUser(userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-users']);
        toast.success('User banned successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to ban user');
      }
    }
  );

  // Unban user mutation
  const unbanUserMutation = useMutation(
    (userId) => adminApi.unbanUser(userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-users']);
        toast.success('User unbanned successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to unban user');
      }
    }
  );

  // Approve club mutation
  const approveClubMutation = useMutation(
    (clubId) => adminApi.approveClub(clubId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-clubs']);
        queryClient.invalidateQueries(['clubs']);
        toast.success('Club approved successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to approve club');
      }
    }
  );

  // Delete club mutation
  const deleteClubMutation = useMutation(
    (clubId) => adminApi.deleteClub(clubId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-clubs']);
        queryClient.invalidateQueries(['clubs']);
        toast.success('Club deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete club');
      }
    }
  );

  // Create show mutation
  const createShowMutation = useMutation(
    (showData) => showApi.createShow(showData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-shows']);
        queryClient.invalidateQueries(['shows']);
        toast.success('Show created successfully');
        setIsAddingShow(false);
        setShowFormData({
          title: '',
          description: '',
          type: 'TV',
          status: 'Ongoing',
          genres: [],
          year: new Date().getFullYear(),
          poster: '',
          studio: '',
          source: 'Original'
        });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create show');
      }
    }
  );

  // Update show mutation
  const updateShowMutation = useMutation(
    ({ id, showData }) => showApi.updateShow(id, showData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-shows']);
        queryClient.invalidateQueries(['shows']);
        toast.success('Show updated successfully');
        setSelectedShow(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update show');
      }
    }
  );

  // Delete show mutation
  const deleteShowMutation = useMutation(
    (showId) => showApi.deleteShow(showId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-shows']);
        queryClient.invalidateQueries(['shows']);
        toast.success('Show deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete show');
      }
    }
  );

  // Export data mutations
  const exportUsersMutation = useMutation(
    () => adminApi.exportUsers(),
    {
      onSuccess: (data) => {
        // Create and download CSV file
        const blob = new Blob([data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users-export.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Users exported successfully');
      },
      onError: (error) => {
        toast.error('Failed to export users');
      }
    }
  );

  const exportClubsMutation = useMutation(
    () => adminApi.exportClubs(),
    {
      onSuccess: (data) => {
        // Create and download CSV file
        const blob = new Blob([data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'clubs-export.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Clubs exported successfully');
      },
      onError: (error) => {
        toast.error('Failed to export clubs');
      }
    }
  );

  const stats = statsData?.data || {};
  const users = usersData?.data || [];
  const clubs = clubsData?.data || [];
  const shows = showsData?.data || [];

  const handleBanUser = (userId) => {
    if (window.confirm('Are you sure you want to ban this user?')) {
      banUserMutation.mutate(userId);
    }
  };

  const handleUnbanUser = (userId) => {
    if (window.confirm('Are you sure you want to unban this user?')) {
      unbanUserMutation.mutate(userId);
    }
  };

  const handleApproveClub = (clubId) => {
    if (window.confirm('Are you sure you want to approve this club?')) {
      approveClubMutation.mutate(clubId);
    }
  };

  const handleDeleteClub = (clubId) => {
    if (window.confirm('Are you sure you want to delete this club? This action cannot be undone.')) {
      deleteClubMutation.mutate(clubId);
    }
  };

  // Show management functions
  const handleCreateShow = () => {
    createShowMutation.mutate(showFormData);
  };

  const handleUpdateShow = (showId) => {
    updateShowMutation.mutate({ id: showId, showData: showFormData });
  };

  const handleDeleteShow = (showId) => {
    if (window.confirm('Are you sure you want to delete this show? This action cannot be undone.')) {
      deleteShowMutation.mutate(showId);
    }
  };

  const handleEditShow = (show) => {
    setSelectedShow(show);
    setShowFormData({
      title: show.title || '',
      description: show.description || '',
      type: show.type || 'TV',
      status: show.status || 'Ongoing',
      genres: show.genres || [],
      year: show.year || new Date().getFullYear(),
      poster: show.poster || '',
      studio: show.studio || '',
      source: show.source || 'Original'
    });
    setIsAddingShow(false);
    setShowMode('edit');
  };

  const handleAddShow = () => {
    setSelectedShow(null);
    setShowFormData({
      title: '',
      description: '',
      type: 'TV',
      status: 'Ongoing',
      genres: [],
      year: new Date().getFullYear(),
      poster: '',
      studio: '',
      source: 'Original'
    });
    setIsAddingShow(true);
    setShowMode('add');
  };

  const handleCancelShow = () => {
    setIsAddingShow(false);
    setShowMode('none');
    setSelectedShow(null);
    setShowFormData({
      title: '',
      description: '',
      type: 'TV',
      status: 'Ongoing',
      genres: [],
      year: new Date().getFullYear(),
      poster: '',
      studio: '',
      source: 'Original'
    });
  };

  if (statsLoading) {
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
          <h1 className="section-title">Admin Dashboard</h1>
          <p className="section-subtitle">
            Manage users, moderate content, and monitor system health
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
          {['overview', 'users', 'clubs', 'shows', 'reports'].map((tab) => (
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
        <div className="min-h-[600px]">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Key Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card text-center">
                  <div className="card-body">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaUsers className="text-primary-600 dark:text-primary-400 text-xl" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {stats.totalUsers || users.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Users
                    </div>
                  </div>
                </div>

                <div className="card text-center">
                  <div className="card-body">
                    <div className="w-12 h-12 bg-success-100 dark:bg-success-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaShieldAlt className="text-success-600 dark:text-success-400 text-xl" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {stats.activeUsers || users.filter(u => u.isActive).length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Active Users
                    </div>
                  </div>
                </div>

                <div className="card text-center">
                  <div className="card-body">
                    <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaClipboardList className="text-secondary-600 dark:text-secondary-400 text-xl" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {stats.totalClubs || clubs.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Clubs
                    </div>
                  </div>
                </div>

                <div className="card text-center">
                  <div className="card-body">
                    <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaExclamationTriangle className="text-warning-600 dark:text-warning-400 text-xl" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {stats.pendingClubs || clubs.filter(c => !c.isApproved).length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Pending Clubs
                    </div>
                  </div>
                </div>

                <div className="card text-center">
                  <div className="card-body">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaFilm className="text-purple-600 dark:text-purple-400 text-xl" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {shows.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Shows
                    </div>
                  </div>
                </div>
              </div>

              {/* System Health */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    System Health
                  </h3>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                        {stats.systemStatus === 'healthy' ? 'Healthy' : 'Warning'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        System Status
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                        {stats.uptime || '99.9%'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Uptime
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                        {stats.activeSessions || 0}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Active Sessions
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Export Options */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Data Export
                  </h3>
                </div>
                <div className="card-body">
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => exportUsersMutation.mutate()}
                      className="btn-outline inline-flex items-center"
                      disabled={exportUsersMutation.isLoading}
                    >
                      <FaDownload className="mr-2" />
                      {exportUsersMutation.isLoading ? 'Exporting...' : 'Export Users'}
                    </button>
                    <button
                      onClick={() => exportClubsMutation.mutate()}
                      className="btn-outline inline-flex items-center"
                      disabled={exportClubsMutation.isLoading}
                    >
                      <FaDownload className="mr-2" />
                      {exportClubsMutation.isLoading ? 'Exporting...' : 'Export Clubs'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Users Table */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    User Management
                  </h3>
                </div>
                <div className="card-body">
                  {usersLoading ? (
                    <div className="loading-spinner">
                      <div className="spinner"></div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Joined
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                          {users.map((user) => (
                            <tr key={user._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-primary-800 dark:text-primary-200">
                                      {user.name?.charAt(0) || 'U'}
                                    </span>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {user.name}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {user.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  user.role === 'admin' 
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                    : user.role === 'moderator'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                }`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  user.isActive
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                  {user.isActive ? 'Active' : 'Banned'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    // onClick={() => setSelectedUser(user)} // Removed unused
                                    className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                                  >
                                    <FaEye />
                                  </button>
                                  {user.isActive ? (
                                    <button
                                      onClick={() => handleBanUser(user._id)}
                                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                      disabled={banUserMutation.isLoading}
                                    >
                                      <FaBan />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleUnbanUser(user._id)}
                                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                      disabled={unbanUserMutation.isLoading}
                                    >
                                      <FaCheck />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clubs' && (
            <div className="space-y-6">
              {/* Clubs Table */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Club Moderation
                  </h3>
                </div>
                <div className="card-body">
                  {clubsLoading ? (
                    <div className="loading-spinner">
                      <div className="spinner"></div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Club
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Owner
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Members
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                          {clubs.map((club) => (
                            <tr key={club._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-secondary-100 dark:bg-secondary-900 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-secondary-800 dark:text-secondary-200">
                                      {club.name?.charAt(0) || 'C'}
                                    </span>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {club.name}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {club.description?.substring(0, 50)}...
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {club.createdBy?.name || 'Unknown'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {club.members?.length || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  club.isActive
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                }`}>
                                  {club.isActive ? 'Active' : 'Pending'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    // onClick={() => setSelectedClub(club)} // Removed unused
                                    className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                                  >
                                    <FaEye />
                                  </button>
                                  {!club.isActive && (
                                    <button
                                      onClick={() => handleApproveClub(club._id)}
                                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                      disabled={approveClubMutation.isLoading}
                                    >
                                      <FaCheck />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteClub(club._id)}
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                    disabled={deleteClubMutation.isLoading}
                                  >
                                    <FaTrash />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shows' && (
            <div className="space-y-6">
              {/* Show controls only */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Show Management</h3>
                </div>
                <div className="card-body flex gap-3">
                  <button onClick={handleAddShow} className="btn-primary inline-flex items-center">
                    <FaPlus className="mr-2" />
                    Add Show
                  </button>
                  <button onClick={() => setShowMode('edit')} className="btn-outline inline-flex items-center">
                    <FaEdit className="mr-2" />
                    Edit Show
                  </button>
                </div>
              </div>

              {/* Shows Table (visible only when no action selected) */}
              {showMode === 'none' && (
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">All Shows</h3>
                  </div>
                  <div className="card-body">
                    {showsLoading ? (
                      <div className="loading-spinner">
                        <div className="spinner"></div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Show</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Year</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {shows.map((show) => (
                              <tr key={show._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                                      <span className="text-sm font-medium text-primary-800 dark:text-primary-200">{show.title?.charAt(0) || 'S'}</span>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900 dark:text-white">{show.title}</div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">{show.type}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{show.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    show.status === 'Ongoing'
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  }`}>{show.status}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{show.year}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex space-x-2">
                                    <button onClick={() => handleEditShow(show)} className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"><FaEdit /></button>
                                    <button onClick={() => handleDeleteShow(show._id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" disabled={deleteShowMutation.isLoading}><FaTrash /></button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Show Form */}
              {showMode !== 'none' && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {isAddingShow ? 'Add New Show' : 'Edit Show'}
                  </h3>
                </div>
                <div className="card-body">
                  {showMode === 'edit' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select a Show to Edit</label>
                      <select
                        value={selectedShow?._id || ''}
                        onChange={(e) => {
                          const s = shows.find(sh => sh._id === e.target.value);
                          if (s) handleEditShow(s);
                        }}
                        className="form-input"
                      >
                        <option value="">-- Choose Show --</option>
                        {shows.map(sh => (
                          <option key={sh._id} value={sh._id}>{sh.title}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <form onSubmit={(e) => { e.preventDefault(); isAddingShow ? handleCreateShow() : handleUpdateShow(selectedShow._id); }} className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={showFormData.title}
                        onChange={(e) => setShowFormData({ ...showFormData, title: e.target.value })}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description
                      </label>
                      <textarea
                        id="description"
                        value={showFormData.description}
                        onChange={(e) => setShowFormData({ ...showFormData, description: e.target.value })}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                        rows="3"
                      />
                    </div>
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Type
                      </label>
                      <select
                        id="type"
                        value={showFormData.type}
                        onChange={(e) => setShowFormData({ ...showFormData, type: e.target.value })}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                      >
                        <option value="TV">TV Show</option>
                        <option value="Movie">Movie</option>
                        <option value="Anime">Anime</option>
                        <option value="Documentary">Documentary</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </label>
                      <select
                        id="status"
                        value={showFormData.status}
                        onChange={(e) => setShowFormData({ ...showFormData, status: e.target.value })}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                      >
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="genres" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Genres (comma-separated)
                      </label>
                      <input
                        type="text"
                        id="genres"
                        value={showFormData.genres.join(', ')}
                        onChange={(e) => setShowFormData({ ...showFormData, genres: e.target.value.split(',').map(g => g.trim()) })}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Year
                      </label>
                      <input
                        type="number"
                        id="year"
                        value={showFormData.year}
                        onChange={(e) => setShowFormData({ ...showFormData, year: parseInt(e.target.value, 10) })}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </div>
                    <div>
                      <label htmlFor="poster" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Poster URL
                      </label>
                      <input
                        type="url"
                        id="poster"
                        value={showFormData.poster}
                        onChange={(e) => setShowFormData({ ...showFormData, poster: e.target.value })}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label htmlFor="studio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Studio
                      </label>
                      <input
                        type="text"
                        id="studio"
                        value={showFormData.studio}
                        onChange={(e) => setShowFormData({ ...showFormData, studio: e.target.value })}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label htmlFor="source" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Source
                      </label>
                      <select
                        id="source"
                        value={showFormData.source}
                        onChange={(e) => setShowFormData({ ...showFormData, source: e.target.value })}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                      >
                        <option value="Original">Original</option>
                        <option value="Dubbed">Dubbed</option>
                        <option value="Subbed">Subbed</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={handleCancelShow}
                        className="btn-outline"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={isAddingShow ? createShowMutation.isLoading : updateShowMutation.isLoading}
                      >
                        {isAddingShow ? 'Add Show' : 'Update Show'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              {/* Reports Table */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Content Reports
                  </h3>
                </div>
                <div className="card-body">
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="text-4xl mb-4">📋</div>
                    <div className="text-lg">No reports at the moment</div>
                    <div className="text-sm">Content reports will appear here when users flag inappropriate content</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
