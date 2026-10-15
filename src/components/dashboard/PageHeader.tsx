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
  secondaryActionLabel?: string;
  secondaryActionIcon?: LucideIcon;
  secondaryActionTo?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  actionLabel, 
  actionIcon: ActionIcon, 
  actionTo,
  secondaryActionLabel,
  secondaryActionIcon: SecondaryActionIcon,
  secondaryActionTo
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 sm:mb-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80 shadow-2xs shrink-0">
          <Icon size={20} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-xl leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto">
        {secondaryActionLabel && secondaryActionTo && (
          <Link to={secondaryActionTo} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-2xs px-4 h-8.5 sm:h-9 text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-1.5 transition-all">
              {SecondaryActionIcon && <SecondaryActionIcon size={16} />}
              {secondaryActionLabel}
            </Button>
          </Link>
        )}
        
        {actionLabel && actionTo && (
          <Link to={actionTo} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 shadow-2xs px-4 h-8.5 sm:h-9 text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-1.5 transition-all">
              {ActionIcon && <ActionIcon size={16} />}
              {actionLabel}
            </Button>
          </Link>
        )}
      </div>
    </motion.div>
  );
};
