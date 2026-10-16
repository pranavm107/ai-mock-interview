import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/dashboard/PageHeader';
import { History, BarChart2, Filter, Loader2, AlertCircle, ArrowRight, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { PreparationNavigation } from '../components/preparation/PreparationNavigation';
import { AppBreadcrumb } from '../components/dashboard/AppBreadcrumb';
import { API_BASE_URL } from '../config/api';
import type { Assessment, AssessmentStatus } from '../types/assessment';

export const PreparationHistory: React.FC = () => {
  const { getToken } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [stats, setStats] = useState({ totalAssessments: 0, completedAssessments: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchHistory();
  }, [filterCategory, filterStatus]);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = await getToken();
      
      const params = new URLSearchParams();
      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (filterStatus !== 'all') params.append('status', filterStatus);

      const [historyRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/assessments?${params.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/assessments/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [historyData, statsData] = await Promise.all([
        historyRes.json(),
        statsRes.json()
      ]);

      if (!historyRes.ok) throw new Error(historyData.error || 'Failed to fetch history');
      if (!statsRes.ok) throw new Error(statsData.error || 'Failed to fetch stats');

      setAssessments(historyData.data);
      setStats(statsData.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: AssessmentStatus) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'IN_PROGRESS': return <Clock size={16} className="text-amber-500" />;
      case 'READY': return <ArrowRight size={16} className="text-blue-500" />;
      case 'FAILED': return <XCircle size={16} className="text-rose-500" />;
      case 'GENERATING': return <Loader2 size={16} className="text-indigo-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: AssessmentStatus) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'IN_PROGRESS': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'READY': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'FAILED': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'GENERATING': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  return (
    <div className="pb-12 max-w-6xl mx-auto space-y-4 sm:space-y-5">
      <AppBreadcrumb items={[{ label: 'Practice' }, { label: 'Assessments', path: '/preparation' }, { label: 'History' }]} />
      <PreparationNavigation />
      <PageHeader 
        title="Preparation History" 
        description="Track your placement preparation progress and review past assessments."
        icon={History}
        actionLabel="View Analytics"
        actionTo="/preparation/analytics"
        actionIcon={BarChart2}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 flex items-center">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mr-3.5 shrink-0">
            <BarChart2 size={20} />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mb-0.5">Total Assessments</p>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{stats.totalAssessments}</h3>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 flex items-center">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mr-3.5 shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mb-0.5">Completed</p>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{stats.completedAssessments}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-sm">
        <div className="p-3.5 sm:p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center text-xs sm:text-sm font-semibold text-slate-800">
            <Filter size={15} className="mr-1.5" /> Filters
          </div>
          <div className="flex flex-wrap gap-2.5">
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              <option value="aptitude">Aptitude</option>
              <option value="technical-mcqs">Technical MCQs</option>
              <option value="verbal-ability">Verbal Ability</option>
              <option value="logical-reasoning">Logical Reasoning</option>
              <option value="resume-based">Resume Based</option>
            </select>
            
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="READY">Ready</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-10 flex flex-col items-center justify-center text-slate-500">
            <Loader2 size={28} className="animate-spin mb-3 text-indigo-500" />
            <p className="text-xs sm:text-sm">Loading your history...</p>
          </div>
        ) : error ? (
          <div className="p-10 flex flex-col items-center justify-center text-rose-500">
            <AlertCircle size={28} className="mb-3" />
            <p className="mb-3 text-xs sm:text-sm font-medium">{error}</p>
            <button onClick={fetchHistory} className="px-4 py-1.5 border border-rose-200 text-rose-700 rounded-lg font-medium hover:bg-rose-50 transition-colors text-xs sm:text-sm">
              Try Again
            </button>
          </div>
        ) : assessments.length === 0 ? (
          <div className="p-10 flex flex-col items-center justify-center text-slate-500">
            <History size={40} className="mb-3 text-slate-300" strokeWidth={1} />
            <p className="text-sm sm:text-base font-semibold text-slate-700 mb-1">No assessments found</p>
            <p className="text-xs text-slate-500">Try adjusting your filters or start a new practice session.</p>
            <Link to="/preparation/practice" className="mt-4 px-4 py-1.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-xs sm:text-sm">
              Start Practising
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {assessments.map((assessment) => (
              <div key={assessment.id} className="p-3.5 sm:p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getStatusColor(assessment.status)} flex items-center gap-1`}>
                      {getStatusIcon(assessment.status)} {assessment.status.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      {new Date(assessment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 mb-0.5 truncate">{assessment.title}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                    <span className="capitalize">{assessment.type.replace('_', ' ').toLowerCase()}</span>
                    {assessment.topic && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="truncate max-w-[200px]">{assessment.topic}</span>
                      </>
                    )}
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span>{assessment.questionCount} Questions</span>
                  </p>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  {assessment.status === 'COMPLETED' ? (
                    <Link 
                      to={`/preparation/results/${assessment.id}`}
                      className="h-8.5 px-3.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 hover:border-slate-300 transition-colors text-xs sm:text-sm flex items-center justify-center shadow-xs"
                    >
                      View Results
                    </Link>
                  ) : assessment.status === 'READY' || assessment.status === 'IN_PROGRESS' ? (
                    <Link 
                      to={`/preparation/assessment/${assessment.id}`}
                      className="h-8.5 px-3.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-xs sm:text-sm flex items-center justify-center shadow-xs"
                    >
                      Continue
                    </Link>
                  ) : (
                    <button disabled className="h-8.5 px-3.5 bg-slate-100 text-slate-400 rounded-lg font-medium text-xs sm:text-sm cursor-not-allowed flex items-center justify-center">
                      Unavailable
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
