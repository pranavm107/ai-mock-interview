import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/dashboard/PageHeader';
import { BookOpen, Brain, Terminal, BookA, Puzzle, FileSearch, ArrowRight, History, BarChart2, Sparkles, CheckCircle2, Clock, XCircle, Loader2, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PreparationNavigation } from '../components/preparation/PreparationNavigation';
import { useAuth } from '@clerk/clerk-react';
import { API_BASE_URL } from '../config/api';
import type { Assessment, AssessmentStatus } from '../types/assessment';

export const categories = [
  {
    id: 'aptitude',
    title: 'Aptitude',
    description: 'Practice quantitative and numerical reasoning for standard placement rounds.',
    icon: Brain,
    color: 'text-purple-600',
    bg: 'bg-purple-100'
  },
  {
    id: 'technical-mcqs',
    title: 'Technical MCQs',
    description: 'Test your knowledge on OOP, DBMS, OS, Computer Networks, and more.',
    icon: Terminal,
    color: 'text-blue-600',
    bg: 'bg-blue-100'
  },
  {
    id: 'verbal-ability',
    title: 'Verbal Ability',
    description: 'Enhance your English grammar, comprehension, and vocabulary skills.',
    icon: BookA,
    color: 'text-rose-600',
    bg: 'bg-rose-100'
  },
  {
    id: 'logical-reasoning',
    title: 'Logical Reasoning',
    description: 'Sharpen your analytical thinking and pattern recognition abilities.',
    icon: Puzzle,
    color: 'text-amber-600',
    bg: 'bg-amber-100'
  },
  {
    id: 'resume-based',
    title: 'Resume-Based MCQs',
    description: 'Take a personalized assessment based entirely on the skills in your resume.',
    icon: FileSearch,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100'
  }
];

interface DashboardData {
  analytics: any | null;
  recommendations: any | null;
  recent: Assessment[];
}

const getCategorySlug = (categoryName: string): string => {
  if (!categoryName) return 'technical-mcqs';
  const name = categoryName.toLowerCase();
  if (name.includes('technical')) return 'technical-mcqs';
  if (name.includes('aptitude')) return 'aptitude';
  if (name.includes('verbal')) return 'verbal-ability';
  if (name.includes('logical')) return 'logical-reasoning';
  if (name.includes('resume')) return 'resume-based-mcqs';
  return 'technical-mcqs';
};

