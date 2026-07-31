import React from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onEnable: () => void;
}

export const CameraPermissionCard: React.FC<Props> = ({ onEnable }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center transition-all hover:bg-slate-100/50 hover:border-slate-300">
      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 text-slate-400">
        <Camera size={32} />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">Camera</h3>
      <p className="text-slate-500 mb-8 max-w-sm">
        Your interview can be recorded. Enable your webcam to get the most realistic interview experience.
      </p>
      <Button 
        onClick={onEnable}
        className="h-12 px-8 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-medium shadow-md shadow-slate-900/10 transition-all hover:-translate-y-0.5"
      >
        Enable Camera
      </Button>
    </div>
  );
};
