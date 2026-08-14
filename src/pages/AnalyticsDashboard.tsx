import React from 'react';
import { useAnalytics } from '../hooks/useAnalytics';

import { AnalyticsLoading } from '../components/analytics/AnalyticsLoading';
import { AnalyticsError } from '../components/analytics/AnalyticsError';
import { AnalyticsEmpty } from '../components/analytics/AnalyticsEmpty';
import { AnalyticsOverview } from '../components/analytics/AnalyticsOverview';
import { PerformanceTrendChart } from '../components/analytics/PerformanceTrendChart';
import { DifficultyChart } from '../components/analytics/DifficultyChart';
import { CategoryRadarChart } from '../components/analytics/CategoryRadarChart';
import { SkillTrendChart } from '../components/analytics/SkillTrendChart';
import { SpeechAnalyticsCard } from '../components/analytics/SpeechAnalyticsCard';
import { ResumeAnalyticsCard } from '../components/analytics/ResumeAnalyticsCard';
import { ActivityHeatmap } from '../components/analytics/ActivityHeatmap';
import { RecommendationPanel } from '../components/analytics/RecommendationPanel';

const AnalyticsDashboard: React.FC = () => {
  const { data, loading, error, refetch } = useAnalytics();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">Analytics Dashboard</h1>
        <AnalyticsLoading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnalyticsError message={error} onRetry={refetch} />
      </div>
    );
  }

  if (!data || data.overview.completedInterviews === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnalyticsEmpty />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your interview performance, skill progression, and AI coaching insights.
          </p>
        </div>
      </div>

      {/* Top Row: Overview Cards */}
      <AnalyticsOverview overview={data.overview} />

      {/* Second Row: Performance Trend & Difficulty */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerformanceTrendChart data={data.performanceTrend} />
        </div>
        <div className="lg:col-span-1">
          <DifficultyChart data={data.difficultyAnalytics} />
        </div>
      </div>

      {/* Third Row: Radar & Skill Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CategoryRadarChart data={data.categoryTrend} />
        </div>
        <div className="lg:col-span-2">
          <SkillTrendChart data={data.skillTrend} />
        </div>
      </div>

      {/* Fourth Row: Speech & Resume Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpeechAnalyticsCard data={data.speechAnalytics} />
        <ResumeAnalyticsCard data={data.resumeAnalytics} />
      </div>

      {/* Fifth Row: Activity Heatmap */}
      <ActivityHeatmap data={data.activityHeatmap} />

      {/* Final Row: Recommendations */}
      <RecommendationPanel recommendations={data.recommendations} />
    </div>
  );
};

export default AnalyticsDashboard;
