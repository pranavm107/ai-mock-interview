import React from 'react';
import { motion } from 'framer-motion';
import type { InterviewStatus } from '../../types';

interface Props {
  totalQuestions: number;
  currentQuestion: number;
  status: InterviewStatus;
  className?: string;
}

export const InterviewProgress: React.FC<Props> = ({ totalQuestions, currentQuestion, status, className = '' }) => {
  let percentage = 0;
  let displayQuestion = currentQuestion;

  if (status === 'Completed') {
    percentage = 100;
    displayQuestion = totalQuestions;
  } else if (status === 'Draft' || status === 'Ready' || status === 'Cancelled') {
    percentage = 0;
    displayQuestion = 0;
  } else {
    // Treat currentQuestion as 1-indexed for display, or if it's 0-indexed, it might need +1. 
    // Assuming currentQuestion is the exact current question number to display (1-based from backend).
    percentage = totalQuestions > 0 ? Math.round((currentQuestion / totalQuestions) * 100) : 0;
  }

  
  const getStatusText = () => {
    if (status === 'Draft' || status === 'Ready') return 'Ready';
    if (status === 'Completed') return 'Finished';
    if (status === 'Cancelled') return 'Cancelled';
    return 'In Progress';
  };

  return (
    <div className={`w-full space-y-2.5 ${className}`}>
      <div className="flex justify-between items-end text-sm">
        <div className="flex flex-col">
          <span className="text-slate-500 font-medium text-xs uppercase tracking-wider mb-0.5">{getStatusText()}</span>
          <span className="text-slate-900 font-bold">
            Question {displayQuestion} / {totalQuestions}
          </span>
        </div>
        <span className="text-blue-600 font-bold">{percentage}% Completed</span>
      </div>
      
      <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
        <motion.div 
          className="h-full bg-blue-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};
