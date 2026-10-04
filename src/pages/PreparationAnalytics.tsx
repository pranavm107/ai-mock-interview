import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/dashboard/PageHeader';
import { BarChart2, BookOpen, Brain, Terminal, Puzzle, BookA, FileSearch, ArrowUpRight, ArrowDownRight, Minus, AlertCircle, Loader2, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PreparationNavigation } from '../components/preparation/PreparationNavigation';
import { AppBreadcrumb } from '../components/dashboard/AppBreadcrumb';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { API_BASE_URL } from '../config/api';

interface AssessmentAnalytics {
  overall: {
    totalCompleted: number;
    averageScore: number;
    bestScore: number;
    averageAccuracy: number;
    totalQuestions: number;
    totalCorrect: number;
    totalIncorrect: number;
    totalUnanswered: number;
  };
  categories: Array<{
    category: string;
    assessments: number;
    averageScore: number;
    averageAccuracy: number;
    bestScore: number;
    totalQuestions: number;
    correct: number;
    incorrect: number;
    unanswered: number;
  }>;
  topics: Array<{
    topic: string;
    assessments: number;
    averageScore: number;
    averageAccuracy: number;
    bestScore: number;
    totalQuestions: number;
    correct: number;
    incorrect: number;
    unanswered: number;
    status: 'Strong' | 'Developing' | 'Needs Improvement' | 'Insufficient Data';
  }>;
  trend: Array<{
    assessmentId: string;
    title: string;
    category: string;
    topic?: string;
    completedAt: string;
    score: number;
    accuracy: number;
  }>;
}

