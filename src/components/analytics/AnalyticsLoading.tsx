import React from 'react';

export const AnalyticsLoading: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Row Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-200 rounded-2xl" />
        ))}
      </div>

      {/* Second Row: Trend & Difficulty */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 bg-slate-200 rounded-2xl" />
        <div className="h-96 bg-slate-200 rounded-2xl" />
      </div>

      {/* Third Row: Radar & Skill Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-96 bg-slate-200 rounded-2xl" />
        <div className="lg:col-span-2 h-96 bg-slate-200 rounded-2xl" />
      </div>

      {/* Bottom section */}
      <div className="h-48 bg-slate-200 rounded-2xl" />
    </div>
  );
};
