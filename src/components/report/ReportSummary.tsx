import React from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  summary: string;
}

export const ReportSummary: React.FC<Props> = ({ summary }) => {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 border border-indigo-100 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
          <Sparkles size={20} />
        </div>
        <h3 className="text-xl font-bold text-slate-800">AI Summary</h3>
      </div>
      <p className="text-slate-700 leading-relaxed text-lg font-medium">
        {summary}
      </p>
    </div>
  );
};
