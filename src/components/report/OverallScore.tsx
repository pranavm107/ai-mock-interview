import React, { useEffect, useState } from 'react';
import type { OverallEvaluation } from '../../../server/src/types/interviewReport';
import { motion, useAnimation } from 'framer-motion';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from 'recharts';

interface Props {
  evaluation: OverallEvaluation;
}

export const OverallScore: React.FC<Props> = ({ evaluation }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    // Animate score from 0 to target
    const duration = 1500;
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      // easeOutQuart
      const currentProgress = 1 - Math.pow(1 - progress, 4);
      
      setDisplayScore(Math.round(currentProgress * evaluation.overallScore));

      if (frame === totalFrames) {
        clearInterval(counter);
        setDisplayScore(evaluation.overallScore);
      }
    }, frameRate);

    return () => clearInterval(counter);
  }, [evaluation.overallScore]);

  const radarData = [
    { subject: 'Technical', A: evaluation.technicalScore, fullMark: 100 },
    { subject: 'Problem Solving', A: evaluation.problemSolvingScore, fullMark: 100 },
    { subject: 'Communication', A: evaluation.communicationScore, fullMark: 100 },
    { subject: 'Behavioral', A: evaluation.behavioralScore, fullMark: 100 },
    { subject: 'Confidence', A: evaluation.confidenceScore, fullMark: 100 },
    { subject: 'Time Mgmt', A: evaluation.timeManagementScore, fullMark: 100 },
  ];

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
      <div className="flex flex-col md:flex-row items-center gap-12">
        
        {/* Left Side: Score Ring */}
        <div className="flex flex-col items-center justify-center shrink-0 w-full md:w-1/3">
          <div className="relative w-48 h-48 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 border-8 border-white shadow-lg">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                className="text-slate-100"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="88"
                cx="96"
                cy="96"
              />
              <motion.circle
                className={evaluation.overallScore >= 80 ? 'text-emerald-500' : evaluation.overallScore >= 60 ? 'text-orange-500' : 'text-red-500'}
                strokeWidth="8"
                strokeDasharray={552.92}
                strokeDashoffset={552.92 - (552.92 * evaluation.overallScore) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="88"
                cx="96"
                cy="96"
                initial={{ strokeDashoffset: 552.92 }}
                animate={{ strokeDashoffset: 552.92 - (552.92 * evaluation.overallScore) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="text-center z-10 flex flex-col items-center justify-center">
              <div className="flex items-baseline">
                <span className="text-5xl font-bold text-slate-800 tracking-tight">{displayScore}</span>
                <span className="text-lg font-medium text-slate-500 ml-1">/100</span>
              </div>
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Overall Score</span>
            </div>
          </div>
          
          <div className="mt-8 bg-slate-50 border border-slate-100 rounded-2xl p-5 w-full text-center">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Score Analysis</h4>
            <ul className="space-y-1.5 text-slate-700 font-medium text-sm">
              <li className="flex items-center justify-center gap-2">
                <span className={evaluation.technicalScore >= 80 ? 'text-emerald-500' : 'text-orange-500'}>•</span> 
                {evaluation.technicalScore >= 80 ? 'Excellent Technical Knowledge' : 'Needs Technical Review'}
              </li>
              <li className="flex items-center justify-center gap-2">
                <span className={evaluation.communicationScore >= 80 ? 'text-emerald-500' : 'text-orange-500'}>•</span> 
                {evaluation.communicationScore >= 80 ? 'Strong Communication' : 'Work on Clarity'}
              </li>
              <li className="flex items-center justify-center gap-2">
                <span className={evaluation.timeManagementScore >= 80 ? 'text-emerald-500' : 'text-orange-500'}>•</span> 
                {evaluation.timeManagementScore >= 80 ? 'Good Time Management' : 'Improve Answer Pacing'}
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side: Radar Chart */}
        <div className="flex-1 w-full h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 text-center mb-4">Performance Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                tick={{ fill: '#94a3b8', fontSize: 10 }}
              />
              <Radar 
                name="Score" 
                dataKey="A" 
                stroke="#4f46e5" 
                strokeWidth={2}
                fill="#6366f1" 
                fillOpacity={0.2} 
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
      </div>
    </div>
  );
};
