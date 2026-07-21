import React from 'react';
import { BarChart3 } from 'lucide-react';

export const EmptyAnalytics: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200">
      <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
        <BarChart3 size={32} />
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2">Live Evaluation Pending</h3>
      <p className="text-slate-500 max-w-[280px]">
        Answer your first interview question to begin live evaluation.
      </p>
    </div>
  );
};
