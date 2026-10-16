import React from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  summary: string;
}

export const ReportSummary: React.FC<Props> = ({ summary }) => {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 sm:p-5 border border-indigo-100 shadow-xs">
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
          <Sparkles size={16} />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-800">AI Summary</h3>
      </div>
      <p className="text-slate-700 leading-relaxed text-xs sm:text-sm font-medium">
        {summary}
      </p>
    </div>
  );
};
