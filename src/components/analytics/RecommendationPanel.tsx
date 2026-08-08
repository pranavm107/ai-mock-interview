import React from 'react';
import type { AnalyticsRecommendation } from '../../types/analytics';
import { Lightbulb, AlertTriangle, Info, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecommendationPanelProps {
  recommendations: AnalyticsRecommendation[];
}

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({ recommendations }) => {
  const navigate = useNavigate();

  if (recommendations.length === 0) return null;

  const handleAction = (rec: AnalyticsRecommendation) => {
    const lowerId = rec.id.toLowerCase();
    const category = rec.category.toUpperCase();

    if (lowerId.includes('resume') || category === 'RESUME') {
      navigate('/resume');
    } else if (lowerId.includes('history')) {
      navigate('/history');
    } else if (category === 'SKILLS') {
      navigate('/career');
    } else {
      navigate('/generate');
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
          bg: 'bg-white',
          border: 'border-l-4 border-l-red-500 border-slate-200',
          badge: 'bg-red-100 text-red-700'
        };
      case 'MEDIUM':
        return {
          icon: <Lightbulb className="w-5 h-5 text-yellow-500" />,
          bg: 'bg-white',
          border: 'border-l-4 border-l-yellow-500 border-slate-200',
          badge: 'bg-yellow-100 text-yellow-700'
        };
      default:
        return {
          icon: <Info className="w-5 h-5 text-blue-500" />,
          bg: 'bg-white',
          border: 'border-l-4 border-l-blue-500 border-slate-200',
          badge: 'bg-blue-100 text-blue-700'
        };
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">AI Coaching Recommendations</h3>
      
      <div className="space-y-4">
        {recommendations.map((rec) => {
          const config = getPriorityConfig(rec.priority);
          return (
            <div 
              key={rec.id} 
              className={`p-5 rounded-xl border ${config.bg} ${config.border} flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">{config.icon}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900">{rec.title}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${config.badge}`}>
                      {rec.priority}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-100 text-slate-600">
                      {rec.category}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{rec.description}</p>
                </div>
              </div>
              
              <div className="flex items-center shrink-0">
                <button 
                  onClick={() => handleAction(rec)}
                  className="flex items-center px-4 py-2 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-sm font-medium rounded-lg shadow-sm transition-all group focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {rec.action}
                  <ArrowRight className="w-4 h-4 ml-2 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
