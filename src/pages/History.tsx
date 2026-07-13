import React, { useEffect, useState, useMemo } from 'react';
import { History as HistoryIcon, Clock, AlertCircle, TrendingUp, CheckCircle, Target, Activity, FileQuestion } from 'lucide-react';
import { PageHeader } from '../components/dashboard/PageHeader';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { useInterview } from '../hooks/useInterview';
import { InterviewList } from '../components/interview/InterviewList';
import { InterviewFilters } from '../components/interview/InterviewFilters';
import type { InterviewStatus, InterviewDifficulty, InterviewType } from '../types';
import { useNavigate } from 'react-router-dom';
import { generateInterviewSlug } from '../utils/slugHelper';
import { StatCard } from '../components/dashboard/StatCard';
import { Button } from '@/components/ui/button';

const History: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { 
    interviews, 
    loading, 
    error, 
    refreshInterviews, 
    deleteInterview 
  } = useInterview();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InterviewStatus | 'All'>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<InterviewDifficulty | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<InterviewType | 'All'>('All');

  useEffect(() => {
    if (user?.id) {
      refreshInterviews(user.id);
    }
  }, [user?.id, refreshInterviews]);

  const filteredInterviews = useMemo(() => {
    return interviews.filter(interview => {
      const matchesSearch = 
        interview.role.toLowerCase().includes(searchQuery.toLowerCase()) || 
        interview.company.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || interview.status === statusFilter;
      const matchesDifficulty = difficultyFilter === 'All' || interview.difficulty === difficultyFilter;
      const matchesType = typeFilter === 'All' || interview.interviewType === typeFilter;
      
      return matchesSearch && matchesStatus && matchesDifficulty && matchesType;
    });
  }, [interviews, searchQuery, statusFilter, difficultyFilter, typeFilter]);

  // Dashboard Stats calculation
  const stats = useMemo(() => {
    const total = interviews.length;
    const completed = interviews.filter(i => i.status === 'Completed').length;
    const inProgress = interviews.filter(i => i.status === 'In Progress').length;
    
    const completedWithScore = interviews.filter(i => i.status === 'Completed' && i.score !== null);
    
    const avgScore = completedWithScore.length > 0 
      ? `${Math.round(completedWithScore.reduce((acc, curr) => acc + (curr.score || 0), 0) / completedWithScore.length)}%`
      : '—';

    const completedWithDuration = interviews.filter(i => i.status === 'Completed' && i.duration);
    const avgDuration = completedWithDuration.length > 0 
      ? `${Math.round(completedWithDuration.reduce((acc, curr) => acc + curr.duration, 0) / completedWithDuration.length)}m`
      : '—';

    return { total, completed, inProgress, avgScore, avgDuration };
  }, [interviews]);

  const handleDelete = async (id: string) => {
    if (user?.id) {
      await deleteInterview(user.id, id);
    }
  };

  const handleNavigation = (id: string) => {
    const interview = interviews.find(i => i.id === id);
    if (interview) {
      const slug = generateInterviewSlug(interview);
      navigate(`/interview/${slug}`);
    }
  };

  return (
    <div className="pb-24 space-y-8">
      <PageHeader 
        title="Interview History" 
        description="Review past sessions, resume incomplete ones, and track your performance across different roles."
        icon={HistoryIcon}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {!loading && interviews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
             <StatCard title="Total" value={stats.total.toString()} icon={Target} delay={0.1} />
             <StatCard title="Completed" value={stats.completed.toString()} icon={CheckCircle} delay={0.2} />
             <StatCard title="In Progress" value={stats.inProgress.toString()} icon={Activity} delay={0.3} />
             <StatCard 
               title="Avg Score" 
               value={stats.avgScore} 
               icon={TrendingUp} 
               delay={0.4} 
               description={stats.avgScore === '—' ? 'No completed interviews' : undefined}
             />
             <StatCard 
               title="Avg Duration" 
               value={stats.avgDuration} 
               icon={Clock} 
               delay={0.5} 
               description={stats.avgDuration === '—' ? 'No completed interviews' : undefined}
             />
          </div>
        )}

        {!loading && interviews.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-white rounded-3xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[400px] shadow-sm relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl -z-10 pointer-events-none"></div>
            
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-blue-200/50">
              <FileQuestion size={40} className="text-blue-600" />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 tracking-tight">No Interviews Yet</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-8 text-base md:text-lg">
              Create your first AI-powered mock interview to begin practicing for your dream role.
            </p>
            
            <Button 
              onClick={() => navigate('/generate')}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-14 px-8 font-semibold text-base shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Generate Interview
            </Button>
          </motion.div>
        ) : (
          <>
            <InterviewFilters 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              difficultyFilter={difficultyFilter}
              onDifficultyChange={setDifficultyFilter}
              typeFilter={typeFilter}
              onTypeChange={setTypeFilter}
            />
            
            <InterviewList 
              interviews={filteredInterviews}
              loading={loading}
              onDelete={handleDelete}
              onContinue={handleNavigation}
              onView={handleNavigation}
            />
          </>
        )}
      </motion.div>
    </div>
  );
};

export default History;
