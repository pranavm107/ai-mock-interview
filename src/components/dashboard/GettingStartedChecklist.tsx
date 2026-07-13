import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Upload, FileText, Sparkles, Play, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const GettingStartedChecklist: React.FC = () => {
  const steps = [
    { id: 1, title: 'Upload Resume', completed: true, icon: Upload },
    { id: 2, title: 'AI Resume Analysis', completed: true, icon: FileText },
    { id: 3, title: 'Generate Interview', completed: false, icon: Sparkles },
    { id: 4, title: 'Complete Interview', completed: false, icon: Play },
    { id: 5, title: 'View AI Feedback', completed: false, icon: Award },
  ];

  return (
    <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 p-6 sm:p-8">
      <h2 className="text-xl font-bold text-slate-900 mb-2">Getting Started</h2>
      <p className="text-sm text-slate-500 mb-6">Complete these steps to unlock the full potential of PrepPilot AI.</p>
      
      <div className="space-y-4">
        {steps.map((step, idx) => (
          <motion.div 
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * idx }}
            className={`flex items-center justify-between p-4 rounded-xl border ${
              step.completed 
                ? 'bg-emerald-50/50 border-emerald-100' 
                : 'bg-slate-50 border-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              {step.completed ? (
                <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />
              ) : (
                <Circle size={24} className="text-slate-300 shrink-0" />
              )}
              
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${step.completed ? 'bg-emerald-100/50 text-emerald-600' : 'bg-white shadow-sm text-slate-400'}`}>
                  <step.icon size={16} />
                </div>
                <span className={`font-semibold text-sm sm:text-base ${step.completed ? 'text-emerald-800' : 'text-slate-600'}`}>
                  {step.title}
                </span>
              </div>
            </div>
            
            {!step.completed && idx === steps.findIndex(s => !s.completed) && (
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-lg text-xs sm:text-sm h-8 sm:h-9">
                Start
              </Button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
