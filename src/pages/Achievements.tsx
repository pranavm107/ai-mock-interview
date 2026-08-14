import React, { useState, useMemo } from 'react';
import { Trophy, AlertCircle, RefreshCcw } from 'lucide-react';
import { PageHeader } from '../components/dashboard/PageHeader';
import { EmptyState } from '../components/dashboard/EmptyState';
import { motion } from 'framer-motion';
import { useAchievements } from '../hooks/useAchievements';
import { AchievementSummaryStats } from '../components/achievements/AchievementSummary';
import { FeaturedAchievement } from '../components/achievements/FeaturedAchievement';
import { AchievementFilters } from '../components/achievements/AchievementFilters';
import type { FilterStatus, FilterCategory } from '../components/achievements/AchievementFilters';
import { AchievementCard } from '../components/achievements/AchievementCard';
import { AchievementModal } from '../components/achievements/AchievementModal';
import { Button } from '@/components/ui/button';
import type { AchievementWithProgress } from '../types/achievement';
import { useNavigate } from 'react-router-dom';

const Achievements: React.FC = () => {
  const navigate = useNavigate();
  const { summary, achievements, loading, error, refetch } = useAchievements();
  
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('ALL');
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementWithProgress | null>(null);

  // Derived arrays
  const lockedAchievements = useMemo(() => achievements.filter(a => !a.unlocked), [achievements]);
  const unlockedAchievements = useMemo(() => achievements.filter(a => a.unlocked), [achievements]);

  const featuredAchievement = useMemo(() => {
    if (lockedAchievements.length === 0) return null;
    
    return [...lockedAchievements].sort((a, b) => {
      if (b.progressPercentage !== a.progressPercentage) {
        return b.progressPercentage - a.progressPercentage;
      }
      const aRemaining = Math.max(0, a.requirementValue - a.progress);
      const bRemaining = Math.max(0, b.requirementValue - b.progress);
      return aRemaining - bRemaining;
    })[0];
  }, [lockedAchievements, unlockedAchievements]);

  const recentlyUnlocked = useMemo(() => {
    return [...unlockedAchievements]
      .filter(a => a.unlockedAt)
      .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
      .slice(0, 3);
  }, [unlockedAchievements]);

  const almostThere = useMemo(() => {
    return [...lockedAchievements]
      .filter(a => a.progress > 0)
      .sort((a, b) => b.progressPercentage - a.progressPercentage)
      .slice(0, 3);
  }, [lockedAchievements]);

  const filteredAchievements = useMemo(() => {
    return achievements.filter(a => {
      const matchesStatus = 
        statusFilter === 'ALL' || 
        (statusFilter === 'UNLOCKED' && a.unlocked) || 
        (statusFilter === 'LOCKED' && !a.unlocked);
      
      const matchesCategory = 
        categoryFilter === 'ALL' || 
        a.category === categoryFilter;

      return matchesStatus && matchesCategory;
    });
  }, [achievements, statusFilter, categoryFilter]);

  if (loading) {
    return (
      <div className="pb-24 space-y-8 animate-pulse">
        <PageHeader title="Achievements" description="Loading your milestones..." icon={Trophy} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-[20px]"></div>)}
        </div>
        <div className="h-48 bg-slate-200 rounded-3xl mb-8"></div>
        <div className="h-12 bg-slate-200 rounded-xl mb-6 w-full max-w-md"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-40 bg-slate-200 rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pb-24 space-y-8">
        <PageHeader title="Achievements" description="Track your milestones" icon={Trophy} />
        <div className="bg-white rounded-3xl border border-red-100 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Unable to load achievements</h2>
          <p className="text-slate-500 mb-8 max-w-sm">{error}</p>
          <Button onClick={() => refetch()} variant="outline" className="gap-2 rounded-xl" disabled={loading}>
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} /> {loading ? "Retrying..." : "Retry"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 space-y-8">
      <PageHeader 
        title="Achievements" 
        description="Track your milestones, unlock achievements, and see your interview preparation progress."
        icon={Trophy}
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {summary && <AchievementSummaryStats summary={summary} />}

        {achievements.length > 0 ? (
          <>
            <FeaturedAchievement achievement={featuredAchievement} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Main Grid */}
              <div className="lg:col-span-2 space-y-6">
                <AchievementFilters 
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  categoryFilter={categoryFilter}
                  setCategoryFilter={setCategoryFilter}
                />

                {filteredAchievements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredAchievements.map((achievement, i) => (
                      <AchievementCard 
                        key={achievement.key} 
                        achievement={achievement} 
                        onClick={setSelectedAchievement}
                        index={i}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl p-12 text-center border border-slate-100">
                    <p className="text-slate-500 mb-4">No achievements match your current filters.</p>
                    <Button 
                      variant="outline" 
                      onClick={() => { setStatusFilter('ALL'); setCategoryFilter('ALL'); }}
                      className="rounded-xl"
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Almost There</h3>
                  {almostThere.length > 0 ? (
                    <div className="space-y-4">
                      {almostThere.map(achievement => {
                        const safeProgress = Math.max(0, Math.min(100, achievement.progressPercentage || 0));
                        return (
                          <div key={achievement.key} onClick={() => setSelectedAchievement(achievement)} className="cursor-pointer group">
                            <div className="flex justify-between text-sm font-medium mb-1">
                              <span className="text-slate-700 group-hover:text-blue-600 transition-colors">{achievement.title}</span>
                              <span className="text-slate-500">{safeProgress}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full" 
                                style={{ width: `${safeProgress}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Start practicing to begin unlocking achievements.</p>
                  )}
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Recently Unlocked</h3>
                  {recentlyUnlocked.length > 0 ? (
                    <div className="space-y-4">
                      {recentlyUnlocked.map(achievement => (
                        <div key={achievement.key} onClick={() => setSelectedAchievement(achievement)} className="flex items-center gap-3 cursor-pointer group">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-blue-100 transition-colors">
                            <Trophy size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{achievement.title}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(achievement.unlockedAt!).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-slate-500 mb-4">No achievements unlocked yet.</p>
                      <Button 
                        onClick={() => navigate('/generate')} 
                        variant="outline" 
                        size="sm"
                        className="w-full rounded-xl"
                      >
                        Start Practicing
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <EmptyState 
            title="No achievements yet"
            description="Your achievements will appear here as you complete interviews and reach milestones."
            icon={Trophy}
            actionLabel="Start Your First Interview"
            actionTo="/generate"
          />
        )}
      </motion.div>

      <AchievementModal 
        achievement={selectedAchievement} 
        isOpen={!!selectedAchievement} 
        onClose={() => setSelectedAchievement(null)} 
      />
    </div>
  );
};

export default Achievements;
