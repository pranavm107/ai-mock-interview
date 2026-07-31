import React from 'react';
import type { ReplayTimelineEvent } from '../../types/replay';

interface Props {
  timeline: ReplayTimelineEvent[];
  currentTimeMs: number;
  onSeek: (timeMs: number) => void;
}

export const ReplayTimeline: React.FC<Props> = React.memo(({ timeline, currentTimeMs, onSeek }) => {
  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h3 className="font-semibold text-slate-900 dark:text-white">Timeline</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-6 relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
        
        <div className="space-y-6">
          {timeline.map(evt => {
            const isPast = currentTimeMs >= evt.timeOffsetMs;
            
            return (
              <div 
                key={evt.id} 
                className="relative flex gap-4 cursor-pointer group"
                onClick={() => onSeek(evt.timeOffsetMs)}
                role="button"
                aria-label={`Seek to ${evt.type} at ${Math.floor(evt.timeOffsetMs / 60000)}:${(Math.floor(evt.timeOffsetMs / 1000) % 60).toString().padStart(2, '0')}`}
              >
                <div className={`shrink-0 w-4 h-4 mt-1 ml-0.5 rounded-full border-2 bg-white dark:bg-slate-900 transition-colors z-10 ${
                  isPast 
                    ? 'border-primary-500 bg-primary-100 dark:bg-primary-900' 
                    : 'border-slate-300 dark:border-slate-600 group-hover:border-primary-300'
                }`}></div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className={`text-sm font-medium ${isPast ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                      {evt.type}
                    </span>
                    <span className="text-xs text-slate-400">
                      {Math.floor(evt.timeOffsetMs / 60000)}:{(Math.floor(evt.timeOffsetMs / 1000) % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
