import React from 'react';

export const ReplayLoading: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-600 dark:text-slate-400 font-medium">Loading replay session...</p>
      </div>
    </div>
  );
};
