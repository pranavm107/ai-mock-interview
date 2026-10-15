import React from 'react';
import type { ATSReadiness as ATSReadinessType } from '../../../server/src/types/interviewReport';
import { FileText, Mic, Briefcase, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  ats: ATSReadinessType;
}

export const ATSReadiness: React.FC<Props> = ({ ats }) => {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
          <Briefcase size={18} />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-800">ATS Readiness & Employability</h3>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 relative">
        
        {/* Background connecting line on desktop */}
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0 rounded-full"></div>
        
        {/* Resume Score */}
        <div className="flex flex-col items-center z-10 w-full md:w-1/3 bg-white p-2">
          <div className="w-12 h-12 rounded-full bg-slate-50 border-2 border-white shadow-xs flex items-center justify-center text-slate-400 mb-2 relative">
            <FileText size={18} />
            <div className="absolute -top-1.5 -right-1.5 bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-white">40%</div>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-slate-800">{ats.resumeScore}</span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Resume Match</span>
        </div>

        {/* Plus sign (Mobile) / Arrow (Desktop) */}
        <div className="z-10 text-slate-300 md:hidden">
          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">+</div>
        </div>

        {/* Interview Score */}
        <div className="flex flex-col items-center z-10 w-full md:w-1/3 bg-white p-2">
          <div className="w-12 h-12 rounded-full bg-slate-50 border-2 border-white shadow-xs flex items-center justify-center text-slate-400 mb-2 relative">
            <Mic size={18} />
            <div className="absolute -top-1.5 -right-1.5 bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-white">60%</div>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-slate-800">{ats.interviewScore}</span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Interview Score</span>
        </div>

        {/* Equals sign (Mobile) */}
        <div className="z-10 text-slate-300 md:hidden">
          <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-500">=</div>
        </div>
        
        {/* Arrow (Desktop) */}
        <div className="z-10 hidden md:block text-blue-300">
          <ChevronRight size={28} />
        </div>

        {/* Overall Employability */}
        <div className="flex flex-col items-center z-10 w-full md:w-1/3 bg-white p-2">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-white shadow-sm flex items-center justify-center text-white mb-2"
          >
            <span className="text-lg font-bold">{ats.overallEmployability}</span>
          </motion.div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mt-0.5 text-center">Overall Employability</span>
        </div>
      </div>
    </div>
  );
};
