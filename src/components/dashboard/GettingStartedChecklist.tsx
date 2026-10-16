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
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-0.5">Getting Started</h2>
          <p className="text-xs sm:text-sm text-slate-500">Complete these steps to unlock the full potential of PrepPilot AI.</p>
        </div>
        
        {onboardingProgress && (
          <div className="flex flex-col items-start sm:items-end shrink-0">
            <span className="text-xs font-semibold text-slate-700 mb-1">
              {onboardingProgress.completedCount} / {onboardingProgress.totalSteps} Completed
            </span>
            <div className="w-28 sm:w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-2.5">
        {steps.map((step: any, idx: number) => {
          const config = stepConfig[step.id];
          if (!config) return null;
          
          const isCurrentStep = step.enabled && !step.completed;
          
          return (
            <motion.div 
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * idx }}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                step.completed
                  ? 'bg-emerald-50/40 border-emerald-100'
                  : isCurrentStep
                    ? 'bg-blue-50/25 border-blue-100 shadow-2xs'
                    : 'bg-slate-50/40 border-slate-100 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {step.completed ? (
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                ) : (
                  <Circle size={18} className={`shrink-0 ${isCurrentStep ? 'text-blue-400' : 'text-slate-300'}`} />
                )}

                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1.5 rounded-md shrink-0 ${
                    step.completed
                      ? 'bg-emerald-100/60 text-emerald-600'
                      : isCurrentStep
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-white shadow-2xs text-slate-400'
                  }`}>
                    <config.icon size={14} />
                  </div>
                  <span className={`font-semibold text-xs sm:text-sm truncate ${
                    step.completed 
                      ? 'text-emerald-800' 
                      : isCurrentStep
                        ? 'text-blue-900'
                        : 'text-slate-600'
                  }`}>
                    {config.title}
                  </span>
                </div>
              </div>
              
              {!step.completed && (
                <div title={!step.enabled ? 'Complete previous step first.' : ''} className="shrink-0 ml-2">
                  <Button 
                    size="sm" 
                    onClick={config.action}
                    disabled={!step.enabled}
                    className={`shadow-2xs rounded-lg text-xs h-7.5 px-3 font-semibold ${
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
