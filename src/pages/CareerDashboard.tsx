import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { API_BASE_URL } from '../config/api';
import { CareerScoreCard } from '../components/career/CareerScoreCard';
import { CareerReadinessCard } from '../components/career/CareerReadinessCard';
import { WeeklyCoachingCard } from '../components/career/WeeklyCoachingCard';
import { MonthlyCoachingCard } from '../components/career/MonthlyCoachingCard';
import { LearningRoadmapCard } from '../components/career/LearningRoadmapCard';
import { DailyGoalsCard } from '../components/career/DailyGoalsCard';
import { SkillProgressCard } from '../components/career/SkillProgressCard';
import { QuickActionsCard } from '../components/career/QuickActionsCard';
import { RecentInterviewCard } from '../components/career/RecentInterviewCard';
import { CareerLoading } from '../components/career/CareerLoading';
import { CareerError } from '../components/career/CareerError';
import { CareerEmpty } from '../components/career/CareerEmpty';
import { useInterviewHistory } from '../hooks/useInterviewHistory';

export default function CareerDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const { user } = useUser();
  const { sessions, fetchUserSessions } = useInterviewHistory();

  useEffect(() => {
    if (user?.id) {
      fetchUserSessions(user.id);
    }
  }, [user?.id, fetchUserSessions]);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/api/career/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch dashboard');
      const json = await res.json();
      
      // Check if profile exists
      if (!json.profile) {
        setData(null);
      } else {
        setData(json);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/api/career/generate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          interviewHistory: sessions.map(s => ({ role: s.role, score: s.score, status: s.status, date: s.createdAt })),
          skillsMatrix: {},
          recentTrends: {}
        })
      });
      if (!res.ok) throw new Error('Failed to generate career profile');
      await fetchDashboard();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) return <CareerLoading />;
  if (error) return <CareerError message={error} onRetry={fetchDashboard} />;
  if (!data) return <CareerEmpty onGenerate={handleGenerate} isGenerating={isGenerating} />;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Career Coach</h1>
          <p className="text-slate-500 mt-1">Your personalized roadmap to getting hired.</p>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold py-2 px-4 rounded-xl shadow-sm text-sm disabled:opacity-50"
        >
          {isGenerating ? 'Regenerating...' : 'Refresh AI Coach'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CareerScoreCard 
          score={data.score?.totalScore || 0} 
          trend={data.trends?.trend || 'Stable'}
          delta={data.trends?.delta || 0}
        />
        <CareerReadinessCard 
          readiness={data.profile.readinessLevel} 
          summary={data.profile.readinessReason}
        />
        <QuickActionsCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyCoachingCard coaching={data.weekly} />
        <MonthlyCoachingCard coaching={data.monthly} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LearningRoadmapCard roadmap={data.roadmap} />
        <DailyGoalsCard goals={data.daily} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SkillProgressCard recommendedSkills={data.profile.strengths || []} skills={data.skills || {}} />
        <RecentInterviewCard recent={data.recentPerformance} />
      </div>
    </div>
  );
}
