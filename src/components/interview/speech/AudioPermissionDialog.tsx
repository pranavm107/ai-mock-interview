import React from 'react';
import { Mic, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  isOpen: boolean;
  onRetry: () => void;
  onCancel: () => void;
}

export const AudioPermissionDialog: React.FC<Props> = ({ isOpen, onRetry, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl border border-slate-200 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mic size={32} />
          <div className="absolute ml-8 mt-8 bg-white rounded-full">
            <AlertCircle size={20} className="text-red-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Microphone Access Denied</h2>
        <p className="text-slate-500 mb-8">
          Microphone permission is required to answer using speech.
        </p>
        <div className="flex gap-4">
          <Button 
            onClick={onCancel}
            variant="outline"
            className="flex-1 h-12 rounded-xl border-slate-200 text-slate-600 font-medium hover:bg-slate-50"
          >
            Type Instead
          </Button>
          <Button 
            onClick={onRetry}
            className="flex-1 h-12 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800"
          >
            Allow Again
          </Button>
        </div>
      </div>
    </div>
  );
};
