import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface OverallScoreCardProps {
  score: number;
}

export const OverallScoreCard: React.FC<OverallScoreCardProps> = ({ score }) => {
  const [displayScore, setDisplayScore] = useState(0);

  // Animate score counting up
  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const stepTime = Math.abs(Math.floor(duration / steps));
    let current = displayScore;
    const increment = (score - current) / steps;
    
    if (score === current) return;

    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= score) || (increment < 0 && current <= score)) {
        clearInterval(timer);
        setDisplayScore(score);
      } else {
        setDisplayScore(Math.round(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score, displayScore]);

  const getColorClass = (val: number) => {
    if (val >= 90) return 'text-emerald-500';
    if (val >= 75) return 'text-blue-500';
    if (val >= 60) return 'text-orange-500';
    return 'text-rose-500';
  };

  const getStrokeColor = (val: number) => {
    if (val >= 90) return '#10b981'; // emerald-500
    if (val >= 75) return '#3b82f6'; // blue-500
    if (val >= 60) return '#f97316'; // orange-500
    return '#f43f5e'; // rose-500
  };

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
      
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Overall Performance</h3>
      
      <div className="relative flex items-center justify-center">
        <svg className="transform -rotate-90 w-40 h-40">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-slate-100"
          />
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            stroke={getStrokeColor(score)}
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold ${getColorClass(displayScore)}`}>
            {displayScore}
          </span>
          <span className="text-xs font-medium text-slate-400 mt-1">/ 100</span>
        </div>
      </div>
      
    </div>
  );
};
