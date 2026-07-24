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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-slate-100 p-2 rounded-xl">
          <LineChart className="w-5 h-5 text-slate-700" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Monthly Summary</h3>
      </div>

      <div className="space-y-5">
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> Key Metrics
          </h4>
          <ul className="space-y-2">
            <li className="text-sm text-slate-700 flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              Completed {coaching.totalInterviews} interviews
            </li>
            <li className="text-sm text-slate-700 flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              Maintained an average score of {coaching.averageScore}
            </li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-green-500" /> Improvement Trends
          </h4>
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${coaching.communicationTrend === 'Improving' ? 'bg-green-50 text-green-700 border-green-100' : coaching.communicationTrend === 'Declining' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-slate-50 text-slate-700 border-slate-100'}`}>
              Performance: {coaching.communicationTrend}
            </span>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <p className="text-sm text-slate-600 italic">
            "{coaching.summary}"
          </p>
        </div>
      </div>
    </motion.div>
  );
};
