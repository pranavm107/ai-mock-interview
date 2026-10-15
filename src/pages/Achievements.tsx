import React, { useState, useMemo } from 'react';
import { Trophy, AlertCircle, RefreshCcw } from 'lucide-react';
import { PageHeader } from '../components/dashboard/PageHeader';
import { AppBreadcrumb } from '../components/dashboard/AppBreadcrumb';
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
  }, [lockedAchievements]);

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
      <div className="pb-12 max-w-6xl mx-auto space-y-4 sm:space-y-5 animate-pulse">
        <AppBreadcrumb items={[
          { label: 'Progress' },
          { label: 'Achievements', path: '/achievements' }
        ]} />
        <PageHeader title="Achievements" description="Loading your milestones..." icon={Trophy} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>)}
        </div>
        <div className="h-36 bg-slate-200 rounded-xl mb-4"></div>
        <div className="h-9 bg-slate-200 rounded-lg mb-4 w-full max-w-md"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pb-12 max-w-6xl mx-auto space-y-4 sm:space-y-5">
        <AppBreadcrumb items={[
          { label: 'Progress' },
          { label: 'Achievements', path: '/achievements' }
        ]} />
        <PageHeader title="Achievements" description="Track your milestones" icon={Trophy} />
        <div className="bg-white rounded-xl border border-red-100 p-8 text-center flex flex-col items-center justify-center min-h-[260px]">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">Unable to load achievements</h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-4 max-w-sm">{error}</p>
          <Button onClick={() => refetch()} variant="outline" className="gap-2 rounded-lg h-8.5 px-4 text-xs" disabled={loading}>
            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} /> {loading ? "Retrying..." : "Retry"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12 max-w-6xl mx-auto space-y-4 sm:space-y-5">
      <AppBreadcrumb items={[
        { label: 'Progress' },
        { label: 'Achievements', path: '/achievements' }
      ]} />
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 mb-6">
              {/* Main Grid */}
              <div className="lg:col-span-2 space-y-5">
                <AchievementFilters 
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  categoryFilter={categoryFilter}
                  setCategoryFilter={setCategoryFilter}
                />

                {filteredAchievements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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
                  <div className="bg-slate-50 rounded-xl p-8 text-center border border-slate-100">
                    <p className="text-slate-500 mb-3 text-sm">No achievements match your current filters.</p>
                    <Button 
                      variant="outline" 
                      onClick={() => { setStatusFilter('ALL'); setCategoryFilter('ALL'); }}
                      className="rounded-lg text-xs"
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-5">
                <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-100 shadow-sm">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3">Almost There</h3>
                  {almostThere.length > 0 ? (
                    <div className="space-y-3">
                      {almostThere.map(achievement => {
                        const safeProgress = Math.max(0, Math.min(100, achievement.progressPercentage || 0));
                        return (
                          <div key={achievement.key} onClick={() => setSelectedAchievement(achievement)} className="cursor-pointer group">
                            <div className="flex justify-between text-xs sm:text-sm font-medium mb-1">
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
                    <p className="text-xs sm:text-sm text-slate-500">Start practicing to begin unlocking achievements.</p>
                  )}
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-100 shadow-sm">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3">Recently Unlocked</h3>
                  {recentlyUnlocked.length > 0 ? (
                    <div className="space-y-3">
                      {recentlyUnlocked.map(achievement => (
                        <div key={achievement.key} onClick={() => setSelectedAchievement(achievement)} className="flex items-center gap-2.5 cursor-pointer group">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-blue-100 transition-colors">
                            <Trophy size={15} />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{achievement.title}</p>
                            <p className="text-[11px] text-slate-500">
                              {new Date(achievement.unlockedAt!).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-xs sm:text-sm text-slate-500 mb-3">No achievements unlocked yet.</p>
                      <Button 
                        onClick={() => navigate('/generate')} 
                        variant="outline" 
                        size="sm"
                        className="w-full rounded-lg text-xs"
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
