import React from 'react';
import { BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AnalyticsEmpty: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
        <BarChart3 className="h-12 w-12 text-blue-500" />
      </div>
      <h3 className="text-3xl font-bold text-slate-900 mb-3">No Analytics Yet</h3>
      <p className="text-slate-500 max-w-lg mb-8 text-lg">
        Complete your first mock interview to unlock your personalized Analytics Dashboard. Your insights will appear here automatically.
      </p>
      
      <button 
        onClick={() => navigate('/generate')}
        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        Start an Interview
      </button>
    </div>
  );
};
