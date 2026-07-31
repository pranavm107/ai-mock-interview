import React, { useEffect, useRef } from 'react';

interface LiveTranscriptProps {
  transcript: string;
  isListening: boolean;
  statusText?: string;
}

export const LiveTranscript: React.FC<LiveTranscriptProps> = ({ transcript, isListening, statusText }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when transcript updates
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcript, isListening, statusText]);

  if (!transcript && !isListening && !statusText) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div 
        ref={containerRef}
        className="bg-slate-50 border border-slate-200 rounded-2xl p-6 min-h-[120px] max-h-[300px] overflow-y-auto"
      >
        <p className="text-lg text-slate-700 leading-relaxed font-medium">
          {transcript}
          {isListening && (
            <span className="inline-block w-2 h-4 ml-1 bg-emerald-400 animate-pulse" />
          )}
        </p>
        {statusText && (
          <p className="text-slate-400 italic mt-2 text-sm">{statusText}</p>
        )}
      </div>
    </div>
  );
};