export const PreparationLanding: React.FC = () => {
  const { getToken } = useAuth();
  const [data, setData] = useState<DashboardData>({ analytics: null, recommendations: null, recent: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = await getToken();

      // Fetch analytics, recommendations, and recent history in parallel
      const [analyticsRes, recRes, historyRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/api/assessments/analytics`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/assessments/recommendations`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/assessments?limit=5`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      let analyticsData = null;
      let recData = null;
      let recentData: Assessment[] = [];

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value.ok) {
        const json = await analyticsRes.value.json();
        analyticsData = json.data;
      }

      if (recRes.status === 'fulfilled' && recRes.value.ok) {
        const json = await recRes.value.json();
        recData = json.data;
      }

      if (historyRes.status === 'fulfilled' && historyRes.value.ok) {
        const json = await historyRes.value.json();
        recentData = json.data.slice(0, 5); 
      }

      setData({ analytics: analyticsData, recommendations: recData, recent: recentData });
    } catch (err: any) {
      console.error(err);
      setError("Failed to load dashboard data.");
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

  return (
    <div className="pb-24 max-w-7xl mx-auto space-y-12">
      <div>
        <PreparationNavigation />
        <div className="mt-8 mb-4">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Preparation</h1>
          <p className="text-slate-600 text-lg">Prepare smarter. Track your progress and improve your weak areas.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="animate-spin text-indigo-500 mb-4" />
          <p className="text-slate-500">Loading your personalized dashboard...</p>
        </div>
      ) : (
        <>
          {/* Progress Summary */}
          {data.analytics && data.analytics.overall && data.analytics.overall.totalCompleted > 0 ? (
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Your Preparation Progress</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                  <p className="text-4xl font-bold text-indigo-600 mb-1">{data.analytics.overall.totalCompleted}</p>
                  <p className="text-sm font-semibold text-slate-500">Completed</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                  <p className="text-4xl font-bold text-blue-600 mb-1">{Math.round(data.analytics.overall.averageScore)}%</p>
                  <p className="text-sm font-semibold text-slate-500">Average Score</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                  <p className="text-4xl font-bold text-emerald-600 mb-1">{Math.round(data.analytics.overall.bestScore)}%</p>
                  <p className="text-sm font-semibold text-slate-500">Best Score</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                  <p className="text-4xl font-bold text-purple-600 mb-1">{Math.round(data.analytics.overall.averageAccuracy)}%</p>
                  <p className="text-sm font-semibold text-slate-500">Accuracy</p>
                </div>
              </div>
            </section>
          ) : (
            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Start your preparation journey</h2>
              <p className="text-slate-600 mb-6">Complete your first assessment to receive personalized AI recommendations and track your progress.</p>
              <Link to="/preparation/practice" className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                Start Your First Assessment
              </Link>
            </section>
          )}

          {/* Quick Actions */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/preparation/practice" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group block">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Play size={20} className="ml-1" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">Start Practice</h3>
                <p className="text-sm text-slate-500">Practice a new topic or category</p>
              </Link>
              <Link to="/preparation/analytics" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group block">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BarChart2 size={20} />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">View Analytics</h3>
                <p className="text-sm text-slate-500">Track your performance trends</p>
              </Link>
              <Link to="/preparation/recommendations" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-purple-300 hover:shadow-md transition-all group block">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles size={20} />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">AI Recommendations</h3>
                <p className="text-sm text-slate-500">Get your next focus area</p>
              </Link>
            </div>
          </section>

          {/* Recommended for You */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Recommended for You</h2>
            {data.recommendations && data.recommendations.hasEnoughData && data.recommendations.recommendation ? (
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Sparkles size={120} />
                </div>
                <div className="relative z-10 max-w-3xl">
                  <div className="flex items-center gap-2 mb-4">
                    {data.recommendations.recommendation.focusAreas[0] && (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        data.recommendations.recommendation.focusAreas[0].priority === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                        data.recommendations.recommendation.focusAreas[0].priority === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {data.recommendations.recommendation.focusAreas[0].priority} PRIORITY
                      </span>
                    )}
                    {data.recommendations.recommendation.focusAreas[0] && (
                      <span className="text-indigo-200 font-medium text-sm">
                        Current Accuracy: {data.recommendations.recommendation.focusAreas[0].accuracy}%
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{data.recommendations.recommendation.focusAreas[0]?.topic || 'General Practice'}</h3>
                  <p className="text-indigo-100 mb-6 leading-relaxed">
                    {data.recommendations.recommendation.focusAreas[0]?.reason || 'Your recent performance suggests focusing on this area will yield the highest improvement.'}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link 
                      to={`/preparation/${getCategorySlug(data.recommendations.recommendation.nextAssessment?.category)}?topic=${encodeURIComponent(data.recommendations.recommendation.nextAssessment?.topic || '')}&difficulty=${encodeURIComponent(data.recommendations.recommendation.nextAssessment?.difficulty || 'Medium')}`}
                      className="px-6 py-3 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-sm"
                    >
                      Start Practice
                    </Link>
                    <Link to="/preparation/recommendations" className="px-6 py-3 bg-indigo-800/50 text-white font-medium rounded-xl hover:bg-indigo-800 transition-colors border border-indigo-700/50">
                      View AI Recommendations
                    </Link>
                  </div>
                </div>
              </div>
            ) : data.analytics && data.analytics.overall && data.analytics.overall.totalCompleted > 0 ? (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">AI Recommendations unavailable right now.</h3>
                  <p className="text-slate-500 text-sm">You can still continue practicing or view your existing progress.</p>
                </div>
                <div className="flex gap-4">
                  <Link to="/preparation/practice" className="px-4 py-2 bg-slate-50 text-slate-700 font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">Start Practice</Link>
                  <Link to="/preparation/analytics" className="px-4 py-2 bg-slate-50 text-slate-700 font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors hidden sm:block">View Analytics</Link>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 text-center">
                <Sparkles size={32} className="mx-auto text-slate-400 mb-3" />
                <h3 className="font-bold text-slate-700 mb-2">Start Your Preparation Journey</h3>
                <p className="text-slate-500 text-sm mb-4">Complete your first assessment to receive personalized AI recommendations.</p>
                <Link to="/preparation/practice" className="inline-flex items-center px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors text-sm">
                  Start Practice
                </Link>
              </div>
            )}
          </section>


          {/* Recent Activity */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
              {data.recent.length > 0 && (
                <Link to="/preparation/history" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                  View History
                </Link>
              )}
            </div>
            
            {data.recent.length > 0 ? (
              <div className="space-y-4">
                {data.recent.map((assessment) => {
                  // Find score from analytics trend if available
                  const trendData = data.analytics?.trend?.find((t: any) => t.assessmentId === assessment.id);
                  const displayScore = trendData ? trendData.accuracy : undefined;
                  
                  return (
                    <div key={assessment.id} className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          {getStatusIcon(assessment.status)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{assessment.title}</h4>
                          <p className="text-sm text-slate-500">
                            {assessment.category || 'General'} {assessment.topic && `• ${assessment.topic}`} • {new Date(assessment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0">
                        {assessment.status === 'COMPLETED' && displayScore !== undefined && (
                          <div className="text-right">
                            <p className="text-sm font-semibold text-slate-500">Accuracy</p>
                            <p className="font-bold text-slate-900">{displayScore}%</p>
                          </div>
                        )}
                        
                        <Link 
                          to={assessment.status === 'COMPLETED' ? `/preparation/results/${assessment.id}` : `/preparation/assessment/${assessment.id}`}
                          className="px-4 py-2 bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors whitespace-nowrap"
                        >
                          {assessment.status === 'COMPLETED' ? 'View Results' : 'Continue'}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
                <History size={32} className="mx-auto text-slate-400 mb-3" />
                <h3 className="font-bold text-slate-700 mb-2">No assessments yet</h3>
                <p className="text-slate-500 text-sm mb-4">Start your first practice assessment to begin tracking your preparation progress.</p>
                <Link to="/preparation/practice" className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors text-sm">
                  Start Practice
                </Link>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};
