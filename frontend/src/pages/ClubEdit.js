import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { FaSave, FaArrowLeft, FaTrash } from 'react-icons/fa';
// import { useAuth } from '../context/AuthContext'; // Removed unused
import clubApi from '../api/clubApi';
import toast from 'react-hot-toast';

const ClubEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // const { } = useAuth(); // Removed unused
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'General',
    rules: [],
    tags: [],
    isPrivate: false,
    isSpoilerFree: false,
    maxMembers: 1000
  });

  const [newRule, setNewRule] = useState('');
  const [newTag, setNewTag] = useState('');

  // Fetch club details
  const { data: clubData, isLoading, error } = useQuery(
    ['club', id],
    () => clubApi.getClubById(id)
  );

  const club = clubData?.data;

  // Update club mutation
  const updateClubMutation = useMutation(
    (data) => clubApi.updateClub(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['club', id]);
        toast.success('Club updated successfully!');
        navigate(`/clubs/${id}`);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update club');
      }
    }
  );

  // Delete club mutation
  const deleteClubMutation = useMutation(
    () => clubApi.deleteClub(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['clubs']);
        toast.success('Club deleted successfully');
        navigate('/clubs');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete club');
      }
    }
  );

  // Check if user is admin
  const isAdmin = club?.userRole === 'admin';

  // Update form data when club data is loaded
  useEffect(() => {
    if (club) {
      setFormData({
        name: club.name || '',
        description: club.description || '',
        category: club.category || 'General',
        rules: club.rules || [],
        tags: club.tags || [],
        isPrivate: club.isPrivate || false,
        isSpoilerFree: club.isSpoilerFree || false,
        maxMembers: club.maxMembers || 1000
      });
    }
  }, [club]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    updateClubMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this club? This action cannot be undone.')) {
      deleteClubMutation.mutate();
    }
  };

  const addRule = () => {
    if (newRule.trim() && !formData.rules.includes(newRule.trim())) {
      setFormData(prev => ({
        ...prev,
        rules: [...prev.rules, newRule.trim()]
      }));
      setNewRule('');
    }
  };

  const removeRule = (index) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Club not found
            </h1>
            <button
              onClick={() => navigate('/clubs')}
              className="btn-primary"
            >
              Back to Clubs
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Only club admins can edit club information.
            </p>
            <button
              onClick={() => navigate(`/clubs/${id}`)}
              className="btn-primary"
            >
              Back to Club
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Edit Club
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Update your club's information and settings
            </p>
          </div>
          <button
            onClick={() => navigate(`/clubs/${id}`)}
            className="btn-outline inline-flex items-center"
          >
            <FaArrowLeft className="mr-2" />
            Back to Club
          </button>
        </div>

        {/* Edit Form */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Club Information
            </h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="clubName" className="form-label">
                    Club Name *
                  </label>
                  <input
                    type="text"
                    id="clubName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                    placeholder="Enter club name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="clubCategory" className="form-label">
                    Category *
                  </label>
                  <select
                    id="clubCategory"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
              </div>

              <div>
                <label htmlFor="clubDescription" className="form-label">
                  Description *
                </label>
                <textarea
                  id="clubDescription"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-input"
                  rows="4"
                  placeholder="Describe what this club is about"
                  required
                />
              </div>

              {/* Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="maxMembers" className="form-label">
                    Maximum Members
                  </label>
                  <input
                    type="number"
                    id="maxMembers"
                    value={formData.maxMembers}
                    onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) || 1000 })}
                    className="form-input"
                    min="1"
                    max="10000"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPrivate}
                      onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Private Club
                    </span>
                  </label>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isSpoilerFree}
                      onChange={(e) => setFormData({ ...formData, isSpoilerFree: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Spoiler-Free Zone
                    </span>
                  </label>
                </div>
              </div>

              {/* Rules */}
              <div>
                <label className="form-label">Club Rules</label>
                <div className="space-y-2">
                  {formData.rules.map((rule, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                        {rule}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeRule(index)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newRule}
                      onChange={(e) => setNewRule(e.target.value)}
                      className="form-input flex-1"
                      placeholder="Add a new rule"
                    />
                    <button
                      type="button"
                      onClick={addRule}
                      className="btn-outline px-4"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="form-label">Tags</label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="form-input flex-1"
                      placeholder="Add a new tag"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="btn-outline px-4"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="btn-danger inline-flex items-center"
                  disabled={deleteClubMutation.isLoading}
                >
                  <FaTrash className="mr-2" />
                  {deleteClubMutation.isLoading ? 'Deleting...' : 'Delete Club'}
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/clubs/${id}`)}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary inline-flex items-center"
                    disabled={updateClubMutation.isLoading}
                  >
                    <FaSave className="mr-2" />
                    {updateClubMutation.isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubEdit;
