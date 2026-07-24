import React from 'react';

export const CareerLoading: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 h-64 bg-slate-200 animate-pulse rounded-2xl"></div>
        <div className="w-full md:w-2/3 h-64 bg-slate-200 animate-pulse rounded-2xl"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="h-48 bg-slate-200 animate-pulse rounded-2xl"></div>
        <div className="h-48 bg-slate-200 animate-pulse rounded-2xl"></div>
        <div className="h-48 bg-slate-200 animate-pulse rounded-2xl"></div>
      </div>
      <div className="h-96 bg-slate-200 animate-pulse rounded-2xl"></div>
    </div>
  );
};
