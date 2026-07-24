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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden"
    >
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-blue-600" />
          Career Score
        </h3>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
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

      <div className="flex flex-col items-center justify-center py-4">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-slate-100 stroke-current"
              strokeWidth="8"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
            ></circle>
            <motion.circle
              className="text-blue-600 stroke-current"
              strokeWidth="8"
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
            <span className="text-3xl font-black text-slate-900">{score}</span>
            <span className="text-xs text-slate-500 font-medium">/ 100</span>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-center text-slate-600 mt-2">
        Trend: <span className="font-bold text-blue-600">{trend}</span> performance
      </p>
    </motion.div>
  );
};
