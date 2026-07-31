import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  current: number;
  total: number;
}

export const InterviewProgress: React.FC<Props> = ({ current, total }) => {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-2">
        <span className="text-sm font-semibold text-slate-700">Question {current} of {total}</span>
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{percentage}%</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-blue-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};
