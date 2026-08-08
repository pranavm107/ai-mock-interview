import React from 'react';
import { Target, Trophy, Lock, TrendingUp } from 'lucide-react';
import { StatCard } from '../dashboard/StatCard';
import type { AchievementSummary } from '../../types/achievement';

interface AchievementSummaryProps {
  summary: AchievementSummary;
}

export const AchievementSummaryStats: React.FC<AchievementSummaryProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <StatCard 
        title="Total Achievements" 
        value={summary.total.toString()} 
        icon={Target} 
        delay={0.1} 
      />
      <StatCard 
        title="Unlocked" 
        value={summary.unlocked.toString()} 
        icon={Trophy} 
        delay={0.2} 
      />
      <StatCard 
        title="Locked" 
        value={summary.locked.toString()} 
        icon={Lock} 
        delay={0.3} 
      />
      <StatCard 
        title="Completion" 
        value={`${summary.completionPercentage}%`} 
        icon={TrendingUp} 
        delay={0.4} 
      />
    </div>
  );
};
