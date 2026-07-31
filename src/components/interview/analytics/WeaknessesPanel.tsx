import React from 'react';
import type { Weakness } from '../../../types/liveEvaluation';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface WeaknessesPanelProps {
  weaknesses: Weakness[];
}

export const WeaknessesPanel: React.FC<WeaknessesPanelProps> = ({ weaknesses }) => {
  if (!weaknesses || weaknesses.length === 0) return null;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={18} className="text-orange-500" />
        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Areas for Improvement</h3>
      </div>
      <div className="space-y-3">
        {weaknesses.slice(0, 5).map((weakness, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-3 bg-orange-50/50 rounded-xl border border-orange-100"
          >
            <p className="text-sm font-semibold text-slate-800">{weakness.topic}</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{weakness.evidence}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
