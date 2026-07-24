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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-600" />
          Recent Performance
        </h3>
        <button 
          onClick={() => navigate('/history')}
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
        >
          View All <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {recentInterviews.map((interview, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-sm hover:border-slate-200 transition-all cursor-pointer">
            <div>
              <h4 className="font-semibold text-sm text-slate-800">{interview.type}</h4>
              <p className="text-xs text-slate-500">{new Date(interview.date).toLocaleDateString()}</p>
            </div>
            <div className="flex flex-col items-end">
              {interview.status === 'Completed' ? (
                <>
                  <span className={`text-sm font-bold ${interview.score >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {interview.score}/100
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 uppercase">Completed</span>
                </>
              ) : interview.status === 'Draft' ? (
                <>
                  <span className="text-sm font-bold text-slate-400">--/100</span>
                  <span className="text-[10px] font-medium text-slate-400 uppercase">Pending Evaluation</span>
                </>
              ) : (
                <>
                  <span className="text-sm font-bold text-slate-400">--/100</span>
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
