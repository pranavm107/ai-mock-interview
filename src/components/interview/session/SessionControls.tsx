import React from 'react';
import { Button } from '@/components/ui/button';
import { PauseCircle, CheckSquare, LogOut } from 'lucide-react';

interface Props {
  onPause: () => void;
  onFinish: () => void;
  onLeave: () => void;
  disabled?: boolean;
}

export const SessionControls: React.FC<Props> = ({ onPause, onFinish, onLeave, disabled }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-8 border-t border-slate-100">
      <Button 
        onClick={onLeave}
        disabled={disabled}
        variant="ghost"
        className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-4"
      >
        <LogOut size={16} className="mr-2" /> Leave Session
      </Button>
      
      <div className="flex gap-3">
        <Button 
          onClick={onPause}
          disabled={disabled}
          variant="outline"
          className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 px-6 rounded-xl"
        >
          <PauseCircle size={18} className="mr-2" /> Pause
        </Button>
        <Button 
          onClick={onFinish}
          disabled={disabled}
          className="bg-slate-800 hover:bg-slate-900 text-white px-6 rounded-xl"
        >
          <CheckSquare size={18} className="mr-2" /> Finish
        </Button>
      </div>
    </div>
  );
};
