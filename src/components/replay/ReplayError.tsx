import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ReplayErrorProps {
  message?: string;
}

export const ReplayError: React.FC<ReplayErrorProps> = ({ message = 'Failed to load replay.' }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Error</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">{message}</p>
        <button
          onClick={() => navigate('/history')}
          className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
        >
          Return to History
        </button>
      </div>
    </div>
  );
};
