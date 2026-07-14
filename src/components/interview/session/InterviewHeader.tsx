import React from 'react';
import { CompanyLogo } from '../CompanyLogo';
import { Building, Layers } from 'lucide-react';
import type { Interview } from '../../../types';

interface Props {
  interview: Interview;
}

export const InterviewHeader: React.FC<Props> = ({ interview }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <CompanyLogo company={interview.company} size="lg" />
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            {interview.role}
          </h1>
          <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm md:text-base">
            <Building size={16} />
            <span className="font-medium">{interview.company}</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-row md:flex-col items-center md:items-end gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
          <Layers size={14} className="text-blue-500" />
          <span>{interview.interviewType}</span>
          <span className="text-slate-300">•</span>
          <span>{interview.difficulty}</span>
          <span className="text-slate-300">•</span>
          <span>{interview.experienceLevel}</span>
        </div>
      </div>
    </div>
  );
};
