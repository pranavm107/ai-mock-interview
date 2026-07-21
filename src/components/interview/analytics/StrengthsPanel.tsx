import React from 'react';
import type { Strength } from '../../../types/liveEvaluation';
import { ThumbsUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface StrengthsPanelProps {
  strengths: Strength[];
}

export const StrengthsPanel: React.FC<StrengthsPanelProps> = ({ strengths }) => {
  if (!strengths || strengths.length === 0) return null;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <ThumbsUp size={18} className="text-emerald-500" />
        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Top Strengths</h3>
      </div>
      <div className="space-y-3">
        {strengths.slice(0, 5).map((strength, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100"
          >
            <Zap size={16} className="text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-800">{strength.topic}</p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{strength.evidence}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
