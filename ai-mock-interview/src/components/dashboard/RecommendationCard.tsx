import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const RecommendationCard: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-indigo-50 border border-indigo-100 rounded-[20px] p-6 sm:p-8 text-slate-900 relative overflow-hidden shadow-sm"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-200/30 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3"></div>
      
      <div className="relative z-10 flex flex-col h-full justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-slate-900">Today's AI Recommendation</h2>
          </div>
          
          <ul className="space-y-3 mb-6">
            {[
              "Improve your STAR method structuring.",
              "Practice System Design concepts.",
              "Behavioral Interview strongly recommended."
            ].map((item, index) => (
              <motion.li 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-start gap-3"
              >
                <CheckCircle2 className="text-blue-500 shrink-0 mt-0.5" size={18} />
                <span className="text-sm sm:text-base text-slate-700 font-medium">{item}</span>
              </motion.li>
            ))}
          </ul>
        </div>
        
        <Link to="/generate" className="w-full">
          <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 font-semibold rounded-xl h-12 flex items-center justify-center gap-2 group transition-all shadow-sm">
            Generate Suggested Interview
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};
