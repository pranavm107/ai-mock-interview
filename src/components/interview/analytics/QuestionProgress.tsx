import React from 'react';
import { motion } from 'framer-motion';

interface QuestionProgressProps {
  currentQuestion: number; // 0-indexed
  totalQuestions: number;
}

export const QuestionProgress: React.FC<QuestionProgressProps> = ({ currentQuestion, totalQuestions }) => {
  const percentage = Math.max(0, Math.min(100, Math.round((currentQuestion / totalQuestions) * 100)));
  const displayNumber = Math.min(currentQuestion, totalQuestions); // Don't exceed total

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-2">
        <span className="text-sm font-medium text-slate-700">Interview Progress</span>
        <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
          {displayNumber} / {totalQuestions}
        </span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
        />
      </div>
    </div>
  );
};
