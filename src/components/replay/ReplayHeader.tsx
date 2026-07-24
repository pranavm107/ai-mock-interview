import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ReplayMetadata } from '../../types/replay';

interface Props {
  metadata: ReplayMetadata;
}

export const ReplayHeader: React.FC<Props> = ({ metadata }) => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/history')}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          aria-label="Back to History"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white leading-tight">
            Interview Replay
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {new Date(metadata.startedAt).toLocaleDateString()} • {Math.round(metadata.totalDurationMs / 60000)} mins
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
          Share
        </button>
        <button 
          onClick={() => navigate(`/review/${sessionId}`)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm flex items-center shadow-blue-500/20"
        >
          AI Review
        </button>
        <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors">
          View Report
        </button>
      </div>
    </header>
  );
};
