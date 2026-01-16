import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  FaUsers, FaComments, FaPoll, FaSignInAlt, FaSignOutAlt, 
  FaEdit, FaEye, FaEyeSlash,
  FaPlus, FaCalendar, FaUser, FaCrown, FaShieldAlt, FaLock 
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import clubApi from '../api/clubApi';
import PostCard from '../components/PostCard';
import PollCard from '../components/PollCard';

import toast from 'react-hot-toast';

const ClubDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('posts');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [showSpoilers, setShowSpoilers] = useState(false);

  
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    isSpoiler: false,
    spoilerFor: { showId: null, episodeNumber: null }
  });
  
  const [pollForm, setPollForm] = useState({
    question: '',
    options: ['', ''],
    endDate: '',
    isMultipleChoice: false
  });

  // Fetch club details
  const { data: clubData, isLoading, error } = useQuery(
    ['club', id],
    () => clubApi.getClubById(id),
    { refetchInterval: 30000 }
  );

  const club = clubData?.data;

  // Mutations
  const joinClubMutation = useMutation(
    () => clubApi.joinClub(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['club', id]);
        toast.success('Joined club successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to join club');
      }
    }
  );

  const leaveClubMutation = useMutation(
    () => clubApi.leaveClub(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['club', id]);
        toast.success('Left club successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to leave club');
      }
    }
  );

  const createPostMutation = useMutation(
    (data) => clubApi.createPost(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['club', id]);
        setShowCreatePost(false);
        setPostForm({ title: '', content: '', isSpoiler: false, spoilerFor: { showId: null, episodeNumber: null } });
        toast.success('Post created successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create post');
      }
    }
  );

  const createPollMutation = useMutation(
    (data) => clubApi.createPoll(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['club', id]);
        setShowCreatePoll(false);
        setPollForm({ question: '', options: ['', ''], endDate: '', isMultipleChoice: false });
        toast.success('Poll created successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create poll');
      }
    }
  );

  const voteMutation = useMutation(
    ({ pollId, optionIndexes }) => clubApi.voteOnPoll(id, pollId, optionIndexes),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['club', id]);
        toast.success('Vote recorded!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to vote');
      }
    }
  );

  const addCommentMutation = useMutation(
    ({ postId, content }) => clubApi.addComment(id, postId, content),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['club', id]);
        toast.success('Comment added!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to add comment');
      }
    }
  );

  const toggleLikeMutation = useMutation(
    (postId) => clubApi.togglePostLike(id, postId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['club', id]);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to like post');
      }
    }
  );

  const editPostMutation = useMutation(
    ({ postId, postData }) => clubApi.editPost(id, postId, postData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['club', id]);
        toast.success('Post updated successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update post');
      }
    }
  );

  const deletePostMutation = useMutation(
    (postId) => clubApi.deletePost(id, postId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['club', id]);
        toast.success('Post deleted successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete post');
      }
    }
  );

  const deletePollMutation = useMutation(
    (pollId) => clubApi.deletePoll(id, pollId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['club', id]);
        toast.success('Poll deleted successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete poll');
      }
    }
  );

  const deleteCommentMutation = useMutation(
    ({ postId, commentId }) => clubApi.deleteComment(id, postId, commentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['club', id]);
        toast.success('Comment deleted successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete comment');
      }
    }
  );

  // Check if user is member/admin
  const isMember = club?.isMember;
  const userRole = club?.userRole;
  const isAdmin = userRole === 'admin';
  // const isModerator = userRole === 'moderator'; // Removed unused
  
  // Additional checks for debugging
  const isCreator = club?.createdBy?._id?.toString() === user?._id?.toString();
  const isMemberInArray = club?.members?.some(member => member.userId._id?.toString() === user?._id?.toString());
  
  // Enhanced member detection
  const isActuallyMember = isMember || isCreator || isMemberInArray;
  // const actualUserRole = userRole || (isCreator ? 'admin' : null); // Removed unused
  
  // Debug logging removed

  // Handlers
  const handleJoinClub = () => {
    if (!isAuthenticated) {
      toast.error('Please login to join clubs');
      return;
    }
    joinClubMutation.mutate();
  };

  const handleLeaveClub = () => {
    if (window.confirm('Are you sure you want to leave this club?')) {
      leaveClubMutation.mutate();
    }
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to create posts');
      return;
    }
    if (!isActuallyMember) {
      toast.error('Please join the club to create posts');
      return;
    }
    if (!postForm.title.trim() || !postForm.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    
    // Clean the post data before sending
    const cleanPostData = {
      ...postForm,
      spoilerFor: {
        showId: postForm.spoilerFor.showId || null,
        episodeNumber: postForm.spoilerFor.episodeNumber || null
      }
    };
    
    createPostMutation.mutate(cleanPostData);
  };

  const handleCreatePoll = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to create polls');
      return;
    }
    if (!isActuallyMember) {
      toast.error('Please join the club to create polls');
      return;
    }
    if (!pollForm.question.trim() || pollForm.options.filter(opt => opt.trim()).length < 2) {
      toast.error('Please provide a question and at least 2 options');
      return;
    }
    createPollMutation.mutate({
      ...pollForm,
      options: pollForm.options.filter(opt => opt.trim())
    });
  };

  const handleVote = (pollId, optionIndexes) => {
    if (!isAuthenticated) {
      toast.error('Please login to vote');
      return;
    }
    if (!isActuallyMember) {
      toast.error('Please join the club to vote');
      return;
    }
    voteMutation.mutate({ pollId, optionIndexes });
  };

  const handleAddComment = (postId, content) => {
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }
    if (!isActuallyMember) {
      toast.error('Please join the club to comment');
      return;
    }
    if (!content.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    addCommentMutation.mutate({ postId, content });
  };

  const handleToggleLike = (postId) => {
    if (!isAuthenticated) {
      toast.error('Please login to like posts');
      return;
    }
    if (!isActuallyMember) {
      toast.error('Please join the club to like posts');
      return;
    }
    toggleLikeMutation.mutate(postId);
  };

  const handleEditPost = (postId, postData) => {
    editPostMutation.mutate({ postId, postData });
  };

  const handleDeletePost = (postId) => {
    deletePostMutation.mutate(postId);
  };

  const handleDeletePoll = (pollId) => {
    deletePollMutation.mutate(pollId);
  };

  const handleDeleteComment = (postId, commentId) => {
    deleteCommentMutation.mutate({ postId, commentId });
  };

  const addPollOption = () => {
    setPollForm(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removePollOption = (index) => {
    setPollForm(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const updatePollOption = (index, value) => {
    setPollForm(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
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

  if (error || !club) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">


        {/* Club Header */}
        <div className="card mb-8">
          <div className="card-body">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {club.name}
                  </h1>
                  <span className="inline-block bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 text-sm px-3 py-1 rounded-full">
                    {club.category}
                  </span>
                  {club.isPrivate && (
                    <span className="inline-block bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 text-sm px-3 py-1 rounded-full">
                      Private
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-4">
                  {club.description}
                </p>
                <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <FaUsers />
                    <span>{club.memberCount || club.members?.length || 0} members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaComments />
                    <span>{club.postCount || club.posts?.length || 0} posts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaPoll />
                    <span>{club.polls?.length || 0} polls</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCalendar />
                    <span>Created {new Date(club.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                {isAuthenticated ? (
                  isActuallyMember ? (
                    <button
                      onClick={handleLeaveClub}
                      className="btn-secondary"
                      disabled={leaveClubMutation.isLoading}
                    >
                      <FaSignOutAlt className="mr-2" />
                      Leave Club
                    </button>
                  ) : (
                    <button
                      onClick={handleJoinClub}
                      className="btn-primary"
                      disabled={joinClubMutation.isLoading}
                    >
                      <FaSignInAlt className="mr-2" />
                      Join Club
                    </button>
                  )
                                 ) : (
                   <button
                     onClick={() => navigate('/login')}
                     className="btn-primary"
                   >
                     <FaSignInAlt className="mr-2" />
                     Login to Join
                   </button>
                 )}
                
                {isAdmin && (
                  <button
                    onClick={() => navigate(`/clubs/${id}/edit`)}
                    className="btn-outline"
                  >
                    <FaEdit className="mr-2" />
                    Edit Club
                  </button>
                )}
              </div>
            </div>

            {/* Creator Info */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <FaUser className="text-primary-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      Created by {club.createdBy?.name || 'Unknown'}
                    </span>
                    <FaCrown className="text-yellow-500" title="Club Creator" />
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(club.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'posts'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <FaComments className="inline mr-2" />
            Discussion ({club.posts?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('polls')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'polls'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <FaPoll className="inline mr-2" />
            Polls ({club.polls?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'members'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <FaUsers className="inline mr-2" />
            Members ({club.members?.length || 0})
          </button>
        </div>

        {/* Spoiler Toggle */}
        {club.isSpoilerFree && (
          <div className="mb-6">
            <button
              onClick={() => setShowSpoilers(!showSpoilers)}
              className="btn-outline inline-flex items-center"
            >
              {showSpoilers ? <FaEyeSlash className="mr-2" /> : <FaEye className="mr-2" />}
              {showSpoilers ? 'Hide Spoilers' : 'Show Spoilers'}
            </button>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div>
            {/* Create Post Button */}
            <div className="mb-6">
              {!isAuthenticated ? (
                <button
                  onClick={() => navigate('/login')}
                  className="btn-primary inline-flex items-center"
                >
                  <FaLock className="mr-2" />
                  Login to Create Post
                </button>
              ) : !isActuallyMember ? (
                <button
                  onClick={handleJoinClub}
                  className="btn-primary inline-flex items-center"
                >
                  <FaSignInAlt className="mr-2" />
                  Join Club to Create Post
                </button>
              ) : (
                <button
                  onClick={() => setShowCreatePost(!showCreatePost)}
                  className="btn-primary inline-flex items-center"
                >
                  <FaPlus className="mr-2" />
                  {showCreatePost ? 'Cancel' : 'Create Post'}
                </button>
              )}
            </div>

            {/* Create Post Form */}
            {showCreatePost && isActuallyMember && (
              <div className="card mb-6">
                <div className="card-header">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Create New Post
                  </h3>
                </div>
                <div className="card-body">
                  <form onSubmit={handleCreatePost} className="space-y-4">
                    <div>
                      <label htmlFor="postTitle" className="form-label">
                        Title
                      </label>
                      <input
                        type="text"
                        id="postTitle"
                        value={postForm.title}
                        onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                        className="form-input"
                        placeholder="Post title"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="postContent" className="form-label">
                        Content
                      </label>
                      <textarea
                        id="postContent"
                        value={postForm.content}
                        onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                        className="form-input"
                        rows="6"
                        placeholder="Write your post content..."
                        required
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={postForm.isSpoiler}
                          onChange={(e) => setPostForm({ ...postForm, isSpoiler: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Contains spoilers
                        </span>
                      </label>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowCreatePost(false)}
                        className="btn-outline"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={createPostMutation.isLoading}
                      >
                        {createPostMutation.isLoading ? 'Creating...' : 'Create Post'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Posts List */}
            <div className="space-y-6">
              {club.posts?.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">💬</div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No posts yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {!isAuthenticated ? 'Login to start posting!' : 
                     !isActuallyMember ? 'Join the club to start posting!' : 
                     'Be the first to start a discussion!'}
                  </p>
                </div>
              ) : (
                club.posts?.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    clubId={id}
                    isMember={isActuallyMember}
                    showSpoilers={showSpoilers}
                    onAddComment={handleAddComment}
                    onToggleLike={handleToggleLike}
                    onToggleSpoilers={() => setShowSpoilers(!showSpoilers)}
                    onEditPost={handleEditPost}
                    onDeletePost={handleDeletePost}
                    onDeleteComment={handleDeleteComment}
                    userRole={userRole}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Polls Tab */}
        {activeTab === 'polls' && (
          <div>
            {/* Create Poll Button */}
            <div className="mb-6">
                             {!isAuthenticated ? (
                 <button
                   onClick={() => navigate('/login')}
                   className="btn-primary inline-flex items-center"
                 >
                   <FaLock className="mr-2" />
                   Login to Create Poll
                 </button>
              ) : !isActuallyMember ? (
                <button
                  onClick={handleJoinClub}
                  className="btn-primary inline-flex items-center"
                >
                  <FaSignInAlt className="mr-2" />
                  Join Club to Create Poll
                </button>
              ) : (
                <button
                  onClick={() => setShowCreatePoll(!showCreatePoll)}
                  className="btn-primary inline-flex items-center"
                >
                  <FaPlus className="mr-2" />
                  {showCreatePoll ? 'Cancel' : 'Create Poll'}
                </button>
              )}
            </div>

            {/* Create Poll Form */}
            {showCreatePoll && isActuallyMember && (
              <div className="card mb-6">
                <div className="card-header">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Create New Poll
                  </h3>
                </div>
                <div className="card-body">
                  <form onSubmit={handleCreatePoll} className="space-y-4">
                    <div>
                      <label htmlFor="pollQuestion" className="form-label">
                        Question
                      </label>
                      <input
                        type="text"
                        id="pollQuestion"
                        value={pollForm.question}
                        onChange={(e) => setPollForm({ ...pollForm, question: e.target.value })}
                        className="form-input"
                        placeholder="What would you like to ask?"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Options</label>
                      <div className="space-y-2">
                        {pollForm.options.map((option, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updatePollOption(index, e.target.value)}
                              className="form-input flex-1"
                              placeholder={`Option ${index + 1}`}
                              required
                            />
                            {pollForm.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removePollOption(index)}
                                className="btn-outline px-3"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={addPollOption}
                        className="btn-outline mt-2 text-sm"
                      >
                        Add Option
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={pollForm.isMultipleChoice}
                          onChange={(e) => setPollForm({ ...pollForm, isMultipleChoice: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Allow multiple choice
                        </span>
                      </label>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowCreatePoll(false)}
                        className="btn-outline"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={createPollMutation.isLoading}
                      >
                        {createPollMutation.isLoading ? 'Creating...' : 'Create Poll'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Polls List */}
            <div className="space-y-6">
              {club.polls?.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📊</div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No polls yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {!isAuthenticated ? 'Login to create polls!' : 
                     !isActuallyMember ? 'Join the club to create polls!' : 
                     'Create the first poll!'}
                  </p>
                </div>
              ) : (
                club.polls?.map((poll) => (
                  <PollCard
                    key={poll._id}
                    poll={poll}
                    clubId={id}
                    isMember={isActuallyMember}
                    onVote={handleVote}
                    onDeletePoll={handleDeletePoll}
                    userRole={userRole}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {club.members?.map((member) => (
                <div key={member.userId._id} className="card">
                  <div className="card-body">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <FaUser className="text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {member.userId.name}
                          </span>
                          {member.role === 'admin' && (
                            <FaCrown className="text-yellow-500" title="Club Creator" />
                          )}
                          {member.role === 'moderator' && (
                            <FaShieldAlt className="text-blue-500" title="Moderator" />
                          )}
                        </div>
                        <span className="text-sm text-gray-500 capitalize">
                          {member.role}
                        </span>
                        <div className="text-xs text-gray-400">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubDetail;
