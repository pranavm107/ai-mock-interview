import React from 'react';
import type { DashboardAnalytics } from '../../types/analytics';
import { Target, CheckCircle, BrainCircuit, Clock, Trophy, Flame } from 'lucide-react';

interface AnalyticsOverviewProps {
  overview: DashboardAnalytics;
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ overview }) => {
  const cards = [
    {
      title: 'Overall Score',
      value: overview.averageScore,
      icon: <Target className="w-5 h-5 text-blue-500" />,
      suffix: '/100'
    },
    {
      title: 'Best Score',
      value: overview.bestScore,
      icon: <Trophy className="w-5 h-5 text-yellow-500" />,
      suffix: '/100'
    },
    {
      title: 'Completed',
      value: overview.completedInterviews,
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      suffix: ' sessions'
    },
    {
      title: 'Completion Rate',
      value: overview.completionRate,
      icon: <BrainCircuit className="w-5 h-5 text-purple-500" />,
      suffix: '%'
    },
    {
      title: 'Current Streak',
      value: overview.currentStreak,
      icon: <Flame className="w-5 h-5 text-orange-500" />,
      suffix: ' days'
    },
    {
      title: 'Longest Streak',
      value: overview.longestStreak,
      icon: <Flame className="w-5 h-5 text-red-500" />,
      suffix: ' days'
    },
    {
      title: 'Avg Duration',
      value: overview.averageInterviewDuration ? Math.round(overview.averageInterviewDuration / 60) : 0,
      icon: <Clock className="w-5 h-5 text-blue-500" />,
      suffix: ' min'
    },
    {
      title: 'Total Practice',
      value: overview.totalPracticeDuration ? Math.round(overview.totalPracticeDuration / 60) : 0,
      icon: <Clock className="w-5 h-5 text-blue-600" />,
      suffix: ' min'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-slate-500 mb-2">
            {card.icon}
            <span className="text-xs font-medium uppercase tracking-wider">{card.title}</span>
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-slate-900">{card.value}</span>
            <span className="text-sm text-slate-500 ml-1">{card.suffix}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
