import React from 'react';
import type { ATSReadiness as ATSReadinessType } from '../../../server/src/types/interviewReport';
import { FileText, Mic, Briefcase, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  ats: ATSReadinessType;
}

export const ATSReadiness: React.FC<Props> = ({ ats }) => {
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
          <Briefcase size={20} />
        </div>
        <h3 className="text-xl font-bold text-slate-800">ATS Readiness & Employability</h3>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative">
        
        {/* Background connecting line on desktop */}
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full"></div>
        
        {/* Resume Score */}
        <div className="flex flex-col items-center z-10 w-full md:w-1/3 bg-white p-4">
          <div className="w-16 h-16 rounded-full bg-slate-50 border-4 border-white shadow-md flex items-center justify-center text-slate-400 mb-3 relative">
            <FileText size={24} />
            <div className="absolute -top-2 -right-2 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full border-2 border-white">40%</div>
          </div>
          <span className="text-3xl font-bold text-slate-800">{ats.resumeScore}</span>
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-1">Resume Match</span>
        </div>

        {/* Plus sign (Mobile) / Arrow (Desktop) */}
        <div className="z-10 text-slate-300 md:hidden">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">+</div>
        </div>

        {/* Interview Score */}
        <div className="flex flex-col items-center z-10 w-full md:w-1/3 bg-white p-4">
          <div className="w-16 h-16 rounded-full bg-slate-50 border-4 border-white shadow-md flex items-center justify-center text-slate-400 mb-3 relative">
            <Mic size={24} />
            <div className="absolute -top-2 -right-2 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full border-2 border-white">60%</div>
          </div>
          <span className="text-3xl font-bold text-slate-800">{ats.interviewScore}</span>
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-1">Interview Score</span>
        </div>

        {/* Equals sign (Mobile) */}
        <div className="z-10 text-slate-300 md:hidden">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-400">=</div>
        </div>
        
        {/* Arrow (Desktop) */}
        <div className="z-10 hidden md:block text-blue-200">
          <ChevronRight size={40} />
        </div>

        {/* Overall Employability */}
        <div className="flex flex-col items-center z-10 w-full md:w-1/3 bg-white p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-4 border-white shadow-lg flex items-center justify-center text-white mb-3"
          >
            <span className="text-2xl font-bold">{ats.overallEmployability}</span>
          </motion.div>
          <span className="text-sm font-bold text-blue-600 uppercase tracking-wider mt-1 text-center">Overall Employability</span>
        </div>
      </div>
    </div>
  );
};
