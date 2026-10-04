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
    <div className="pb-24 max-w-6xl mx-auto">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 flex items-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mr-6">
            <BarChart2 size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Assessments</p>
            <h3 className="text-3xl font-bold text-slate-900">{stats.totalAssessments}</h3>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-200 flex items-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mr-6">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Completed</p>
            <h3 className="text-3xl font-bold text-slate-900">{stats.completedAssessments}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center text-slate-800 font-semibold">
            <Filter size={18} className="mr-2" /> Filters
          </div>
          <div className="flex flex-wrap gap-4">
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="READY">Ready</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-500">
            <Loader2 size={32} className="animate-spin mb-4 text-indigo-500" />
            <p>Loading your history...</p>
          </div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center justify-center text-rose-500">
            <AlertCircle size={32} className="mb-4" />
            <p className="mb-4">{error}</p>
            <button onClick={fetchHistory} className="px-6 py-2 border border-rose-200 text-rose-700 rounded-xl font-medium hover:bg-rose-50 transition-colors text-sm">
              Try Again
            </button>
          </div>
        ) : assessments.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-500">
            <History size={48} className="mb-4 text-slate-300" strokeWidth={1} />
            <p className="text-lg font-medium text-slate-700 mb-2">No assessments found</p>
            <p className="text-sm">Try adjusting your filters or start a new practice session.</p>
            <Link to="/preparation/practice" className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
              Start Practising
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {assessments.map((assessment) => (
              <div key={assessment.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${getStatusColor(assessment.status)} flex items-center gap-1.5`}>
                      {getStatusIcon(assessment.status)} {assessment.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {new Date(assessment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">{assessment.title}</h4>
                  <p className="text-sm text-slate-600 flex items-center gap-3">
                    <span className="capitalize">{assessment.type.replace('_', ' ').toLowerCase()}</span>
                    {assessment.topic && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>{assessment.topic}</span>
                      </>
                    )}
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span>{assessment.questionCount} Questions</span>
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  {assessment.status === 'COMPLETED' ? (
                    <Link 
                      to={`/preparation/results/${assessment.id}`}
                      className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 hover:border-slate-300 transition-colors text-sm"
                    >
                      View Results
                    </Link>
                  ) : assessment.status === 'READY' || assessment.status === 'IN_PROGRESS' ? (
                    <Link 
                      to={`/preparation/assessment/${assessment.id}`}
                      className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors text-sm"
                    >
                      Continue
                    </Link>
                  ) : (
                    <button disabled className="px-5 py-2.5 bg-slate-100 text-slate-400 rounded-xl font-medium text-sm cursor-not-allowed">
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
