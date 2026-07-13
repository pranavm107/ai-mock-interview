import React from 'react';
import type { Interview } from '../../types';
import { Calendar, Clock, Trophy, Target, Building } from 'lucide-react';
import { InterviewStatusBadge } from './InterviewStatusBadge';

interface Props {
  interview: Interview;
}

export const InterviewSummary: React.FC<Props> = ({ interview }) => {
  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(d);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{interview.role}</h2>
          <div className="flex items-center gap-2 mt-1 text-slate-600">
            <Building size={16} />
            <span>{interview.company}</span>
          </div>
        </div>
        <InterviewStatusBadge status={interview.status} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-sm">
            <Target size={16} />
            <span>Questions</span>
          </div>
          <p className="font-semibold text-slate-900">{interview.totalQuestions}</p>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-sm">
            <Clock size={16} />
            <span>Duration</span>
          </div>
          <p className="font-semibold text-slate-900">{interview.duration} mins</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-sm">
            <Trophy size={16} />
            <span>Score</span>
          </div>
          <p className="font-semibold text-slate-900">
            {interview.score !== null ? `${interview.score}/100` : 'N/A'}
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-sm">
            <Calendar size={16} />
            <span>Completed</span>
          </div>
          <p className="font-semibold text-slate-900">{formatDate(interview.completedAt)}</p>
        </div>
      </div>
    </div>
  );
};
