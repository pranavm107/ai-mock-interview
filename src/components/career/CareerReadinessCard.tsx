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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between h-full relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            Career Readiness
          </h3>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className={`px-4 py-2 rounded-xl border ${getReadinessColor(readiness)} font-bold text-lg flex items-center gap-2 shadow-sm`}>
            {readiness === 'Excellent' && <Zap className="w-5 h-5" />}
            {readiness === 'High' && <Target className="w-5 h-5" />}
            {readiness} Readiness
          </div>
        </div>

        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          {summary}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-auto">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <Briefcase className="w-4 h-4 text-slate-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Interview Focus</p>
            <p className="text-sm font-bold text-slate-800">Targeted</p>
          </div>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <Target className="w-4 h-4 text-slate-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Readiness</p>
            <p className="text-sm font-bold text-slate-800">{readiness}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
