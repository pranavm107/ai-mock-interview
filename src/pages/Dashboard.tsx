import React, { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  FileText, 
  Star,
  Sparkles,
  History,
  BrainCircuit,
  Upload,
  BarChart3,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Import all components
import { StatCard } from '../components/dashboard/StatCard';
import { QuickActionCard } from '../components/dashboard/QuickActionCard';
import { RecommendationCard } from '../components/dashboard/RecommendationCard';
import { AnalyticsCard } from '../components/dashboard/AnalyticsCard';
import { AchievementCard } from '../components/dashboard/AchievementCard';
import { AIAssistantWidget } from '../components/dashboard/AIAssistantWidget';
import { GettingStartedChecklist } from '../components/dashboard/GettingStartedChecklist';
import { ContinueLearningCard } from '../components/dashboard/ContinueLearningCard';
import { RecommendedInterviewCard } from '../components/dashboard/RecommendedInterviewCard';
import { InterviewCategoriesList } from '../components/dashboard/InterviewCategoriesList';

import { DashboardState } from '../hooks/useDashboardState';
import { useAppStore } from '../store/useAppStore';

const NewUserDashboard = ({ metadata }: { metadata?: any }) => (
  <motion.div 
    key="new-user"
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    className="space-y-5 sm:space-y-6"
  >
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
      <div className="lg:col-span-2">
        <GettingStartedChecklist metadata={metadata} />
      </div>
      <div>
        <RecommendationCard recommendations={metadata?.recommendations} />
      </div>
    </div>

    <InterviewCategoriesList />

    <div>
      <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <QuickActionCard title="Generate" description="Start a mock interview" icon={Sparkles} to="/generate" colorClass="bg-blue-50 text-blue-600" />
        <QuickActionCard title="Resume" description="Manage your resumes" icon={FileText} to="/resume" colorClass="bg-indigo-50 text-indigo-600" />
        <QuickActionCard title="History" description="Review past sessions" icon={History} to="/history" colorClass="bg-purple-50 text-purple-600" />
        <QuickActionCard title="AI Coach" description="Get career advice" icon={BrainCircuit} to="/profile" colorClass="bg-amber-50 text-amber-600" />
        <QuickActionCard title="Analytics" description="View performance" icon={BarChart3} to="/analytics" colorClass="bg-emerald-50 text-emerald-600" />
      </div>
    </div>
  </motion.div>
);

const ReturningUserDashboard = ({ metadata }: { metadata?: any }) => {
  const stats = metadata?.stats || { averageScore: 0, totalResumes: 0, completedInterviews: 0, currentStreak: 0 };
  const avgScoreStr = stats.completedInterviews > 0 ? `${stats.averageScore}%` : '—';
  
  const hasActiveInterview = metadata?.activeInterview;
  const continueId = metadata?.latestDraftInterviewId;
  
  return (
  <motion.div 
    key="returning-user"
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    className="space-y-5 sm:space-y-6"
  >
    {/* Continue Learning Section */}
    <ContinueLearningCard metadata={metadata} />

    {/* Stats Grid */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <StatCard title="Overall Score" value={avgScoreStr} icon={Trophy} delay={0.05} />
      <StatCard title="Resume Uploaded" value={`${stats.totalResumes} Active`} icon={FileText} delay={0.1} />
      <StatCard title="Interviews Completed" value={`${stats.completedInterviews}`} icon={Target} delay={0.15} />
      <StatCard title="Current Streak" value={`${stats.currentStreak} Days`} icon={Star} delay={0.2} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
      <div className="lg:col-span-2 space-y-5 sm:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <RecommendedInterviewCard recentInterviews={metadata?.recentInterviews} />
          <RecommendationCard recommendations={metadata?.recommendations} />
        </div>
        <AnalyticsCard performanceData={metadata?.performanceData} trend={stats.scoreTrend} />
      </div>
      
      <div className="space-y-5 sm:space-y-6">
        <AchievementCard achievements={metadata?.achievements} stats={stats} />
        
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-5">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-2.5">
            {hasActiveInterview && continueId ? (
              <QuickActionCard title="Continue Interview" description="Resume your session" icon={Play} to={`/session/${continueId}`} colorClass="bg-emerald-50 text-emerald-600" />
            ) : (
              <QuickActionCard title="Generate Interview" description="Custom role & skills" icon={Sparkles} to="/generate" colorClass="bg-blue-50 text-blue-600" />
            )}
            <QuickActionCard title="Mock Coding" description="Technical practice" icon={BrainCircuit} to="/coding" colorClass="bg-indigo-50 text-indigo-600" />
            <QuickActionCard title="Interview History" description="Review feedback" icon={History} to="/history" colorClass="bg-purple-50 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  </motion.div>
  );
};

// Fallbacks mapping to existing views until they get their own UI
// Fallbacks mapping to existing views until they get their own UI
const ResumeUploadedDashboard = ({ metadata }: { metadata?: any }) => <NewUserDashboard metadata={metadata} />;
const ReadyForInterviewDashboard = ({ metadata }: { metadata?: any }) => <NewUserDashboard metadata={metadata} />;
const InterviewInProgressDashboard = ({ metadata }: { metadata?: any }) => <ReturningUserDashboard metadata={metadata} />;
const PowerUserDashboard = ({ metadata }: { metadata?: any }) => <ReturningUserDashboard metadata={metadata} />;

const Dashboard: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { dashboardData, loading, fetchDashboardData } = useAppStore();
  const dashboardState = dashboardData?.dashboardState;
  const isCompleted = dashboardData?.metadata?.onboardingProgress?.isCompleted;

  useEffect(() => {
    if (isLoaded && user?.id) {
      fetchDashboardData(user.id);
    }
  }, [isLoaded, user?.id, fetchDashboardData]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Determine which actions header to show based on state (since old code had this based on isNewUser)
  const isNewish = !isCompleted;

  const renderDashboardContent = () => {
    if (isCompleted) {
      return (
        <div className="space-y-5 sm:space-y-6">
          {dashboardState === DashboardState.POWER_USER && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-4 sm:p-5 text-white shadow-xs flex items-center justify-between"
            >
              <div>
                <h2 className="text-base sm:text-lg font-bold mb-0.5">🎉 You're all set!</h2>
                <p className="text-xs sm:text-sm text-emerald-100">Your onboarding is complete. Continue improving your interview performance.</p>
              </div>
              <div className="hidden md:flex bg-white/20 p-2.5 rounded-lg backdrop-blur-xs">
                <Trophy className="text-white w-6 h-6" />
              </div>
            </motion.div>
          )}
          <ReturningUserDashboard metadata={dashboardData?.metadata} />
        </div>
      );
    }
    
    return <NewUserDashboard metadata={dashboardData?.metadata} />;
  };

  return (
    <motion.div 
      className="space-y-5 sm:space-y-6 pb-20"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Personalized Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4 sm:mb-5">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-0.5"
          >
            Welcome Back, {user?.firstName || 'User'}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 text-xs sm:text-sm"
          >
            Let's continue preparing for your dream job.
          </motion.p>
        </div>
        
        {isNewish && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2"
          >
            <Link to="/resume">
              <Button variant="outline" className="bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-2xs rounded-lg px-3.5 h-8 sm:h-8.5 text-xs font-semibold flex items-center gap-1.5">
                <Upload size={14} />
                Upload Resume
              </Button>
            </Link>
            <Link to="/generate">
              <Button className="bg-blue-600 text-white hover:bg-blue-700 shadow-2xs rounded-lg px-3.5 h-8 sm:h-8.5 text-xs font-semibold flex items-center gap-1.5">
                <Sparkles size={14} />
                Generate Interview
              </Button>
            </Link>
          </motion.div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {renderDashboardContent()}
      </AnimatePresence>

      <AIAssistantWidget />
    </motion.div>
  );
};

export default Dashboard;
