import React from 'react';
import type { WebcamState } from '../../../hooks/useWebcam';

interface Props {
  state: WebcamState;
  elapsedSeconds?: number;
}

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const RecordingBadge: React.FC<Props> = ({ state, elapsedSeconds = 0 }) => {
  if (state === 'ready') return null;

  let colorClass = 'bg-slate-500';
  let textColorClass = 'text-white';
  let text = 'Ready';
  let icon = <span className={`relative inline-flex rounded-full w-2 h-2 ${colorClass}`} />;

  switch (state) {
    case 'camera_on':
      colorClass = 'bg-slate-800';
      textColorClass = 'text-slate-200';
      text = 'LIVE';
      icon = <span className={`relative inline-flex rounded-full w-2 h-2 bg-blue-500`} />;
      break;
    case 'recording':
      colorClass = 'bg-slate-800';
      textColorClass = 'text-white';
      text = `REC ${formatTime(elapsedSeconds)}`;
      icon = (
        <div className="relative flex items-center justify-center w-2.5 h-2.5">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping bg-rose-500`} />
          <span className={`relative inline-flex rounded-full w-2 h-2 bg-rose-500`} />
        </div>
      );
      break;
    case 'paused':
      colorClass = 'bg-amber-500/20';
      textColorClass = 'text-amber-500';
      text = 'PAUSED';
      icon = <span className="font-bold text-[10px] tracking-tighter leading-none">||</span>;
      break;
    case 'error':
      colorClass = 'bg-rose-500/20';
      textColorClass = 'text-rose-500';
      text = 'ERROR';
      break;
  }

  return (
    <div className={`absolute top-4 left-4 z-10 flex items-center gap-2 px-2.5 py-1.5 backdrop-blur-md rounded-md shadow-sm border border-white/5 ${colorClass} ${textColorClass} text-[11px] font-bold tracking-wider uppercase transition-colors`}>
      {icon}
      <span>{text}</span>
    </div>
  );
};
