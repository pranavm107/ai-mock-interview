import React from 'react';
import type { ReplayQuestion } from '../../types/replay';
import { ReplayQuestionCard } from './ReplayQuestionCard';

interface Props {
  questions: ReplayQuestion[];
  currentQuestionId: string | null;
  onSelectQuestion: (questionId: string) => void;
}

export const ReplaySidebar: React.FC<Props> = React.memo(({ questions, currentQuestionId, onSelectQuestion }) => {
  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
          Questions ({questions.length})
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {questions.map(q => (
          <ReplayQuestionCard
            key={q.id}
            question={q}
            isActive={q.id === currentQuestionId}
            onClick={() => onSelectQuestion(q.id)}
          />
        ))}
      </div>
    </div>
  );
});
