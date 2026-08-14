import React from 'react';
import { motion } from 'framer-motion';
import { Award, Star, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const AchievementCard: React.FC<{ achievements?: any[], stats?: any }> = ({ achievements = [], stats = {} }) => {
  const topBadges = achievements.slice(0, 4);
  const currentStreak = stats.currentStreak || 0;
  const streakProgress = currentStreak > 0 ? ((currentStreak % 7) / 7) * 100 : 0;
  const daysToNextStreak = 7 - (currentStreak % 7);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-white border border-slate-200 rounded-[20px] p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <h2 className="text-lg font-bold text-slate-900 mb-6">Achievements & Goals</h2>
      
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-50 text-amber-500 rounded-lg">
                <Star size={16} />
              </div>
              <span className="font-semibold text-sm text-slate-700">Weekly Streak</span>
            </div>
            <span className="text-sm font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">{currentStreak} Days</span>
          </div>
          <Progress value={streakProgress} className="h-2 bg-slate-100" />
          <p className="text-xs text-slate-500 mt-2 font-medium">Practice {daysToNextStreak} more days to maintain your streak.</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {topBadges.length > 0 ? topBadges.map((badge: any, index: number) => (
            badge.unlocked ? (
              <motion.div 
                key={badge.id || index}
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 flex flex-col items-center text-center justify-center cursor-pointer shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 text-indigo-600">
                  <Target size={20} />
                </div>
                <h4 className="text-sm font-bold text-slate-900">{badge.title}</h4>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mt-1">Unlocked</span>
              </motion.div>
            ) : (
              <div key={badge.id || index} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center justify-center opacity-80 grayscale">
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2">
                  <Award size={20} className="text-slate-400" />
                </div>
                <h4 className="text-sm font-bold text-slate-600">{badge.title}</h4>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                  {badge.progress !== undefined && badge.max !== undefined ? `${badge.progress}/${badge.max}` : 'Locked'}
                </span>
              </div>
            )
          )) : (
            <div className="col-span-2 text-center text-slate-500 text-sm py-4">
              Complete interviews to unlock achievements!
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
