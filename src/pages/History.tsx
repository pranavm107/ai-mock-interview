import React, { useEffect, useState, useMemo } from 'react';
import { History as HistoryIcon, Clock, AlertCircle, TrendingUp, CheckCircle, Target, Activity, FileQuestion } from 'lucide-react';
import { PageHeader } from '../components/dashboard/PageHeader';
import { AppBreadcrumb } from '../components/dashboard/AppBreadcrumb';
import { motion } from 'framer-motion';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useInterviewHistory } from '../hooks/useInterviewHistory';
import { API_BASE_URL } from '../config/api';
import { InterviewList } from '../components/interview/InterviewList';
import { InterviewFilters } from '../components/interview/InterviewFilters';
import type { InterviewStatus, InterviewDifficulty, InterviewType } from '../types';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../components/dashboard/StatCard';
import { Button } from '@/components/ui/button';

const History: React.FC = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const { 
    sessions: interviews, 
    loading, 
    error, 
    fetchUserSessions: refreshInterviews, 
    deleteSession: deleteInterview 
  } = useInterviewHistory();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InterviewStatus | 'All'>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<InterviewDifficulty | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<InterviewType | 'All'>('All');
  const [sortFilter, setSortFilter] = useState<string>('Newest');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    if (user?.id) {
      refreshInterviews(user.id);
    }
  }, [user?.id, refreshInterviews]);

  const filteredInterviews = useMemo(() => {
    const result = interviews.filter(interview => {
      const matchesSearch = 
        interview.role.toLowerCase().includes(searchQuery.toLowerCase()) || 
        interview.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (interview.resumeName && interview.resumeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        interview.interviewType.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || 
        (statusFilter === 'Completed' && interview.status === 'Completed') ||
        (statusFilter === 'In Progress' && interview.status === 'In Progress') ||
        (statusFilter === 'Draft' && (interview.status === 'Draft' || interview.status === 'Ready'));
      
      const matchesDifficulty = difficultyFilter === 'All' || interview.difficulty === difficultyFilter;
      const matchesType = typeFilter === 'All' || interview.interviewType === typeFilter;
      
      return matchesSearch && matchesStatus && matchesDifficulty && matchesType;
    });
    
    // Sort logic
    result.sort((a, b) => {
      if (sortFilter === 'Oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortFilter === 'Highest Score') return (b.score || 0) - (a.score || 0);
      if (sortFilter === 'Lowest Score') return (a.score || 0) - (b.score || 0);
      if (sortFilter === 'Longest Duration') return (b.duration || 0) - (a.duration || 0);
      if (sortFilter === 'Shortest Duration') return (a.duration || 0) - (b.duration || 0);
      if (sortFilter === 'Most Recent Activity') return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
      
      // Default: Newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Reset to page 1 on filter change
    setCurrentPage(1);
    
    return result;
  }, [interviews, searchQuery, statusFilter, difficultyFilter, typeFilter, sortFilter]);

  const paginatedInterviews = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredInterviews.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredInterviews, currentPage]);

  // Dashboard Stats calculation (dynamically calculated for instantaneous UI updates)
  const stats = useMemo(() => {
    const total = interviews.length;
    const completed = interviews.filter(i => i.status === 'Completed').length;
    const inProgress = interviews.filter(i => i.status === 'In Progress').length;
    
    const completedWithScore = interviews.filter(i => i.status === 'Completed' && i.score !== null && i.score !== undefined);
    
    const avgScore = completedWithScore.length > 0 
      ? `${Math.round(completedWithScore.reduce((acc, curr) => acc + (curr.score || 0), 0) / completedWithScore.length)}%`
      : '—';

    const completedWithDuration = interviews.filter(i => i.status === 'Completed' && i.duration);
    const avgDuration = completedWithDuration.length > 0 
      ? `${Math.round(completedWithDuration.reduce((acc, curr) => acc + (curr.duration || 0), 0) / completedWithDuration.length)}m`
      : '—';

    return { total, completed, inProgress, avgScore, avgDuration };
  }, [interviews]);
  const handleDelete = async (id: string) => {
    if (user?.id) {
      await deleteInterview(id);
    }
  };

  const handleNavigation = (id: string) => {
    const interview = interviews.find(i => i.id === id);
    if (interview) {
      if (interview.status === 'Completed') {
        navigate(`/report/${interview.id}`);
      } else {
        navigate(`/session/${interview.id}`);
      }
    }
  };

  return (
    <div className="pb-20 space-y-5 sm:space-y-6">
      <AppBreadcrumb items={[
        { label: 'Progress' },
        { label: 'History', path: '/history' }
      ]} />
      <PageHeader 
        title="Interview History" 
        description="Review past sessions, resume incomplete ones, and track your performance across different roles."
        icon={HistoryIcon}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2.5 text-red-700">
            <AlertCircle className="shrink-0 mt-0.5" size={16} />
            <p className="text-xs sm:text-sm font-medium">{error}</p>
          </div>
        )}

        {!loading && interviews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mb-5 sm:mb-6">
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
            className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 text-center flex flex-col items-center justify-center min-h-[280px] shadow-sm relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-50/50 rounded-full blur-3xl -z-10 pointer-events-none"></div>
            
            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mb-4 shadow-inner border border-blue-200/50">
              <FileQuestion size={28} className="text-blue-600" />
            </div>
            
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 tracking-tight">No Interviews Yet</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-6 text-xs sm:text-sm">
              Create your first AI-powered mock interview to begin practicing for your dream role.
            </p>
            
            <Button 
              onClick={() => navigate('/generate')}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-9 sm:h-10 px-5 font-semibold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
              sortFilter={sortFilter}
              onSortChange={setSortFilter}
            />
            
            <InterviewList 
              interviews={paginatedInterviews as any[]}
              loading={loading}
              onDelete={handleDelete}
              onContinue={handleNavigation}
              onView={handleNavigation}
            />

            {filteredInterviews.length > ITEMS_PER_PAGE && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="rounded-xl px-4"
                >
                  Previous
                </Button>
                <span className="text-sm font-medium text-slate-600">
                  Page {currentPage} of {Math.ceil(filteredInterviews.length / ITEMS_PER_PAGE)}
                </span>
                <Button 
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredInterviews.length / ITEMS_PER_PAGE), p + 1))}
                  disabled={currentPage === Math.ceil(filteredInterviews.length / ITEMS_PER_PAGE)}
                  variant="outline"
                  className="rounded-xl px-4"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default History;
