import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';

import type { DashboardData } from '../../store/useAppStore';

interface ContinueLearningCardProps {
  metadata?: DashboardData['metadata'];
}

export const ContinueLearningCard: React.FC<ContinueLearningCardProps> = ({ metadata }) => {
  const latestInterview = metadata?.recentInterviews?.[0];
  const activeResume = metadata?.activeResume;
  const state = latestInterview.state || latestInterview.status;
  
  // Only show this card if there's an active/draft interview, otherwise hide or show something else
  if (!latestInterview || (state !== 'IN_PROGRESS' && state !== 'In Progress' && state !== 'Draft' && state !== 'DRAFT')) {
    return null;
  }

  const roleTitle = latestInterview.role || 'Mock Interview';
  const resumeFilename = activeResume?.filename || 'No Resume Attached';
  
  // Optionally calculate progress if currentQuestion and totalQuestions exist in the document
  const currentQ = latestInterview.currentQuestion || 1;
  const totalQ = latestInterview.totalQuestions || 10;
  const progressPercent = Math.round((currentQ / totalQ) * 100);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-sm p-4 sm:p-5 text-white relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 text-xs font-semibold mb-3 text-blue-50">
            <Clock size={13} />
            <span>In Progress</span>
          </div>
          
          <h2 className="text-xl font-bold mb-1">{roleTitle}</h2>
          <div className="flex items-center gap-2 text-blue-100 text-xs sm:text-sm mb-4">
            <FileText size={15} />
            <span>{resumeFilename}</span>
          </div>
          
          <div className="max-w-md w-full">
            <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-1.5">
              <span className="text-blue-50">Question {currentQ} of {totalQ}</span>
              <span>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-1.5 bg-black/20" />
            <p className="text-[11px] text-blue-100 mt-1 font-medium">Keep going!</p>
          </div>
        </div>
        
        <div className="shrink-0 w-full md:w-auto">
          <Link to={`/session/${latestInterview.id}`}>
            <Button className="w-full bg-white text-blue-700 hover:bg-slate-50 shadow-md px-5 h-9 sm:h-10 text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-2 transition-transform hover:scale-[1.02]">
              <PlayCircle size={17} />
              Continue Interview
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
