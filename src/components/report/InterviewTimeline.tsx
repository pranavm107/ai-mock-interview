import React from 'react';
import { Clock, Play, CheckCircle2, MessageSquare, SkipForward, Info } from 'lucide-react';
import type { SessionEvent } from '../../../server/src/types/interviewSession';

interface Props {
  events: SessionEvent[];
}

export const InterviewTimeline: React.FC<Props> = ({ events }) => {
  if (!events || events.length === 0) return null;

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getEventIcon = (type: string) => {
    if (type === 'Interview Started') return <Play size={16} className="text-blue-500" />;
    if (type === 'Interview Completed') return <CheckCircle2 size={16} className="text-emerald-500" />;
    if (type === 'Question Answered') return <MessageSquare size={16} className="text-indigo-500" />;
    if (type === 'Question Skipped') return <SkipForward size={16} className="text-orange-500" />;
    return <Info size={16} className="text-slate-400" />;
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg">
          <Clock size={18} />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-800">Session Timeline</h3>
      </div>

      <div className="relative pl-3 border-l-2 border-slate-100 ml-3 space-y-4">
        {events.map((event) => (
          <div key={event.id} className="relative">
            {/* Timeline Dot */}
            <div className="absolute -left-[20px] top-0.5 bg-white border border-slate-200 rounded-full p-1 shadow-2xs">
              {getEventIcon(event.type)}
            </div>
            
            <div className="pl-4">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-slate-400">{formatTime(event.timestamp)}</span>
                <span className="text-xs sm:text-sm font-semibold text-slate-800">{event.type}</span>
              </div>
              {event.questionId && (
                <div className="mt-0.5 text-xs text-slate-500">
                  Question: {event.questionId}
                </div>
              )}
              {event.metadata?.durationMs && (
                <div className="mt-0.5 text-xs text-slate-500">
                  Duration: {Math.round(event.metadata.durationMs / 1000)}s
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
