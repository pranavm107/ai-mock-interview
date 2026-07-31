import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Video, Mic, FileText, BrainCircuit } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

export const UploadProgress: React.FC<Props> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  const steps = [
    { label: 'Uploading Video', icon: <Video className="w-5 h-5" /> },
    { label: 'Uploading Audio', icon: <Mic className="w-5 h-5" /> },
    { label: 'Saving Transcript', icon: <FileText className="w-5 h-5" /> },
    { label: 'Preparing AI Evaluation...', icon: <BrainCircuit className="w-5 h-5" /> }
  ];

  useEffect(() => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 8; // Random increments
      if (currentProgress > 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(onComplete, 1500); // Wait a bit at 100% before finishing
      }
      setProgress(Math.min(currentProgress, 100));

      // Update steps based on progress
      if (currentProgress < 30) setStep(0);
      else if (currentProgress < 60) setStep(1);
      else if (currentProgress < 90) setStep(2);
      else setStep(3);

    }, 200);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
      <div className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-2">
          {progress >= 100 ? 'Upload Complete' : 'Interview Finished'}
        </h2>
        <p className="text-slate-500 text-center mb-10">
          {progress >= 100 ? 'Redirecting to your results...' : 'Securely uploading your interview data.'}
        </p>

        <div className="space-y-6 mb-10">
          {steps.map((s, index) => (
            <div 
              key={index} 
              className={`flex items-center gap-4 transition-all duration-500 ${
                index <= step ? 'opacity-100 translate-x-0' : 'opacity-30 -translate-x-4'
              }`}
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                index < step || progress >= 100
                  ? 'bg-emerald-100 text-emerald-600'
                  : index === step 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-slate-100 text-slate-400'
              }`}>
                {index < step || progress >= 100 ? <CheckCircle2 className="w-5 h-5" /> : s.icon}
              </div>
              <span className={`font-medium ${index <= step ? 'text-slate-900' : 'text-slate-500'}`}>
                {s.label}
              </span>
              {index === step && progress < 100 && (
                <Loader2 className="w-4 h-4 ml-auto text-blue-500 animate-spin" />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-slate-500">Progress</span>
            <span className="text-slate-900">{Math.floor(progress)}%</span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
