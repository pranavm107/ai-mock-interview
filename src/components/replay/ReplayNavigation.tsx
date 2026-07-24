import React from 'react';
import type { ReplayNavigation as NavType } from '../../types/replay';

interface Props {
  navigation: NavType;
  onNavigate: (questionId: string) => void;
}

export const ReplayNavigation: React.FC<Props> = React.memo(({ navigation, onNavigate }) => {
  return (
    <div className="flex items-center justify-between mt-6 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
      <button
        onClick={() => navigation.previousQuestionId && onNavigate(navigation.previousQuestionId)}
        disabled={!navigation.previousQuestionId}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous Question"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Previous
      </button>

      <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
        Navigation
      </span>

      <button
        onClick={() => navigation.nextQuestionId && onNavigate(navigation.nextQuestionId)}
        disabled={!navigation.nextQuestionId}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Next Question"
      >
        Next
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
});
