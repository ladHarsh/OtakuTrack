import React, { useState } from 'react';
import { FaUser, FaTrash, FaEllipsisH, FaLock, FaChartBar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useMutation, useQueryClient } from 'react-query';
import clubApi from '../api/clubApi';
import toast from 'react-hot-toast';

const PollCard = ({ poll, clubId, isMember, onVote, onDeletePoll, userRole }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const closePollMutation = useMutation(
    () => clubApi.closePoll(clubId, poll._id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['club', clubId]);
        toast.success('Poll closed successfully!');
        setShowMenu(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to close poll');
      }
    }
  );

  const handleVote = () => {
    if (selectedOptions.length === 0) {
      toast.error('Please select at least one option');
      return;
    }
    onVote(poll._id, selectedOptions);
    setSelectedOptions([]);
  };

  const handleDeletePoll = () => {
    if (window.confirm('Are you sure you want to delete this poll?')) {
      onDeletePoll(poll._id);
    }
    setShowMenu(false);
  };

  const handleClosePoll = () => {
    if (window.confirm('Are you sure you want to close this poll? This action cannot be undone.')) {
      closePollMutation.mutate();
    }
  };

  const hasVoted = poll.options.some(option => 
    option.votes.some(vote => vote.userId === user?._id)
  );

  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes.length, 0);
  const uniqueVoters = new Set();
  poll.options.forEach(option => {
    option.votes.forEach(vote => uniqueVoters.add(vote.userId.toString()));
  });

  const isCreator = poll.createdBy?._id === user?._id;
  const isAdminOrMod = userRole === 'admin' || userRole === 'moderator';
  const canDelete = isCreator || isAdminOrMod;
  const canClose = (isCreator || isAdminOrMod) && poll.isActive;

  // Check if poll has ended
  const isExpired = poll.endDate && new Date() > new Date(poll.endDate);

  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <FaUser className="text-primary-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {poll.createdBy?.name || 'Unknown'}
              </div>
              <div className="text-sm text-gray-500">
                {new Date(poll.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!poll.isActive && (
              <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 text-xs font-medium rounded-full">
                Closed
              </span>
            )}
            {isExpired && poll.isActive && (
              <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs font-medium rounded-full">
                Expired
              </span>
            )}
            {poll.isMultipleChoice && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium rounded-full">
                Multiple Choice
              </span>
            )}
            {(canDelete || canClose) && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg transition-colors"
                >
                  <FaEllipsisH />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                    {canClose && (
                      <button
                        onClick={handleClosePoll}
                        className="w-full px-3 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center gap-2"
                      >
                        <FaLock className="text-sm" />
                        Close Poll
                      </button>
                    )}
                    <button
                      onClick={() => setShowResults(!showResults)}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <FaChartBar className="text-sm" />
                      {showResults ? 'Hide Results' : 'Show Results'}
                    </button>
                    {canDelete && (
                      <button
                        onClick={handleDeletePoll}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                      >
                        <FaTrash className="text-sm" />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {poll.question}
        </h3>

        {/* Poll Statistics */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <span>{totalVotes} total votes</span>
          <span>{uniqueVoters.size} unique voters</span>
          {poll.endDate && (
            <span>
              Ends: {new Date(poll.endDate).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="space-y-3 mb-4">
          {poll.options.map((option, index) => {
            const voteCount = option.votes.length;
            const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
            const hasUserVote = option.votes.some(vote => vote.userId === user?._id);

            return (
              <div key={index} className="relative">
                {!hasVoted && poll.isActive && isMember && !isExpired ? (
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <input
                      type={poll.isMultipleChoice ? 'checkbox' : 'radio'}
                      name="poll-option"
                      value={index}
                      checked={selectedOptions.includes(index)}
                      onChange={(e) => {
                        if (poll.isMultipleChoice) {
                          if (e.target.checked) {
                            setSelectedOptions([...selectedOptions, index]);
                          } else {
                            setSelectedOptions(selectedOptions.filter(i => i !== index));
                          }
                        } else {
                          setSelectedOptions([index]);
                        }
                      }}
                      className="text-primary-600"
                    />
                    <span className="text-gray-700 dark:text-gray-300 flex-1">
                      {option.text}
                    </span>
                    {showResults && (
                      <span className="text-sm text-gray-500">
                        {voteCount} votes ({percentage.toFixed(1)}%)
                      </span>
                    )}
                  </label>
                ) : (
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 dark:text-gray-300 flex-1">
                        {option.text}
                      </span>
                      <span className="text-sm text-gray-500">
                        {voteCount} votes ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${
                          hasUserVote ? 'bg-primary-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    {hasUserVote && (
                      <div className="text-xs text-primary-600 mt-1 flex items-center gap-1">
                        <span>✓</span>
                        <span>Your vote</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Voting Button */}
        {!hasVoted && poll.isActive && isMember && !isExpired && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleVote}
              className="btn-primary"
              disabled={selectedOptions.length === 0}
            >
              Vote
            </button>
            {!showResults && (
              <button
                onClick={() => setShowResults(true)}
                className="btn-outline text-sm"
              >
                <FaChartBar className="mr-1" />
                Show Results
              </button>
            )}
          </div>
        )}

        {/* Results Toggle Button */}
        {hasVoted && !showResults && (
          <button
            onClick={() => setShowResults(true)}
            className="btn-outline text-sm"
          >
            <FaChartBar className="mr-1" />
            Show Results
          </button>
        )}

        {/* Poll Status */}
        {isExpired && poll.isActive && (
          <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">
              This poll has expired and is no longer accepting votes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PollCard;
