import React from 'react';
import { motion } from 'framer-motion';
import { History, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecentInterview {
  id: string;
  date: string;
  score: number;
  status: string;
  type: string;
}

export const RecentInterviewCard: React.FC<{ recent?: RecentInterview[] }> = ({ recent = [] }) => {
  const navigate = useNavigate();

  const recentInterviews = recent.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-xs"
    >
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5">
          <History className="w-4 h-4 text-indigo-600" />
          Recent Performance
        </h3>
        <button 
          onClick={() => navigate('/history')}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer transition-colors"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2">
        {recentInterviews.map((interview, idx) => (
          <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-2xs hover:border-slate-200 transition-all cursor-pointer">
            <div className="min-w-0 pr-2">
              <h4 className="font-semibold text-xs sm:text-sm text-slate-800 truncate">{interview.type}</h4>
              <p className="text-[11px] text-slate-500">{new Date(interview.date).toLocaleDateString()}</p>
            </div>
            <div className="flex flex-col items-end shrink-0">
              {interview.status === 'Completed' ? (
                <>
                  <span className={`text-xs sm:text-sm font-bold ${interview.score >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {interview.score}/100
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 uppercase">Completed</span>
                </>
              ) : interview.status === 'Draft' ? (
                <>
                  <span className="text-xs sm:text-sm font-bold text-slate-400">--/100</span>
                  <span className="text-[10px] font-medium text-slate-400 uppercase">Pending</span>
                </>
              ) : (
                <>
                  <span className="text-xs sm:text-sm font-bold text-slate-400">--/100</span>
                  <span className="text-[10px] font-medium text-blue-500 uppercase">In Progress</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
