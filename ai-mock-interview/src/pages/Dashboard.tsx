import React, { useState } from 'react';
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
  BarChart3
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

const Dashboard: React.FC = () => {
  const { user } = useUser();
  // Mock logic to determine if the user is new or returning.
  // In a real app, this would be based on backend data (e.g., interviews.length > 0)
  const [isNewUser, setIsNewUser] = useState(true);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      className="space-y-8 pb-24"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Dev Toggle (Remove in production) */}
      <div className="flex justify-end mb-4">
        <button 
          onClick={() => setIsNewUser(!isNewUser)}
          className="text-xs font-mono bg-slate-200 text-slate-700 px-3 py-1 rounded-full shadow-sm hover:bg-slate-300 transition-colors"
        >
          Toggle View (Currently: {isNewUser ? 'New User' : 'Returning User'})
        </button>
      </div>

      {/* Personalized Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2"
          >
            Welcome Back, {user?.firstName || 'User'}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 text-base sm:text-lg"
          >
            Let's continue preparing for your dream job.
          </motion.p>
        </div>
        
        {isNewUser && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-3"
          >
            <Link to="/resume">
              <Button variant="outline" className="bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-sm rounded-xl px-5 h-11 font-semibold flex items-center gap-2">
                <Upload size={18} />
                Upload Resume
              </Button>
            </Link>
            <Link to="/generate">
              <Button className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm rounded-xl px-5 h-11 font-semibold flex items-center gap-2">
                <Sparkles size={18} />
                Generate Interview
              </Button>
            </Link>
          </motion.div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isNewUser ? (
          /* =========================================
             NEW USER VIEW
             ========================================= */
          <motion.div 
            key="new-user"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <GettingStartedChecklist />
              </div>
              <div className="space-y-8">
                <RecommendationCard />
              </div>
            </div>

            <InterviewCategoriesList />

            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <QuickActionCard title="Generate" description="Start a mock interview" icon={Sparkles} to="/generate" colorClass="bg-blue-50 text-blue-600" />
                <QuickActionCard title="Resume" description="Manage your resumes" icon={FileText} to="/resume" colorClass="bg-indigo-50 text-indigo-600" />
                <QuickActionCard title="History" description="Review past sessions" icon={History} to="/history" colorClass="bg-purple-50 text-purple-600" />
                <QuickActionCard title="AI Coach" description="Get career advice" icon={BrainCircuit} to="/profile" colorClass="bg-amber-50 text-amber-600" />
                <QuickActionCard title="Analytics" description="View performance" icon={BarChart3} to="/analytics" colorClass="bg-emerald-50 text-emerald-600" />
              </div>
            </div>
          </motion.div>
        ) : (
          /* =========================================
             RETURNING USER VIEW
             ========================================= */
          <motion.div 
            key="returning-user"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Continue Learning Section */}
            <ContinueLearningCard />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <StatCard title="Overall Score" value="92%" icon={Trophy} trend={{ value: '4%', isPositive: true }} delay={0.1} />
              <StatCard title="Resume Uploaded" value="1 Active" icon={FileText} delay={0.2} />
              <StatCard title="Interviews Completed" value="18" icon={Target} trend={{ value: '2', isPositive: true }} delay={0.3} />
              <StatCard title="Current Streak" value="3 Days" icon={Star} trend={{ value: '1', isPositive: true }} delay={0.4} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <RecommendedInterviewCard />
                  <RecommendationCard />
                </div>
                <AnalyticsCard />
              </div>
              
              <div className="space-y-8">
                <AchievementCard />
                
                <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <QuickActionCard title="Generate Interview" description="Custom role & skills" icon={Sparkles} to="/generate" colorClass="bg-blue-50 text-blue-600" />
                    <QuickActionCard title="Mock Coding" description="Technical practice" icon={BrainCircuit} to="/generate" colorClass="bg-indigo-50 text-indigo-600" />
                    <QuickActionCard title="Interview History" description="Review feedback" icon={History} to="/history" colorClass="bg-purple-50 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AIAssistantWidget />
    </motion.div>
  );
};

export default Dashboard;
