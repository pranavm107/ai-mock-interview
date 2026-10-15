import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CareerScoreCardProps {
  score: number;
  trend: 'Improving' | 'Stable' | 'Declining';
  delta: number;
}

export const CareerScoreCard: React.FC<CareerScoreCardProps> = ({ score, trend, delta }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-xs relative overflow-hidden"
    >
      <div className="absolute -right-8 -top-8 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-blue-600" />
          Career Score
        </h3>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
          trend === 'Improving' ? 'bg-green-100 text-green-700' :
          trend === 'Declining' ? 'bg-red-100 text-red-700' :
          'bg-slate-100 text-slate-700'
        }`}>
          {trend === 'Improving' && <TrendingUp className="w-3 h-3" />}
          {trend === 'Declining' && <TrendingDown className="w-3 h-3" />}
          {trend === 'Stable' && <Minus className="w-3 h-3" />}
          {delta > 0 ? `+${delta}` : delta} this month
        </span>
      </div>

      <div className="flex flex-col items-center justify-center py-2">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-slate-100 stroke-current"
              strokeWidth="7"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
            ></circle>
            <motion.circle
              className="text-blue-600 stroke-current"
              strokeWidth="7"
              strokeLinecap="round"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              initial={{ strokeDasharray: "0 251.2" }}
              animate={{ strokeDasharray: `${(score / 100) * 251.2} 251.2` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            ></motion.circle>
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-900 leading-none">{score}</span>
            <span className="text-[10px] text-slate-500 font-medium">/ 100</span>
          </div>
        </div>
      </div>
      
      <p className="text-xs text-center text-slate-600 mt-1.5">
        Trend: <span className="font-semibold text-blue-600">{trend}</span> performance
      </p>
    </motion.div>
  );
};
