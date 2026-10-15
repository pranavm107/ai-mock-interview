import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface CareerErrorProps {
  message: string;
  onRetry: () => void;
}

export const CareerError: React.FC<CareerErrorProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] bg-red-50/70 rounded-xl border border-red-100 p-6 sm:p-8 text-center">
      <div className="bg-red-100 p-3 rounded-full mb-3">
        <AlertCircle className="w-6 h-6 text-red-500" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-red-900 mb-1">Failed to load Career Coach</h3>
      <p className="text-xs sm:text-sm text-red-700 mb-4 max-w-md leading-relaxed">{message}</p>
      <button 
        onClick={onRetry}
        className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-medium h-8.5 px-4 rounded-lg transition-colors shadow-xs text-xs sm:text-sm"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Try Again
      </button>
    </div>
  );
};
