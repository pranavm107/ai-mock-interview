import React from 'react';
import { motion } from 'framer-motion';

export interface CommunicationRecommendationsProps {
  recommendations: string[];
  delay?: number;
}

export const CommunicationRecommendations: React.FC<CommunicationRecommendationsProps> = ({ recommendations, delay = 0 }) => {
  if (!recommendations || recommendations.length === 0) return null;
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="col-span-full bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mt-2"
    >
      <div className="text-indigo-300 text-xs font-medium uppercase tracking-wider mb-3 flex items-center">
        <span className="mr-2">💡</span> Coaching Tips
      </div>
      <ul className="space-y-2">
        {recommendations.map((rec, i) => (
          <li key={i} className="text-sm text-indigo-100 flex items-start">
            <span className="text-indigo-400 mr-2 mt-0.5">•</span>
            {rec}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};
