import React from 'react';
import { QuestionStatusIndicator } from './QuestionStatusIndicator';
import type { InterviewQuestion } from '../../../types';

interface Props {
  questions: InterviewQuestion[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export const InterviewSidebar: React.FC<Props> = ({ questions, currentIndex, onSelect }) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-6">
      <h3 className="font-bold text-slate-900 mb-6">Questions</h3>
      
      {/* Desktop View (Vertical) */}
      <div className="hidden md:flex flex-col gap-3">
        {questions.map((q, index) => {
          const isCurrent = index === currentIndex;
          const isAnswered = q.status === 'answered';
          const status = isCurrent ? 'current' : isAnswered ? 'answered' : 'pending';
          
          return (
            <button
              key={q.id}
              onClick={() => onSelect(index)}
              className={`flex items-center gap-4 w-full p-3 rounded-xl transition-all text-left group ${
                isCurrent ? 'bg-blue-50 border border-blue-100 shadow-sm' : 'hover:bg-slate-50 border border-transparent'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${
                isCurrent 
                  ? 'bg-blue-600 text-white' 
                  : isAnswered 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1 truncate">
                <span className={`text-sm font-medium truncate block ${
                  isCurrent ? 'text-blue-900' : 'text-slate-600'
                }`}>
                  Question {index + 1}
                </span>
              </div>
              <QuestionStatusIndicator status={status} />
            </button>
          );
        })}
      </div>

      {/* Mobile View (Horizontal Scroll) */}
      <div className="flex md:hidden overflow-x-auto pb-4 gap-3 snap-x scrollbar-hide">
        {questions.map((q, index) => {
          const isCurrent = index === currentIndex;
          const isAnswered = q.status === 'answered';
          const status = isCurrent ? 'current' : isAnswered ? 'answered' : 'pending';
          
          return (
            <button
              key={q.id}
              onClick={() => onSelect(index)}
              className={`flex items-center gap-3 shrink-0 p-2.5 pr-4 rounded-xl transition-all snap-start ${
                isCurrent ? 'bg-blue-50 border border-blue-100 shadow-sm' : 'bg-slate-50 border border-slate-100'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${
                isCurrent ? 'bg-blue-600 text-white' : isAnswered ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'
              }`}>
                {index + 1}
              </div>
              <QuestionStatusIndicator status={status} />
            </button>
          );
        })}
      </div>
    </div>
  );
};
