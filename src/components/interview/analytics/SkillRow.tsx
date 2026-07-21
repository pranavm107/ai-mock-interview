import React from 'react';
import { motion } from 'framer-motion';

interface SkillRowProps {
  name: string;
  score: number;
}

export const SkillRow: React.FC<SkillRowProps> = ({ name, score }) => {
  const getProgressColor = (val: number) => {
    if (val >= 90) return 'bg-emerald-500';
    if (val >= 75) return 'bg-blue-500';
    if (val >= 60) return 'bg-orange-500';
    return 'bg-rose-500';
  };

  return (
    <div className="flex items-center gap-3">
      <div className="w-1/3 truncate text-sm font-medium text-slate-700" title={name}>
        {name}
      </div>
      <div className="w-1/2 h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${getProgressColor(score)}`}
        />
      </div>
      <div className="w-1/6 text-right text-xs font-semibold text-slate-500">
        {Math.round(score)}%
      </div>
    </div>
  );
};
