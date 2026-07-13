import React from 'react';
import type { InterviewStatus } from '../../types';
import { FileEdit, CheckCircle2, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Props {
  status: InterviewStatus;
  className?: string;
}

export const InterviewStatusBadge: React.FC<Props> = ({ status, className = '' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'Draft':
        return { 
          bg: 'bg-slate-100 dark:bg-slate-800', 
          text: 'text-slate-700 dark:text-slate-300', 
          border: 'border-slate-200 dark:border-slate-700',
          Icon: FileEdit 
        };
      case 'Ready':
        return { 
          bg: 'bg-blue-50 dark:bg-blue-900/30', 
          text: 'text-blue-700 dark:text-blue-400', 
          border: 'border-blue-200 dark:border-blue-800/50',
          Icon: CheckCircle2 
        };
      case 'In Progress':
        return { 
          bg: 'bg-orange-50 dark:bg-orange-900/30', 
          text: 'text-orange-700 dark:text-orange-400', 
          border: 'border-orange-200 dark:border-orange-800/50',
          Icon: Clock 
        };
      case 'Completed':
        return { 
          bg: 'bg-green-50 dark:bg-green-900/30', 
          text: 'text-green-700 dark:text-green-400', 
          border: 'border-green-200 dark:border-green-800/50',
          Icon: CheckCircle 
        };
      case 'Cancelled':
        return { 
          bg: 'bg-red-50 dark:bg-red-900/30', 
          text: 'text-red-700 dark:text-red-400', 
          border: 'border-red-200 dark:border-red-800/50',
          Icon: XCircle 
        };
      default:
        return { 
          bg: 'bg-slate-100 dark:bg-slate-800', 
          text: 'text-slate-700 dark:text-slate-300', 
          border: 'border-slate-200 dark:border-slate-700',
          Icon: FileEdit 
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.Icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} shadow-sm ${className}`}>
      <Icon size={14} className="stroke-[2.5px]" />
      {status}
    </span>
  );
};
