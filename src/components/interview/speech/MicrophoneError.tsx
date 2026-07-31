import React from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  error: string | null;
}

export const MicrophoneError: React.FC<Props> = ({ error }) => {
  if (!error || error === 'Microphone permission denied') return null;

  return (
    <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm mb-4">
      <AlertCircle size={18} className="shrink-0 mt-0.5" />
      <p>{error}</p>
    </div>
  );
};
