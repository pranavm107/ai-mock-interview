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
    <div className="pb-12 max-w-7xl mx-auto space-y-4 sm:space-y-5">
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
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-4 sm:p-5 text-white relative overflow-hidden shadow-xs">
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 mb-2.5 text-indigo-300">
            <Sparkles size={16} />
            <span className="font-semibold tracking-wider text-xs uppercase">AI Preparation Summary</span>
          </div>
          <p className="text-sm sm:text-base leading-relaxed max-w-3xl font-normal text-slate-100">
            {rec.summary}
          </p>
        </div>
        {/* Decorative background element */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/15 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          
          {/* Study Plan */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4 sm:mb-5">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <CalendarDays size={18} />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-900">7-Day Study Plan</h3>
            </div>
            
            <div className="space-y-3.5 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {rec.studyPlan.map((day, idx) => (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white bg-indigo-100 text-indigo-600 font-bold text-xs shadow-xs shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    {day.day}
                  </div>
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2rem)] bg-white border border-slate-200/90 p-3 sm:p-3.5 rounded-xl shadow-xs">
                    <h4 className="font-semibold text-slate-900 text-xs sm:text-sm mb-0.5">{day.focus}</h4>
                    <p className="text-xs text-slate-500 mb-2 leading-relaxed">{day.activity}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {day.topics.map((t, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-medium">
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
          <div className="bg-white rounded-xl border border-indigo-100 p-4 sm:p-5 shadow-xs">
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-3.5">Recommended Next Assessment</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs font-medium text-slate-500 mb-0.5">Category</p>
                <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{rec.nextAssessment.category}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs font-medium text-slate-500 mb-0.5">Topic Focus</p>
                <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{rec.nextAssessment.topic}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs font-medium text-slate-500 mb-0.5">Difficulty</p>
                <p className={`text-xs sm:text-sm font-semibold ${rec.nextAssessment.difficulty === 'HARD' ? 'text-rose-600' : rec.nextAssessment.difficulty === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {rec.nextAssessment.difficulty}
                </p>
              </div>
            </div>
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-100/70 rounded-lg mb-4">
              <div className="flex items-start gap-2.5">
                <Sparkles className="text-indigo-600 shrink-0 mt-0.5" size={16} />
                <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                  <span className="font-semibold text-slate-900 mr-1.5">Why this test?</span>
                  {rec.nextAssessment.reason}
                </p>
              </div>
            </div>
            <Link 
              to={`/preparation/${getCategorySlug(rec.nextAssessment.category)}?topic=${encodeURIComponent(rec.nextAssessment.topic)}&difficulty=${encodeURIComponent(rec.nextAssessment.difficulty)}`}
              className="inline-flex items-center gap-1.5 h-9 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-xs sm:text-sm w-full sm:w-auto justify-center shadow-xs"
            >
              <BookOpen size={16} /> Configure Assessment
            </Link>
          </div>

        </div>

        {/* Sidebar Area */}
        <div className="space-y-4 sm:space-y-5">
          
          {/* Focus Areas */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-1.5 mb-3 text-rose-600">
              <Target size={16} />
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Needs Improvement</h3>
            </div>
            <div className="space-y-3">
              {rec.focusAreas.length > 0 ? rec.focusAreas.map((focus, i) => (
                <div key={i} className="border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-800 truncate pr-2">{focus.topic}</h4>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getPriorityColor(focus.priority)} shrink-0`}>
                      {focus.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-xs font-medium text-slate-500">Verified:</span>
                    <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">{focus.accuracy}%</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-600 flex items-start gap-1.5">
                      <Sparkles className="shrink-0 text-slate-400 mt-0.5" size={13} />
                      {focus.reason}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-slate-500 italic">No critical weak areas identified.</p>
              )}
            </div>
          </div>

          {/* Strengths */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-1.5 mb-3 text-emerald-600">
              <CheckCircle2 size={16} />
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Your Strengths</h3>
            </div>
            <div className="space-y-3">
              {rec.strengths.length > 0 ? rec.strengths.map((str, i) => (
                <div key={i} className="border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-800 mb-1 truncate">{str.topic}</h4>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-xs font-medium text-slate-500">Verified:</span>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{str.accuracy}%</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-600 flex items-start gap-1.5">
                      <Sparkles className="shrink-0 text-slate-400 mt-0.5" size={13} />
                      {str.reason}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-slate-500 italic">Complete more assessments to verify your strengths.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
