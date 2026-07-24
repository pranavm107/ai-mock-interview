import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface CareerEmptyProps {
  onGenerate: () => void;
  isGenerating: boolean;
}

export const CareerEmpty: React.FC<CareerEmptyProps> = ({ onGenerate, isGenerating }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-sm relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="bg-gradient-to-tr from-blue-100 to-indigo-100 p-6 rounded-full mb-6 relative z-10"
      >
        <Sparkles className="w-12 h-12 text-blue-600" />
      </motion.div>

      <h2 className="text-2xl font-bold text-slate-900 mb-3 relative z-10">Welcome to Your AI Career Coach</h2>
      <p className="text-slate-600 mb-8 max-w-lg leading-relaxed relative z-10">
        We'll analyze your past interviews, resume, and skills to generate a personalized roadmap, career score, and actionable coaching insights.
      </p>
      
      <button 
        onClick={onGenerate}
        disabled={isGenerating}
        className="relative z-10 flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 px-8 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Analyzing Profile...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate Career Profile
          </>
        )}
      </button>
    </div>
  );
};
