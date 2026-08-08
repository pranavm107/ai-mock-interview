import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Target, Star, FileText, Lock, Check, Award, Badge, Medal, Briefcase } from 'lucide-react';
import type { AchievementWithProgress, AchievementRarity } from '../../types/achievement';

interface AchievementCardProps {
  achievement: AchievementWithProgress;
  onClick: (achievement: AchievementWithProgress) => void;
  index?: number;
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'trophy': return Trophy;
    case 'flame': return Flame;
    case 'target': return Target;
    case 'star': return Star;
    case 'file': return FileText;
    case 'award': return Award;
    case 'badge': return Badge;
    case 'medal': return Medal;
    case 'briefcase': return Briefcase;
    default: return Trophy;
  }
};

const getRarityColor = (rarity: AchievementRarity, unlocked: boolean) => {
  if (!unlocked) return 'text-slate-400 bg-slate-100 border-slate-200';
  switch (rarity) {
    case 'COMMON': return 'text-slate-600 bg-slate-100 border-slate-200';
    case 'RARE': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'EPIC': return 'text-purple-600 bg-purple-50 border-purple-200';
    case 'LEGENDARY': return 'text-amber-600 bg-amber-50 border-amber-200';
    default: return 'text-slate-600 bg-slate-100 border-slate-200';
  }
};

export const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, onClick, index = 0 }) => {
  const Icon = getIcon(achievement.icon);
  const remaining = Math.max(0, achievement.requirementValue - achievement.progress);
  const safeProgress = Math.max(0, Math.min(100, achievement.progressPercentage || 0));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onClick={() => onClick(achievement)}
      className={`relative p-5 rounded-2xl border cursor-pointer hover:shadow-md transition-all group ${
        achievement.unlocked ? 'bg-white border-slate-200 hover:border-slate-300' : 'bg-slate-50 border-slate-100 opacity-80 hover:opacity-100'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl border ${getRarityColor(achievement.rarity, achievement.unlocked)}`}>
          {achievement.unlocked ? <Icon size={24} /> : <Lock size={24} />}
        </div>
        <div className={`text-[10px] font-bold tracking-wider px-2 py-1 rounded border ${getRarityColor(achievement.rarity, achievement.unlocked)}`}>
          {achievement.rarity}
        </div>
      </div>

      <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">{achievement.title}</h3>
      <p className="text-xs text-slate-500 mb-4 h-8 line-clamp-2">{achievement.description}</p>

      {achievement.unlocked ? (
        <div className="flex items-center gap-1.5 text-green-600 font-medium text-xs bg-green-50 w-fit px-2 py-1 rounded border border-green-100">
          <Check size={14} />
          <span>{achievement.unlockedAt ? `Unlocked ${new Date(achievement.unlockedAt).toLocaleDateString()}` : 'Unlocked'}</span>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-medium text-slate-500">
            <span>{safeProgress}%</span>
            <span>{achievement.progress} / {achievement.requirementValue}</span>
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-slate-400 rounded-full transition-all duration-500" 
              style={{ width: `${safeProgress}%` }}
            />
          </div>
          {remaining > 0 && (
            <p className="text-[10px] text-slate-400 font-medium mt-1">{remaining} more to unlock</p>
          )}
        </div>
      )}
    </motion.div>
  );
};
