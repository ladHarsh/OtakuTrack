import React from 'react';
import { FaEye, FaCheck, FaPause, FaTimes, FaClock } from 'react-icons/fa';

const WatchlistTabs = ({ activeTab, onTabChange, counts }) => {
  const tabs = [
    { key: 'all', label: 'All Shows', icon: null, count: counts?.all || 0 },
    { key: 'watching', label: 'Watching', icon: <FaEye className="text-blue-500" />, count: counts?.watching || 0 },
    { key: 'completed', label: 'Completed', icon: <FaCheck className="text-green-500" />, count: counts?.completed || 0 },
    { key: 'on-hold', label: 'On Hold', icon: <FaPause className="text-yellow-500" />, count: counts?.onHold || 0 },
    { key: 'dropped', label: 'Dropped', icon: <FaTimes className="text-red-500" />, count: counts?.dropped || 0 },
    { key: 'plan-to-watch', label: 'Plan to Watch', icon: <FaClock className="text-purple-500" />, count: counts?.planToWatch || 0 }
  ];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav className="-mb-px flex space-x-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
              activeTab === tab.key
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center space-x-2">
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                {tab.count}
              </span>
            </div>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default WatchlistTabs;
