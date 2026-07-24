import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface CareerErrorProps {
  message: string;
  onRetry: () => void;
}

export const CareerError: React.FC<CareerErrorProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-red-50 rounded-2xl border border-red-100 p-8 text-center">
      <div className="bg-red-100 p-4 rounded-full mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-xl font-bold text-red-900 mb-2">Failed to load Career Coach</h3>
      <p className="text-red-700 mb-6 max-w-md">{message}</p>
      <button 
        onClick={onRetry}
        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors shadow-sm"
      >
        <RefreshCw className="w-4 h-4" /> Try Again
      </button>
    </div>
  );
};
