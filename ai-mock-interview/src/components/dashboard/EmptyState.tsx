import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel?: string;
  actionTo?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  actionLabel, 
  actionTo 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full bg-white border border-slate-200 border-dashed rounded-[20px] p-12 flex flex-col items-center justify-center text-center shadow-sm"
    >
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100 relative">
        <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50"></div>
        <Icon size={32} className="text-slate-400 relative z-10" />
      </div>
      
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">
        {description}
      </p>
      
      {actionLabel && actionTo && (
        <Link to={actionTo}>
          <Button className="bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm px-6 h-11 text-sm font-semibold rounded-lg transition-all">
            {actionLabel}
          </Button>
        </Link>
      )}
    </motion.div>
  );
};
