import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface CareerEmptyProps {
  onGenerate: () => void;
  isGenerating: boolean;
}

export const CareerEmpty: React.FC<CareerEmptyProps> = ({ onGenerate, isGenerating }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[380px] bg-white rounded-xl border border-slate-200/90 p-6 sm:p-8 text-center shadow-xs relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="bg-gradient-to-tr from-blue-100 to-indigo-100 p-4 rounded-full mb-4 relative z-10"
      >
        <Sparkles className="w-8 h-8 text-blue-600" />
      </motion.div>

      <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 relative z-10">Welcome to Your AI Career Coach</h2>
      <p className="text-slate-600 text-xs sm:text-sm mb-6 max-w-md leading-relaxed relative z-10">
        We'll analyze your past interviews, resume, and skills to generate a personalized roadmap, career score, and actionable coaching insights.
      </p>
      
      <button 
        onClick={onGenerate}
        disabled={isGenerating}
        className="relative z-10 flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium h-9 px-5 rounded-lg transition-all shadow-xs disabled:opacity-70 disabled:cursor-not-allowed text-xs sm:text-sm"
      >
        {isGenerating ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Analyzing Profile...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate Career Profile
          </>
        )}
      </button>
    </div>
  );
};
