import React from 'react';
import { useNavigate } from 'react-router-dom';

export const ReplayEmpty: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-6 text-center">
      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Replay Data</h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        This interview session does not have any replay data available yet.
      </p>
      <button
        onClick={() => navigate('/history')}
        className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity font-medium"
      >
        Back to History
      </button>
    </div>
  );
};
