import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  actionTo?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  actionLabel, 
  actionIcon: ActionIcon, 
  actionTo 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm shrink-0">
          <Icon size={24} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1 max-w-xl leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      
      {actionLabel && actionTo && (
        <Link to={actionTo} className="shrink-0 w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 shadow-sm px-6 h-11 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all">
            {ActionIcon && <ActionIcon size={18} />}
            {actionLabel}
          </Button>
        </Link>
      )}
    </motion.div>
  );
};
