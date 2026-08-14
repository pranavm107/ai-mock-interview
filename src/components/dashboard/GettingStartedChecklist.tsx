import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Upload, FileText, Sparkles, Play, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import type { DashboardData } from '../../store/useAppStore';

interface GettingStartedChecklistProps {
  metadata?: DashboardData['metadata'];
}

export const GettingStartedChecklist: React.FC<GettingStartedChecklistProps> = ({ metadata }) => {
  const navigate = useNavigate();
  const { onboardingProgress, latestDraftInterviewId, latestCompletedReportId } = metadata || {} as any;

  const stepConfig: Record<string, { title: string, icon: any, action: () => void }> = {
    'UPLOAD_RESUME': {
      title: 'Upload Resume',
      icon: Upload,
      action: () => navigate('/resume')
    },
    'ANALYZE_RESUME': {
      title: 'AI Resume Analysis',
      icon: FileText,
      action: () => navigate('/resume')
    },
    'GENERATE_INTERVIEW': {
      title: 'Generate Interview',
      icon: Sparkles,
      action: () => navigate('/generate')
    },
    'COMPLETE_INTERVIEW': {
      title: 'Complete Interview',
      icon: Play,
      action: () => {
        if (latestDraftInterviewId) {
          navigate(`/session/${latestDraftInterviewId}`);
        } else {
          navigate('/history');
        }
      }
    },
    'VIEW_FEEDBACK': {
      title: 'View AI Feedback',
      icon: Award,
      action: () => {
        if (latestCompletedReportId) {
          navigate(`/report/${latestCompletedReportId}`);
        } else {
          navigate('/history');
        }
      }
    }
  };

  const steps = onboardingProgress?.steps || [];
  const progressPercent = onboardingProgress ? Math.round((onboardingProgress.completedCount / onboardingProgress.totalSteps) * 100) : 0;



  return (
    <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Getting Started</h2>
          <p className="text-sm text-slate-500">Complete these steps to unlock the full potential of PrepPilot AI.</p>
        </div>
        
        {onboardingProgress && (
          <div className="flex flex-col items-end shrink-0">
            <span className="text-sm font-semibold text-slate-700 mb-1">
              {onboardingProgress.completedCount} / {onboardingProgress.totalSteps} Completed
            </span>
            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        {steps.map((step: any, idx: number) => {
          const config = stepConfig[step.id];
          if (!config) return null;
          
          const isCurrentStep = step.enabled && !step.completed;
          
          return (
            <motion.div 
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * idx }}
              className={`flex items-center justify-between p-4 rounded-xl border ${
                step.completed 
                  ? 'bg-emerald-50/50 border-emerald-100' 
                  : isCurrentStep
                    ? 'bg-blue-50/30 border-blue-100 shadow-sm'
                    : 'bg-slate-50/50 border-slate-100 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                {step.completed ? (
                  <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />
                ) : (
                  <Circle size={24} className={`shrink-0 ${isCurrentStep ? 'text-blue-300' : 'text-slate-300'}`} />
                )}
                
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    step.completed 
                      ? 'bg-emerald-100/50 text-emerald-600' 
                      : isCurrentStep
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-white shadow-sm text-slate-400'
                  }`}>
                    <config.icon size={16} />
                  </div>
                  <span className={`font-semibold text-sm sm:text-base ${
                    step.completed 
                      ? 'text-emerald-800' 
                      : isCurrentStep
                        ? 'text-blue-900'
                        : 'text-slate-500'
                  }`}>
                    {config.title}
                  </span>
                </div>
              </div>
              
              {!step.completed && (
                <div title={!step.enabled ? 'Complete previous step first.' : ''}>
                  <Button 
                    size="sm" 
                    onClick={config.action}
                    disabled={!step.enabled}
                    className={`shadow-sm rounded-lg text-xs sm:text-sm h-8 sm:h-9 ${
                      isCurrentStep 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-slate-200 text-slate-400 hover:bg-slate-200 cursor-not-allowed'
                    }`}
                  >
                    {step.enabled ? 'Start' : 'Locked'}
                  </Button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
