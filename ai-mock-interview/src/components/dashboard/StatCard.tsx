import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="relative p-[1px] rounded-[20px] bg-gradient-to-br from-slate-200 to-slate-100 hover:from-blue-400 hover:to-purple-500 transition-all duration-300 group"
    >
      <div className="bg-white rounded-[20px] p-6 h-full flex flex-col justify-between shadow-sm group-hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-500">{title}</h3>
          <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg text-blue-600 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-blue-100/50">
            <Icon size={20} />
          </div>
        </div>
        
        <div className="flex items-baseline gap-2">
          <motion.h2 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: delay + 0.2 }}
            className="text-3xl font-bold text-slate-900"
          >
            {value}
          </motion.h2>
          
          {trend && (
            <span className={`text-xs font-semibold ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.isPositive ? '+' : '-'}{trend.value}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
