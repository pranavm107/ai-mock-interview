import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, History, BarChart3, Sparkles } from 'lucide-react';

export const PreparationNavigation: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const isOverview = pathname === '/preparation';
  const isHistory = pathname.startsWith('/preparation/history');
  const isAnalytics = pathname.startsWith('/preparation/analytics');
  const isRecommendations = pathname.startsWith('/preparation/recommendations');
  // Practice is active if we are in preparation but NOT in any of the specific tabs above, and NOT exactly on the overview page.
  const isPractice = pathname.startsWith('/preparation') && !isOverview && !isHistory && !isAnalytics && !isRecommendations;

  const navItems = [
    { name: 'Overview', path: '/preparation', icon: LayoutDashboard, isActive: isOverview },
    { name: 'Practice', path: '/preparation', icon: BookOpen, isActive: isPractice },
    { name: 'History', path: '/preparation/history', icon: History, isActive: isHistory },
    { name: 'Analytics', path: '/preparation/analytics', icon: BarChart3, isActive: isAnalytics },
    { name: 'AI Recommendations', path: '/preparation/recommendations', icon: Sparkles, isActive: isRecommendations },
  ];

  return (
    <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-200 mb-8 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex space-x-1 p-1 w-full max-w-full">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              item.isActive
                ? 'bg-blue-50 text-blue-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <item.icon size={16} className={item.isActive ? 'text-blue-600' : 'text-slate-400'} strokeWidth={item.isActive ? 2.5 : 2} />
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
};
