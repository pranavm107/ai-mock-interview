import React from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  error: string | null;
}

export const CameraError: React.FC<Props> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm mt-4 shadow-sm">
      <AlertCircle size={18} className="shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-semibold mb-1">Webcam Error</p>
        <p className="text-red-500">{error}</p>
      </div>
    </div>
  );
};