export const PreparationAnalytics: React.FC = () => {
  const { getToken } = useAuth();
  const [analytics, setAnalytics] = useState<AssessmentAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = await getToken();
      
      const res = await fetch(`${API_BASE_URL}/api/assessments/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch analytics');

      setAnalytics(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pb-24 max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 size={40} className="animate-spin text-indigo-500 mb-4" />
        <p className="text-slate-500">Loading your performance analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pb-24 max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
        <AlertCircle size={48} className="text-rose-500 mb-4" />
        <p className="text-slate-700 font-medium mb-4">{error}</p>
        <button onClick={fetchAnalytics} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700">
          Try Again
        </button>
      </div>
    );
  }

  if (!analytics || analytics.overall.totalCompleted === 0) {
    return (
      <div className="pb-24 max-w-6xl mx-auto">
        <AppBreadcrumb items={[{ label: 'Practice' }, { label: 'Assessments', path: '/preparation' }, { label: 'Analytics' }]} />
        <PreparationNavigation />
        <PageHeader 
          title="Preparation Analytics" 
          description="Track your performance, accuracy, and topic strengths across all assessments."
          icon={BarChart2}
        />
        <div className="bg-white rounded-3xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-6">
            <BarChart2 size={36} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">No completed assessments yet</h3>
          <p className="text-slate-500 max-w-md mb-8">
            Complete your first preparation assessment to unlock detailed performance analytics, topic strengths, and progress trends.
          </p>
          <Link to="/preparation/practice" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
            Start Practising
          </Link>
        </div>
      </div>
    );
  }

  const getTopicStatusColor = (status: string) => {
    switch (status) {
      case 'Strong': return 'text-emerald-600 bg-emerald-50';
      case 'Developing': return 'text-amber-600 bg-amber-50';
      case 'Needs Improvement': return 'text-rose-600 bg-rose-50';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getTopicStatusIcon = (status: string) => {
    switch (status) {
      case 'Strong': return <ArrowUpRight size={16} />;
      case 'Needs Improvement': return <ArrowDownRight size={16} />;
      case 'Developing': return <Minus size={16} />;
      default: return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    if (category.includes('Technical')) return <Terminal size={20} />;
    if (category.includes('Verbal')) return <BookA size={20} />;
    if (category.includes('Logical')) return <Puzzle size={20} />;
    if (category.includes('Aptitude')) return <Brain size={20} />;
    if (category.includes('Resume')) return <FileSearch size={20} />;
    return <BookOpen size={20} />;
  };

  return (
    <div className="pb-24 max-w-7xl mx-auto space-y-8">
      <div>
        <AppBreadcrumb items={[{ label: 'Practice' }, { label: 'Assessments', path: '/preparation' }, { label: 'Analytics' }]} />
        <PreparationNavigation />
        <PageHeader 
          title="Performance Analytics" 
          description="Comprehensive insights into your placement preparation progress."
          icon={BarChart2}
          actionLabel="View History"
          actionTo="/preparation/history"
          actionIcon={History}
          secondaryActionLabel="AI Recommendations"
          secondaryActionTo="/preparation/recommendations"
          secondaryActionIcon={Sparkles}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-1">Assessments Completed</p>
          <h4 className="text-3xl font-bold text-slate-900">{analytics.overall.totalCompleted}</h4>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-1">Average Accuracy</p>
          <h4 className="text-3xl font-bold text-slate-900">{analytics.overall.averageAccuracy}%</h4>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-1">Questions Solved</p>
          <h4 className="text-3xl font-bold text-emerald-600">{analytics.overall.totalCorrect} <span className="text-base font-normal text-slate-400">/ {analytics.overall.totalQuestions}</span></h4>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-1">Unanswered</p>
          <h4 className="text-3xl font-bold text-amber-500">{analytics.overall.totalUnanswered}</h4>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-1">Best Score</p>
          <h4 className="text-3xl font-bold text-indigo-600">{analytics.overall.bestScore}%</h4>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Trend Chart (Simple CSS implementation) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Performance Trend</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {analytics.trend.map((point, i) => (
                <div key={i} className="relative flex-1 group flex flex-col items-center justify-end h-full">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-slate-900 text-white text-xs p-2 rounded whitespace-nowrap z-10 transition-opacity pointer-events-none">
                    <p className="font-bold mb-1">{point.category} {point.topic ? `- ${point.topic}` : ''}</p>
                    <p>Accuracy: {point.accuracy}%</p>
                    <p className="text-slate-400 mt-1">{new Date(point.completedAt).toLocaleDateString()}</p>
                  </div>
                  {/* Bar */}
                  <div 
                    className={`w-full max-w-[40px] rounded-t-lg transition-all ${point.accuracy >= 80 ? 'bg-emerald-500' : point.accuracy >= 60 ? 'bg-indigo-500' : 'bg-rose-500'}`}
                    style={{ height: `${Math.max(point.accuracy, 5)}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs font-medium text-slate-400 mt-4 px-2">
              <span>Older</span>
              <span>Recent</span>
            </div>
          </div>

          {/* Topic Performance */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Topic Performance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Topic</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Attempts</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Accuracy</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analytics.topics.sort((a,b) => b.averageAccuracy - a.averageAccuracy).map((topic, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-medium text-slate-800">{topic.topic}</td>
                      <td className="p-4 text-slate-600">{topic.assessments}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-700">{topic.averageAccuracy}%</span>
                          <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden hidden sm:block">
                            <div 
                              className={`h-full rounded-full ${topic.averageAccuracy >= 80 ? 'bg-emerald-500' : topic.averageAccuracy >= 60 ? 'bg-indigo-500' : 'bg-rose-500'}`}
                              style={{ width: `${topic.averageAccuracy}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${getTopicStatusColor(topic.status)}`}>
                          {getTopicStatusIcon(topic.status)}
                          {topic.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
          
          {/* Category Breakdown */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Category Breakdown</h3>
            <div className="space-y-6">
              {analytics.categories.sort((a,b) => b.assessments - a.assessments).map((cat, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <div className="text-indigo-500">{getCategoryIcon(cat.category)}</div>
                      <span>{cat.category}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{cat.averageAccuracy}%</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mb-2">
                    <span>{cat.assessments} assessments</span>
                    <span>Best: {cat.bestScore}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${cat.averageAccuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Weaknesses (Derived from topics) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Focus Areas</h3>
            
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-emerald-600 mb-3 flex items-center"><ArrowUpRight size={16} className="mr-1"/> Strengths</h4>
              <ul className="space-y-2">
                {analytics.topics.filter(t => t.status === 'Strong').length > 0 ? 
                  analytics.topics.filter(t => t.status === 'Strong').map((t, i) => (
                    <li key={i} className="flex justify-between text-sm">
                      <span className="text-slate-700">{t.topic}</span>
                      <span className="font-semibold text-slate-900">{t.averageAccuracy}%</span>
                    </li>
                  )) : (
                  <li className="text-sm text-slate-500 italic">No strong topics identified yet.</li>
                )}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-rose-600 mb-3 flex items-center"><ArrowDownRight size={16} className="mr-1"/> Needs Improvement</h4>
              <ul className="space-y-2">
                {analytics.topics.filter(t => t.status === 'Needs Improvement').length > 0 ? 
                  analytics.topics.filter(t => t.status === 'Needs Improvement').map((t, i) => (
                    <li key={i} className="flex justify-between text-sm">
                      <span className="text-slate-700">{t.topic}</span>
                      <span className="font-semibold text-slate-900">{t.averageAccuracy}%</span>
                    </li>
                  )) : (
                  <li className="text-sm text-slate-500 italic">No weak topics identified yet.</li>
                )}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
