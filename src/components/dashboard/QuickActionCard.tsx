import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  to: string;
  colorClass: string;
  delay?: number;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({ title, description, icon: Icon, to, colorClass, delay = 0 }) => {
  return (
    <Link to={to} className="block">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay }}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white border border-slate-200 rounded-[20px] p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group h-full flex flex-col justify-between"
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${colorClass}`}>
            <Icon size={24} className={colorClass.replace('bg-', 'text-').replace('-50', '-600')} />
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-slate-100 shadow-sm">
            <ArrowRight size={16} className="text-slate-400 group-hover:text-blue-600" />
          </div>
        </div>
        
        <div>
          <h3 className="font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {description}
          </p>
        </div>
      </motion.div>
    </Link>
  );
};
