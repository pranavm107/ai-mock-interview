import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface AnalyticsErrorProps {
  message: string;
  onRetry: () => void;
}

export const AnalyticsError: React.FC<AnalyticsErrorProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
      <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="h-10 w-10 text-red-500" />
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-2">Failed to load analytics</h3>
      <p className="text-slate-500 max-w-md mb-8">{message}</p>
      
      <button 
        onClick={onRetry}
        className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all"
      >
        <RefreshCw className="w-5 h-5 mr-2" />
        Try Again
      </button>
    </div>
  );
};
