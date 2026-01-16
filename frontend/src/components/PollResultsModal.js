import React from 'react';
import { FaTimes, FaChartBar, FaUsers, FaCalendar, FaCheck } from 'react-icons/fa';

const PollResultsModal = ({ poll, isOpen, onClose, userVote }) => {
  if (!isOpen || !poll) return null;

  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes.length, 0);
  const uniqueVoters = new Set();
  poll.options.forEach(option => {
    option.votes.forEach(vote => uniqueVoters.add(vote.userId.toString()));
  });

  const optionStats = poll.options.map((option, index) => {
    const voteCount = option.votes.length;
    const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
    const hasUserVote = option.votes.some(vote => vote.userId === userVote);
    
    return {
      index,
      text: option.text,
      votes: voteCount,
      percentage: Math.round(percentage * 100) / 100,
      hasUserVote
    };
  });

  // Sort options by vote count (highest first)
  optionStats.sort((a, b) => b.votes - a.votes);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <FaChartBar className="text-primary-600 text-xl" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Poll Results
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Poll Info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {poll.question}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <FaUsers />
              <span>{uniqueVoters.size} unique voters</span>
            </div>
            <div className="flex items-center gap-2">
              <FaChartBar />
              <span>{totalVotes} total votes</span>
            </div>
            {poll.endDate && (
              <div className="flex items-center gap-2">
                <FaCalendar />
                <span>Ends: {new Date(poll.endDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {poll.isMultipleChoice && (
            <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                This is a multiple choice poll - voters can select multiple options
              </p>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="p-6">
          <div className="space-y-4">
            {optionStats.map((option, index) => (
              <div key={option.index} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {option.text}
                    </span>
                    {option.hasUserVote && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 text-xs rounded-full">
                        <FaCheck className="text-xs" />
                        Your vote
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {option.votes} votes
                    </div>
                    <div className="text-xs text-gray-500">
                      {option.percentage}%
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      option.hasUserVote 
                        ? 'bg-primary-500' 
                        : index === 0 
                          ? 'bg-green-500' 
                          : index === 1 
                            ? 'bg-blue-500' 
                            : index === 2 
                              ? 'bg-yellow-500' 
                              : 'bg-gray-400'
                    }`}
                    style={{ width: `${option.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Summary
            </h4>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>• {optionStats[0]?.text} is leading with {optionStats[0]?.votes} votes</p>
              <p>• {optionStats[optionStats.length - 1]?.text} has the least votes with {optionStats[optionStats.length - 1]?.votes} votes</p>
              <p>• Average votes per option: {(totalVotes / poll.options.length).toFixed(1)}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="btn-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PollResultsModal;
