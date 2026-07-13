import React from 'react';
import { motion } from 'framer-motion';
import type { InterviewStatus } from '../../types';

interface Props {
  totalQuestions: number;
  completedQuestions: number;
  status: InterviewStatus;
  className?: string;
}

export const InterviewProgress: React.FC<Props> = ({ totalQuestions, completedQuestions, status, className = '' }) => {
  const percentage = totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0;
  
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
            Question {completedQuestions} / {totalQuestions}
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
