import React from 'react';
import type { Trend } from '../../../types/liveEvaluation';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface PerformanceTrendProps {
  trend: Trend;
}

export const PerformanceTrend: React.FC<PerformanceTrendProps> = ({ trend }) => {
  const getTrendConfig = () => {
    switch (trend) {
      case 'Improving':
        return {
          icon: <TrendingUp size={16} />,
          classes: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          text: 'Improving'
        };
      case 'Declining':
        return {
          icon: <TrendingDown size={16} />,
          classes: 'bg-orange-50 text-orange-600 border-orange-100',
          text: 'Needs Improvement'
        };
      case 'Stable':
      default:
        return {
          icon: <Minus size={16} />,
          classes: 'bg-blue-50 text-blue-600 border-blue-100',
          text: 'Stable'
        };
    }
  };

  const config = getTrendConfig();

  return (
    <motion.div
      key={trend}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium ${config.classes}`}
    >
      {config.icon}
      {config.text}
    </motion.div>
  );
};
