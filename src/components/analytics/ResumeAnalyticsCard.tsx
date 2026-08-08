import React from 'react';
import type { ResumeAnalytics } from '../../types/analytics';
import { FileText, Briefcase, Code, CheckSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ResumeAnalyticsCardProps {
  data: ResumeAnalytics | null;
}

export const ResumeAnalyticsCard: React.FC<ResumeAnalyticsCardProps> = ({ data }) => {
  const navigate = useNavigate();

  if (!data) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center h-full min-h-[280px]">
        <FileText className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Resume Found</h3>
        <p className="text-sm text-slate-500 mb-6">
          Upload your resume to receive AI scoring, ATS compatibility checks, and personalized career coaching.
        </p>
        <button 
          onClick={() => navigate('/resume')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          Go to Resume Manager
        </button>
      </div>
    );
  }

  const metrics = [
    { title: 'ATS Score', value: data.atsScore || 0, suffix: '/100', icon: <CheckSquare className="w-5 h-5 text-green-500" /> },
    { title: 'Overall Quality', value: data.resumeScore || 0, suffix: '/100', icon: <FileText className="w-5 h-5 text-blue-500" /> },
    { title: 'Projects', value: data.projectsCount, suffix: ' total', icon: <Briefcase className="w-5 h-5 text-orange-500" /> },
    { title: 'Skills Extracted', value: data.skillsCount, suffix: ' total', icon: <Code className="w-5 h-5 text-purple-500" /> }
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Resume Analytics</h3>
        <button 
          onClick={() => navigate('/resume')}
          className="text-xs text-blue-600 hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
        >
          View Full Profile &rarr;
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, i) => (
          <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start space-x-3">
            <div className="mt-1">{metric.icon}</div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{metric.title}</p>
              <div className="flex items-baseline mt-1">
                <span className="text-xl font-bold text-slate-900">{metric.value}</span>
                <span className="text-xs text-slate-500 ml-1">{metric.suffix}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
