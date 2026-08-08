import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock, Target, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export const RecommendedInterviewCard: React.FC<{ recentInterviews?: any[] }> = ({ recentInterviews = [] }) => {
  const unfinished = recentInterviews.find(i => {
    const state = i.state || i.status;
    return state !== 'COMPLETED' && state !== 'Completed';
  });
  
  if (!unfinished) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[20px] shadow-sm border border-slate-200 p-6 flex flex-col justify-between h-full group hover:shadow-md transition-shadow"
      >
        <div>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg text-sm font-semibold border border-indigo-100">
              <Sparkles size={16} />
              <span>Next Steps</span>
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">Start a New Interview</h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            You don't have any pending interviews. Generate a new AI-powered mock interview to continue your practice.
          </p>
        </div>
        
        <div className="space-y-4 mt-auto">
          <Link to="/generate" className="w-full block">
            <Button className="w-full bg-slate-900 text-white hover:bg-slate-800 shadow-sm rounded-xl h-11 font-semibold flex items-center gap-2">
              <Play size={16} />
              Generate Interview
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[20px] shadow-sm border border-slate-200 p-6 flex flex-col justify-between h-full group hover:shadow-md transition-shadow"
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg text-sm font-semibold border border-indigo-100">
            <Sparkles size={16} />
            <span>AI Recommended</span>
          </div>
          <Badge variant="secondary" className="bg-amber-50 text-amber-600 border border-amber-200/50">
            Medium
          </Badge>
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{unfinished.role || 'Mock Interview'}</h3>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Resume your unfinished session for {unfinished.company || 'your dream role'}.
        </p>
      </div>
      
      <div className="space-y-4 mt-auto">
        <div className="flex items-center gap-4 text-sm font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5">
            <Clock size={16} className="text-slate-400" />
            <span>{unfinished.duration || 45} Mins</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Target size={16} className="text-slate-400" />
            <span>{unfinished.type || 'Technical'}</span>
          </div>
        </div>
        
        <Link to={`/session/${unfinished.id}`} className="w-full block">
          <Button className="w-full bg-slate-900 text-white hover:bg-slate-800 shadow-sm rounded-xl h-11 font-semibold flex items-center gap-2">
            <Play size={16} />
            Resume Session
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};
