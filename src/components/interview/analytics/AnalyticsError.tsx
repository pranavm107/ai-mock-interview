import React from 'react';
import { AlertCircle } from 'lucide-react';

export const AnalyticsError: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8 bg-white/50 backdrop-blur-sm rounded-3xl border border-rose-200">
      <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
        <AlertCircle size={32} />
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2">Analytics temporarily unavailable.</h3>
      <p className="text-slate-500 max-w-[280px] mb-6">
        Previous results are preserved. Interview continues normally. We'll retry after your next answer.
      </p>
    </div>
  );
};
