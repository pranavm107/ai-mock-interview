import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface MetricCardProps {
  title: string;
  score: number;
  icon: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, score, icon }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const duration = 800;
    const steps = 40;
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
    if (val >= 90) return 'text-emerald-500 bg-emerald-50 border-emerald-100';
    if (val >= 75) return 'text-blue-500 bg-blue-50 border-blue-100';
    if (val >= 60) return 'text-orange-500 bg-orange-50 border-orange-100';
    return 'text-rose-500 bg-rose-50 border-rose-100';
  };
  
  const getProgressColor = (val: number) => {
    if (val >= 90) return 'bg-emerald-500';
    if (val >= 75) return 'bg-blue-500';
    if (val >= 60) return 'bg-orange-500';
    return 'bg-rose-500';
  };

  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg border ${getColorClass(score)}`}>
          {icon}
        </div>
        <h4 className="text-sm font-medium text-slate-700">{title}</h4>
      </div>
      
      <div className="flex justify-between items-end mb-2">
        <span className={`text-2xl font-bold ${getColorClass(displayScore).split(' ')[0]}`}>
          {displayScore}
        </span>
        <span className="text-xs font-medium text-slate-400 mb-1">/ 100</span>
      </div>
      
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${getProgressColor(score)}`}
        />
      </div>
    </div>
  );
};
