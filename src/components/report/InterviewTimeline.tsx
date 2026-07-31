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
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
          <Clock size={20} />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Session Timeline</h3>
      </div>

      <div className="relative pl-4 border-l-2 border-slate-100 ml-4 space-y-8">
        {events.map((event) => (
          <div key={event.id} className="relative">
            {/* Timeline Dot */}
            <div className="absolute -left-[25px] top-1 bg-white border-2 border-slate-200 rounded-full p-1 shadow-sm">
              {getEventIcon(event.type)}
            </div>
            
            <div className="pl-6">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-400">{formatTime(event.timestamp)}</span>
                <span className="text-base font-semibold text-slate-800">{event.type}</span>
              </div>
              {event.questionId && (
                <div className="mt-2 text-sm text-slate-500">
                  Question: {event.questionId}
                </div>
              )}
              {event.metadata?.durationMs && (
                <div className="mt-1 text-sm text-slate-500">
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
