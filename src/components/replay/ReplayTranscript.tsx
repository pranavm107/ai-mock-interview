import React, { useEffect, useRef, useMemo } from 'react';
import type { ReplayTranscript as TranscriptType } from '../../types/replay';

interface Props {
  transcript: TranscriptType[];
  currentTimeMs: number;
  onSeek: (timeMs: number) => void;
}

export const ReplayTranscript: React.FC<Props> = React.memo(({ transcript, currentTimeMs, onSeek }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const activeIndex = useMemo(() => {
    return transcript.findIndex(t => currentTimeMs >= t.startTimeMs && currentTimeMs <= t.endTimeMs);
  }, [transcript, currentTimeMs]);

  useEffect(() => {
    // Basic auto-scroll only when active block changes
    if (containerRef.current && activeIndex !== -1) {
      const activeElement = containerRef.current.querySelector('.active-transcript');
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeIndex]);

  if (!transcript || transcript.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400">
        No transcript available.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      {transcript.map((t, idx) => {
        const isActive = currentTimeMs >= t.startTimeMs && currentTimeMs <= t.endTimeMs;
        const isPast = currentTimeMs > t.endTimeMs;
        
        return (
          <div 
            key={idx} 
            className={`flex gap-4 cursor-pointer p-3 rounded-lg transition-colors ${isActive ? 'active-transcript bg-primary-50 dark:bg-primary-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            onClick={() => onSeek(t.startTimeMs)}
          >
            <div className="shrink-0 w-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                t.speaker === 'AI' 
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400' 
                  : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400'
              }`}>
                {t.speaker === 'AI' ? 'AI' : 'You'}
              </div>
            </div>
            <div className="flex-1 pt-1">
              <p className={`text-sm leading-relaxed ${
                isActive ? 'text-slate-900 dark:text-white font-medium' : 
                isPast ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400 dark:text-slate-500'
              }`}>
                {t.text}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
});
