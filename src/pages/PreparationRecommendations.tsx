import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/dashboard/PageHeader';
import { Sparkles, BrainCircuit, ArrowUpRight, ArrowDownRight, CheckCircle2, Target, CalendarDays, Loader2, AlertCircle, BarChart2, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PreparationNavigation } from '../components/preparation/PreparationNavigation';
import { AppBreadcrumb } from '../components/dashboard/AppBreadcrumb';
import { useAuth } from '@clerk/clerk-react';
import { API_BASE_URL } from '../config/api';

interface PreparationRecommendation {
  summary: string;
  strengths: Array<{
    topic: string;
    accuracy: number;
    reason: string;
  }>;
  focusAreas: Array<{
    topic: string;
    accuracy: number;
    reason: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  recommendedTopics: Array<{
    topic: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  }>;
  studyPlan: Array<{
    day: number;
    focus: string;
    topics: string[];
    activity: string;
  }>;
  nextAssessment: {
    category: string;
    topic: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    questionCount: number;
    reason: string;
  };
}

interface RecommendationResponse {
  hasEnoughData: boolean;
  recommendation: PreparationRecommendation | null;
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

export const PreparationRecommendations: React.FC = () => {
  const { getToken } = useAuth();
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = await getToken();
      
      const res = await fetch(`${API_BASE_URL}/api/assessments/recommendations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to fetch recommendations');

      setData(resData.data);
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
        <p className="text-slate-500 font-medium">Analyzing your verified performance...</p>
        <p className="text-slate-400 text-sm mt-2">Our AI is building your personalized study plan.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pb-24 max-w-6xl mx-auto">
        <AppBreadcrumb items={[{ label: 'Practice' }, { label: 'Assessments', path: '/preparation' }, { label: 'AI Recommendations' }]} />
        <PreparationNavigation />
        <PageHeader 
          title="AI Recommendations" 
          description="Personalized study plans and focus areas."
          icon={BrainCircuit}
        />
        <div className="bg-white rounded-3xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
          <AlertCircle size={48} className="text-rose-500 mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Recommendations Unavailable</h3>
          <p className="text-slate-600 mb-6 max-w-md">
            Personalized recommendations are temporarily unavailable. Your verified performance analytics are still available.
          </p>
          <div className="flex gap-4">
            <button onClick={fetchRecommendations} className="px-6 py-2 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50">
              Try Again
            </button>
            <Link to="/preparation/analytics" className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 flex items-center gap-2">
              <BarChart2 size={18} /> View Analytics
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.hasEnoughData || !data.recommendation) {
    return (
      <div className="pb-24 max-w-6xl mx-auto">
        <AppBreadcrumb items={[{ label: 'Practice' }, { label: 'Assessments', path: '/preparation' }, { label: 'AI Recommendations' }]} />
        <PreparationNavigation />
        <PageHeader 
          title="AI Recommendations" 
          description="Personalized study plans and focus areas."
          icon={BrainCircuit}
        />
        <div className="bg-white rounded-3xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-6">
            <Sparkles size={36} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">No personalized recommendations yet</h3>
          <p className="text-slate-500 max-w-md mb-8">
            Complete your first preparation assessment to unlock an AI-powered personalized study plan and verified performance feedback.
          </p>
          <Link to="/preparation/practice" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
            Start Practising
          </Link>
        </div>
      </div>
    );
  }

  const rec = data.recommendation;

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'HIGH': return 'bg-rose-100 text-rose-700';
      case 'MEDIUM': return 'bg-amber-100 text-amber-700';
      case 'LOW': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="pb-24 max-w-7xl mx-auto space-y-8">
      <div>
        <AppBreadcrumb items={[{ label: 'Practice' }, { label: 'Assessments', path: '/preparation' }, { label: 'AI Recommendations' }]} />
        <PreparationNavigation />
        <PageHeader 
          title="AI Recommendations" 
          description="Your personalized study plan based on verified assessment analytics."
          icon={BrainCircuit}
          actionLabel="View Analytics"
          actionTo="/preparation/analytics"
          actionIcon={BarChart2}
        />
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4 text-indigo-300">
            <Sparkles size={20} />
            <span className="font-semibold tracking-wide text-sm uppercase">AI Preparation Summary</span>
          </div>
          <p className="text-xl leading-relaxed max-w-3xl font-medium text-slate-100">
            {rec.summary}
          </p>
        </div>
        {/* Decorative background element */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Study Plan */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <CalendarDays size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">7-Day Study Plan</h3>
            </div>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {rec.studyPlan.map((day, idx) => (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-indigo-100 text-indigo-600 font-bold text-sm shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    {day.day}
                  </div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                    <h4 className="font-bold text-slate-900 text-lg mb-1">{day.focus}</h4>
                    <p className="text-sm text-slate-500 mb-3">{day.activity}</p>
                    <div className="flex flex-wrap gap-2">
                      {day.topics.map((t, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Assessment Recommendation */}
          <div className="bg-white rounded-3xl border border-indigo-100 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Recommended Next Assessment</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-sm font-medium text-slate-500 mb-1">Category</p>
                <p className="font-bold text-slate-900">{rec.nextAssessment.category}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-sm font-medium text-slate-500 mb-1">Topic Focus</p>
                <p className="font-bold text-slate-900">{rec.nextAssessment.topic}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-sm font-medium text-slate-500 mb-1">Difficulty</p>
                <p className={`font-bold ${rec.nextAssessment.difficulty === 'HARD' ? 'text-rose-600' : rec.nextAssessment.difficulty === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {rec.nextAssessment.difficulty}
                </p>
              </div>
            </div>
            <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl mb-8">
              <div className="flex items-start gap-3">
                <Sparkles className="text-indigo-600 shrink-0 mt-0.5" size={20} />
                <p className="text-slate-700 leading-relaxed text-sm">
                  <span className="font-semibold text-slate-900 mr-2">Why this test?</span>
                  {rec.nextAssessment.reason}
                </p>
              </div>
            </div>
            <Link 
              to={`/preparation/${getCategorySlug(rec.nextAssessment.category)}?topic=${encodeURIComponent(rec.nextAssessment.topic)}&difficulty=${encodeURIComponent(rec.nextAssessment.difficulty)}`}
              className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors w-full sm:w-auto justify-center"
            >
              <BookOpen size={20} /> Configure Assessment
            </Link>
          </div>

        </div>

        {/* Sidebar Area */}
        <div className="space-y-6">
          
          {/* Focus Areas */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6 text-rose-600">
              <Target size={20} />
              <h3 className="font-bold text-slate-900">Needs Improvement</h3>
            </div>
            <div className="space-y-6">
              {rec.focusAreas.length > 0 ? rec.focusAreas.map((focus, i) => (
                <div key={i} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-slate-800">{focus.topic}</h4>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${getPriorityColor(focus.priority)}`}>
                      {focus.priority} PRIORITY
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-slate-500">Verified Score:</span>
                    <span className="text-sm font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">{focus.accuracy}%</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-600 flex items-start gap-2">
                      <Sparkles className="shrink-0 text-slate-400 mt-0.5" size={16} />
                      {focus.reason}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-500 italic">No critical weak areas identified.</p>
              )}
            </div>
          </div>

          {/* Strengths */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6 text-emerald-600">
              <CheckCircle2 size={20} />
              <h3 className="font-bold text-slate-900">Your Strengths</h3>
            </div>
            <div className="space-y-6">
              {rec.strengths.length > 0 ? rec.strengths.map((str, i) => (
                <div key={i} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
                  <h4 className="font-bold text-slate-800 mb-2">{str.topic}</h4>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-slate-500">Verified Score:</span>
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{str.accuracy}%</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-600 flex items-start gap-2">
                      <Sparkles className="shrink-0 text-slate-400 mt-0.5" size={16} />
                      {str.reason}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-500 italic">Complete more assessments to verify your strengths.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
