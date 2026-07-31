import React from 'react';
import type { DifficultyLevel } from '../../../types/liveEvaluation';
import { Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface DifficultyIndicatorProps {
  difficulty: DifficultyLevel;
}

export const DifficultyIndicator: React.FC<DifficultyIndicatorProps> = ({ difficulty }) => {
  const getBadgeStyle = () => {
    switch (difficulty) {
      case 'Easy': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Medium': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Hard': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Adaptive': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1">
        <Target size={14} /> Difficulty
      </span>
      <motion.div
        key={difficulty}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${getBadgeStyle()}`}
      >
        {difficulty}
      </motion.div>
    </div>
  );
};
