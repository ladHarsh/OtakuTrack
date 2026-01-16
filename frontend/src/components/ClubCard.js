import React from 'react';
import { FaUsers, FaEye } from 'react-icons/fa';

const ClubCard = ({ club }) => {
  return (
    <div className="club-card">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {club?.name || 'Club Name'}
            </h3>
            <span className="inline-block bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
              {club?.category || 'General'}
            </span>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
              <FaUsers />
              <span>{club?.memberCount || club?.members?.length || 0}</span>
            </div>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {club?.description || 'Club description coming soon...'}
        </p>

        <div className="flex gap-2">
          <button className="btn-outline flex-1 flex items-center justify-center">
            <FaEye className="mr-2" />
            View Club
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClubCard;
