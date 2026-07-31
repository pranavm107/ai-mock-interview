import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  answeredCount: number;
  totalCount: number;
  elapsedSeconds: number;
}

export const FinishDialog: React.FC<Props> = ({ isOpen, onConfirm, onCancel, answeredCount, totalCount, elapsedSeconds }) => {
  if (!isOpen) return null;

  const formatTime = (totalSeconds: number) => {
    const m = Math.ceil(totalSeconds / 60);
    return `${m} min`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Finish Interview?</h2>
        
        <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100 flex justify-around">
          <div className="text-center">
            <p className="text-sm font-medium text-slate-500 mb-1">Answered</p>
            <p className="text-xl font-bold text-slate-900">{answeredCount} / {totalCount}</p>
          </div>
          <div className="w-px bg-slate-200"></div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-500 mb-1">Duration</p>
            <p className="text-xl font-bold text-slate-900">{formatTime(elapsedSeconds)}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={onCancel}
            variant="outline"
            className="flex-1 h-12 rounded-xl border-slate-200 text-slate-600"
          >
            <X size={18} className="mr-2" /> Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            className="flex-1 h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold"
          >
            <CheckCircle2 size={18} className="mr-2" /> Finish
          </Button>
        </div>
      </div>
    </div>
  );
};
