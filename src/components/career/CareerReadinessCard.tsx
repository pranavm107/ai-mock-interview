import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Target, Zap, Briefcase } from 'lucide-react';

interface CareerReadinessCardProps {
  readiness: string;
  summary: string;
}

export const CareerReadinessCard: React.FC<CareerReadinessCardProps> = ({ readiness, summary }) => {
  const getReadinessColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'excellent': return 'text-purple-600 bg-purple-100 border-purple-200';
      case 'high': return 'text-green-600 bg-green-100 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default: return 'text-red-600 bg-red-100 border-red-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between h-full relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            Career Readiness
          </h3>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className={`px-3 py-1.5 rounded-lg border ${getReadinessColor(readiness)} font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs`}>
            {readiness === 'Excellent' && <Zap className="w-4 h-4" />}
            {readiness === 'High' && <Target className="w-4 h-4" />}
            {readiness} Readiness
          </div>
        </div>

        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
          {summary}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mt-auto">
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center gap-2">
          <div className="bg-white p-1.5 rounded shadow-2xs">
            <Briefcase className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Interview Focus</p>
            <p className="text-xs font-semibold text-slate-800">Targeted</p>
          </div>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center gap-2">
          <div className="bg-white p-1.5 rounded shadow-2xs">
            <Target className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Readiness</p>
            <p className="text-xs font-semibold text-slate-800">{readiness}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
