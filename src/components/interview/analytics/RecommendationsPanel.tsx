import React from 'react';
import type { Weakness } from '../../../types/liveEvaluation';
import { Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

interface RecommendationsPanelProps {
  weaknesses: Weakness[];
}

export const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({ weaknesses }) => {
  if (!weaknesses || weaknesses.length === 0) return null;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb size={18} className="text-blue-500" />
        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Live Coaching</h3>
      </div>
      <div className="space-y-2">
        {weaknesses.slice(0, 5).map((weakness, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-3 p-3 bg-blue-50/50 rounded-xl"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"></div>
            <p className="text-sm text-slate-700 leading-relaxed">{weakness.recommendation}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
