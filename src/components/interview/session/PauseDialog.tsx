import React from 'react';
import { Button } from '@/components/ui/button';
import { PlayCircle, Clock } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onResume: () => void;
  elapsedSeconds: number;
}

export const PauseDialog: React.FC<Props> = ({ isOpen, onResume, elapsedSeconds }) => {
  if (!isOpen) return null;

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl border border-slate-200 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Clock size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Interview Paused</h2>
        <p className="text-slate-500 mb-6">
          Your progress and timer have been paused. Current duration: <strong className="text-slate-700">{formatTime(elapsedSeconds)}</strong>.
        </p>
        <Button 
          onClick={onResume}
          className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-xl text-lg font-semibold shadow-sm"
        >
          <PlayCircle size={20} className="mr-2" />
          Resume Session
        </Button>
      </div>
    </div>
  );
};
