import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingAnalytics: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200">
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
      <h3 className="text-lg font-medium text-slate-700 mb-2">Analyzing Response...</h3>
      <div className="w-full max-w-[200px] space-y-3 mt-4">
        <div className="h-2 bg-slate-200 rounded-full w-full animate-pulse"></div>
        <div className="h-2 bg-slate-200 rounded-full w-5/6 animate-pulse mx-auto"></div>
        <div className="h-2 bg-slate-200 rounded-full w-4/6 animate-pulse mx-auto"></div>
      </div>
    </div>
  );
};
