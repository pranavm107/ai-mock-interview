import React from 'react';
import type { ReplayQuestion } from '../../types/replay';

interface Props {
  question: ReplayQuestion;
  isActive: boolean;
  onClick: () => void;
}

export const ReplayQuestionCard: React.FC<Props> = React.memo(({ question, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        isActive 
          ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 shadow-sm' 
          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary-300'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Question {question.index + 1}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          question.difficulty === 'EASY' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
          question.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {question.difficulty}
        </span>
      </div>
      <p className="text-sm text-slate-900 dark:text-slate-100 font-medium line-clamp-3">
        {question.text}
      </p>
      {question.answer && (
        <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {Math.round(question.answer.durationMs / 1000)}s
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {question.answer.wordCount} words
          </span>
        </div>
      )}
    </button>
  );
});
