import React from 'react';
import { InterviewCard } from './InterviewCard';
import type { Interview } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  interviews: Interview[];
  loading: boolean;
  onDelete: (id: string) => void;
  onContinue: (id: string) => void;
  onView: (id: string) => void;
}

export const InterviewList: React.FC<Props> = ({ 
  interviews, 
  loading, 
  onDelete, 
  onContinue, 
  onView 
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-[20px] p-5 shadow-sm flex flex-col h-full min-h-[300px]">
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32 rounded-lg" />
                  <Skeleton className="h-3 w-24 rounded-lg" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-6">
              <Skeleton className="h-8 w-full rounded-lg" />
              <Skeleton className="h-8 w-full rounded-lg" />
              <div className="col-span-2 flex gap-2">
                <Skeleton className="h-6 w-16 rounded-lg" />
                <Skeleton className="h-6 w-20 rounded-lg" />
              </div>
              <Skeleton className="col-span-2 h-4 w-40 rounded-lg mt-2" />
              <Skeleton className="col-span-2 h-4 w-32 rounded-lg" />
            </div>

            <div className="flex gap-3 mt-auto pt-4 border-t border-slate-100">
              <Skeleton className="h-11 flex-1 rounded-xl" />
              <Skeleton className="h-11 w-11 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (interviews.length === 0) {
    return null; // Empty state handled by parent component now
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <AnimatePresence>
        {interviews.map((interview) => (
          <InterviewCard 
            key={interview.id} 
            interview={interview} 
            onDelete={onDelete}
            onContinue={onContinue}
            onView={onView}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};
