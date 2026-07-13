import React, { useState } from 'react';
import { Calendar, Clock, Trash2, ArrowRight, Eye, Play, FileText, Award, AlertCircle } from 'lucide-react';
import type { Interview } from '../../types';
import { InterviewStatusBadge } from './InterviewStatusBadge';
import { CompanyLogo } from './CompanyLogo';
import { InterviewProgress } from './InterviewProgress';
import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Props {
  interview: Interview;
  onDelete: (id: string) => void;
  onContinue: (id: string) => void;
  onView: (id: string) => void;
}

export const InterviewCard: React.FC<Props> = ({ interview, onDelete, onContinue, onView }) => {
  const [showDelete, setShowDelete] = useState(false);

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(d);
  };

  const getAction = () => {
    switch (interview.status) {
      case 'Draft':
      case 'Ready':
        return (
          <button 
            aria-label="Start Mock Interview"
            onClick={() => onContinue(interview.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 hover:shadow-md transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Start Mock Interview <ArrowRight size={16} />
          </button>
        );
      case 'In Progress':
        return (
          <button 
            aria-label="Continue Interview"
            onClick={() => onContinue(interview.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 hover:shadow-md transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          >
            Continue Interview <Play size={16} />
          </button>
        );
      case 'Completed':
        return (
          <button 
            aria-label="View Report"
            onClick={() => onView(interview.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
          >
            <Eye size={16} /> View Report
          </button>
        );
      case 'Cancelled':
        return (
          <button 
            aria-label="Interview Cancelled"
            disabled
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-100 text-slate-400 rounded-xl font-medium cursor-not-allowed"
          >
            <AlertCircle size={16} /> Interview Cancelled
          </button>
        );
      default:
        return null;
    }
  };

  // Determine completed questions based on phase 3.3 data (if present) or mock
  // For now, since we haven't implemented question tracking, we'll use a placeholder or logic
  // based on status. If complete, it's totalQuestions. If draft/ready, it's 0. 
  const getCompletedQuestions = () => {
    if (interview.status === 'Completed') return interview.totalQuestions;
    if (interview.status === 'Draft' || interview.status === 'Ready' || interview.status === 'Cancelled') return 0;
    return Math.floor(interview.totalQuestions / 2); // Mock for In Progress
  };

  return (
    <>
      <motion.div 
        layout
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
        whileHover={{ scale: 1.02, y: -4 }}
        className="bg-white border border-slate-200 rounded-[20px] p-5 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all group relative overflow-hidden flex flex-col h-full cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
        onClick={() => {
          if (interview.status === 'Completed' || interview.status === 'Cancelled') {
            onView(interview.id);
          } else {
            onContinue(interview.id);
          }
        }}
        role="article"
        aria-label={`Interview for ${interview.role} at ${interview.company}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (interview.status === 'Completed' || interview.status === 'Cancelled') {
              onView(interview.id);
            } else {
              onContinue(interview.id);
            }
          }
        }}
      >
        {/* Top Section */}
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-3">
            <CompanyLogo company={interview.company} size="md" />
            <div>
              <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-blue-700 transition-colors" title={interview.role}>
                {interview.role}
              </h3>
              <div className="text-sm font-medium text-slate-500 mt-0.5">
                {interview.company}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0 ml-2">
            <InterviewStatusBadge status={interview.status} />
          </div>
        </div>

        {/* Progress Section */}
        <div className="mb-6">
          <InterviewProgress 
            totalQuestions={interview.totalQuestions}
            completedQuestions={getCompletedQuestions()}
            status={interview.status}
          />
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-slate-600 mb-6 flex-grow">
          <div className="col-span-2 flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-1 text-xs rounded-lg font-bold border ${
              interview.difficulty === 'Hard' ? 'bg-red-50 text-red-700 border-red-100' :
              interview.difficulty === 'Medium' ? 'bg-orange-50 text-orange-700 border-orange-100' :
              'bg-emerald-50 text-emerald-700 border-emerald-100'
            }`}>
              {interview.difficulty}
            </span>
            <span className="text-xs font-semibold text-slate-600 px-2.5 py-1 border border-slate-200 bg-white rounded-lg shadow-sm">
              {interview.interviewType}
            </span>
            {interview.score !== null && (
              <span className="text-xs font-bold text-blue-700 px-2.5 py-1 border border-blue-200 bg-blue-50 rounded-lg flex items-center gap-1">
                <Award size={12} /> {interview.score}/100
              </span>
            )}
          </div>

          <div className="col-span-2 flex items-center gap-2 text-xs text-slate-500 mt-1">
            <Clock size={14} className="opacity-70" />
            <span className="font-medium">{interview.duration} mins estimated</span>
          </div>

          <div className="col-span-2 flex items-center gap-2 text-xs text-slate-500">
            <FileText size={14} className="opacity-70" />
            <span>Resume: <span className="font-medium text-slate-700">{interview.resumeId ? 'Attached' : 'General'}</span></span>
          </div>
          
          <div className="col-span-2 flex items-center gap-2 text-xs text-slate-400">
            <Calendar size={12} />
            <span>Created {formatDate(interview.createdAt)}</span>
          </div>
        </div>

        {/* Actions */}
        <div 
          className="flex items-center gap-3 pt-4 border-t border-slate-100 mt-auto"
          onClick={(e) => e.stopPropagation()} 
        >
          {getAction()}
          <button 
            aria-label={`Delete interview for ${interview.role}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowDelete(true);
            }}
            className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            title="Delete Interview"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </motion.div>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent className="rounded-[24px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Delete Interview?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 text-base">
              This action cannot be undone. This will permanently delete the mock interview for <strong>{interview.role}</strong> at <strong>{interview.company}</strong> and remove all associated AI feedback and questions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="rounded-xl px-6 focus-visible:ring-2 focus-visible:ring-slate-500">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onDelete(interview.id)}
              className="bg-red-600 text-white hover:bg-red-700 rounded-xl px-6 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
