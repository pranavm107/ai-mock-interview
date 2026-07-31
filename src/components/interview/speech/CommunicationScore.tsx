import React from 'react';
import { motion } from 'framer-motion';

export interface CardWrapperProps {
  children: React.ReactNode;
  title: string;
  icon?: string;
  delay?: number;
}

export const CardWrapper: React.FC<CardWrapperProps> = ({ children, title, icon, delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col"
  >
    <div className="flex items-center text-white/50 text-xs font-medium uppercase tracking-wider mb-3">
      {icon && <span className="mr-2 text-base">{icon}</span>}
      {title}
    </div>
    <div className="flex-1 flex flex-col justify-center">
      {children}
    </div>
  </motion.div>
);

export interface ScoreCircleProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export const ScoreCircle: React.FC<ScoreCircleProps> = ({ score, size = 60, strokeWidth = 4, color = "text-blue-500" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          className="text-white/10"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <motion.circle
          className={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-white font-semibold text-lg leading-none">{score}</span>
      </div>
    </div>
  );
};
