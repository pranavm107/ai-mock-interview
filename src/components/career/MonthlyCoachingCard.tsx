import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Star, TrendingUp } from 'lucide-react';

interface MonthlyCoachingCardProps {
  coaching: {
    totalInterviews: number;
    averageScore: number;
    communicationTrend: string;
    summary: string;
    bestInterview: any;
  } | null;
}

export const MonthlyCoachingCard: React.FC<MonthlyCoachingCardProps> = ({ coaching }) => {
  if (!coaching) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-xs"
    >
      <div className="flex items-center gap-2 mb-3.5">
        <div className="bg-slate-100 p-1.5 rounded-lg">
          <LineChart className="w-4 h-4 text-slate-700" />
        </div>
        <h3 className="text-xs sm:text-sm font-semibold text-slate-800">Monthly Summary</h3>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="text-[11px] font-semibold text-slate-500 uppercase mb-2 flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> Key Metrics
          </h4>
          <ul className="space-y-1">
            <li className="text-xs sm:text-sm text-slate-700 flex items-start gap-1.5">
              <span className="text-blue-500 font-bold">•</span>
              Completed {coaching.totalInterviews} interviews
            </li>
            <li className="text-xs sm:text-sm text-slate-700 flex items-start gap-1.5">
              <span className="text-blue-500 font-bold">•</span>
              Maintained an average score of {coaching.averageScore}
            </li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-[11px] font-semibold text-slate-500 uppercase mb-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-green-500" /> Improvement Trends
          </h4>
          <div className="flex flex-wrap gap-1.5">
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${coaching.communicationTrend === 'Improving' ? 'bg-green-50 text-green-700 border-green-100' : coaching.communicationTrend === 'Declining' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-slate-50 text-slate-700 border-slate-100'}`}>
              Performance: {coaching.communicationTrend}
            </span>
          </div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <p className="text-xs text-slate-600 italic leading-relaxed">
            "{coaching.summary}"
          </p>
        </div>
      </div>
    </motion.div>
  );
};
