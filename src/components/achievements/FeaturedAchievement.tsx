import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';
import type { AchievementWithProgress } from '../../types/achievement';
import { Button } from '@/components/ui/button';
import { getAchievementAction } from '../../utils/achievementNavigation';

interface FeaturedAchievementProps {
  achievement: AchievementWithProgress | null;
}

export const FeaturedAchievement: React.FC<FeaturedAchievementProps> = ({ achievement }) => {
  const navigate = useNavigate();

  if (!achievement) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8 p-[1px] rounded-3xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-sm"
      >
        <div className="bg-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex-1 space-y-2 relative z-10 w-full text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Incredible Work!</h2>
            <p className="text-slate-500 text-sm md:text-base">You've unlocked every available achievement. Keep practicing to stay sharp!</p>
          </div>
          <div className="w-full md:w-auto flex-shrink-0 relative z-10">
            <Button 
              onClick={() => navigate('/generate')}
              className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white rounded-xl h-12 px-6 font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2"
            >
              <Play size={18} />
              Continue Practice
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  const remaining = Math.max(0, achievement.requirementValue - achievement.progress);
  const safeProgress = Math.max(0, Math.min(100, achievement.progressPercentage || 0));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="mb-8 p-[1px] rounded-3xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-sm"
    >
      <div className="bg-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Background decors */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="flex-1 space-y-4 relative z-10 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold tracking-wide uppercase mb-2">
            Next Achievement
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{achievement.title}</h2>
          <p className="text-slate-500 text-sm md:text-base">{achievement.description}</p>
          
          <div className="pt-4">
            <div className="flex justify-between text-sm font-medium mb-2">
              <span className="text-slate-700">{achievement.progress} / {achievement.requirementValue}</span>
              <span className="text-blue-600">{safeProgress}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${safeProgress}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
              />
            </div>
            {!achievement.unlocked && remaining > 0 && (
              <p className="text-xs text-slate-500 mt-2 font-medium">
                {remaining} more to unlock
              </p>
            )}
          </div>
        </div>

        <div className="w-full md:w-auto flex-shrink-0 relative z-10">
          {(() => {
            const action = getAchievementAction(achievement);
            if (!action) return null;
            return (
              <Button 
                onClick={() => navigate(action.route)}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-6 font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2"
              >
                <Play size={18} />
                {action.label}
              </Button>
            );
          })()}
        </div>
      </div>
    </motion.div>
  );
};
