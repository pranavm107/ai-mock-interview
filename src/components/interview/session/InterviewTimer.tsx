import React from 'react';
import { Clock } from 'lucide-react';

interface Props {
  elapsedSeconds: number;
}

export const InterviewTimer: React.FC<Props> = ({ elapsedSeconds }) => {
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const parts = [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ];
    
    return parts.join(':');
  };

  return (
    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-slate-700 font-mono font-medium shadow-sm">
      <Clock size={16} className="text-blue-500" />
      <span>{formatTime(elapsedSeconds)}</span>
    </div>
  );
};
