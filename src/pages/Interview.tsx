import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useInterview } from '../hooks/useInterview';
import { useResume } from '../hooks/useResume';
import { InterviewStatusBadge } from '../components/interview/InterviewStatusBadge';
import { CompanyLogo } from '../components/interview/CompanyLogo';
import { Building, Clock, Target, Calendar, FileText, Activity, Layers, ArrowLeft, Play, CheckCircle2, Circle, Eye, FileBadge2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { InterviewSessionView } from '../components/interview/session/InterviewSessionView';

const Interview: React.FC = () => {
  const { id: slug } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const { interviews, loading, refreshInterviews, startInterview } = useInterview();
  const { resumes, loading: loadingResumes, refreshResumes } = useResume();
  
  const idFragment = slug ? slug.split('-').pop() : null;

  useEffect(() => {
    if (user?.id && interviews.length === 0) {
      refreshInterviews(user.id);
    }
    if (user?.id && resumes.length === 0) {
      refreshResumes();
    }
  }, [user?.id, interviews.length, resumes.length, refreshInterviews, refreshResumes]);

  const interview = useMemo(() => {
    if (!idFragment || interviews.length === 0) return null;
    return interviews.find(i => i.id.startsWith(idFragment));
  }, [interviews, idFragment]);

  const resume = useMemo(() => {
    if (!interview?.resumeId || resumes.length === 0) return null;
    return resumes.find(r => r.id === interview.resumeId);
  }, [interview, resumes]);

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(d);
  };

  const formatTime = (date: any) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    }).format(d);
  };

  if (loading || (interview && interview.resumeId && loadingResumes)) {
    return (
      <div className="pb-24 space-y-6 px-4 md:px-0">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-[300px] w-full rounded-3xl" />
        <Skeleton className="h-[400px] w-full rounded-3xl" />
      </div>
    );
  }

  if (!interview && !loading) {
    return (
      <div className="pb-24 flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <Activity size={40} className="text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Interview Not Found</h2>
        <p className="text-slate-500 mb-8 max-w-md text-center">
          We couldn't find the interview you were looking for. It may have been deleted or the link is invalid.
        </p>
        <Button onClick={() => navigate('/history')} className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-xl font-semibold">
          Back to History
        </Button>
      </div>
    );
  }

  if (!interview) return null;

  if (interview.status === 'In Progress' || interview.status === 'Paused') {
    return (
      <div className="pb-24 px-4 md:px-0">
        <InterviewSessionView interviewId={interview.id} />
      </div>
    );
  }

  return (
    <div className="pb-12 max-w-6xl mx-auto space-y-4 sm:space-y-5 px-4 md:px-0">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/history')}
        className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors text-xs sm:text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md cursor-pointer"
      >
        <ArrowLeft size={15} /> Back to History
      </button>

      {/* Hero Header */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-xs relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-50 to-indigo-50/20 rounded-full blur-2xl -mr-10 -mt-10 z-0 hidden md:block pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4 sm:mb-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <CompanyLogo company={interview.company} size="md" />
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight break-words">
                  {interview.role}
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5 text-slate-500 text-xs sm:text-sm">
                  <Building size={15} className="shrink-0" />
                  <span className="font-medium break-words">{interview.company}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
              <InterviewStatusBadge status={interview.status} />
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar size={13} className="shrink-0" />
                <span className="truncate">Created {formatDate(interview.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-4 border-t border-slate-100">
            <div className="bg-slate-50 rounded-lg p-2.5 sm:p-3 border border-slate-100 flex flex-col justify-center h-full">
              <div className="flex items-center gap-1.5 text-slate-500 mb-0.5">
                <Layers size={14} className="shrink-0" />
                <span className="text-[11px] font-medium truncate">Type & Diff.</span>
              </div>
              <p className="font-semibold text-slate-900 text-xs sm:text-sm truncate">{interview.interviewType} • {interview.difficulty}</p>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-2.5 sm:p-3 border border-slate-100 flex flex-col justify-center h-full">
              <div className="flex items-center gap-1.5 text-slate-500 mb-0.5">
                <Clock size={14} className="shrink-0" />
                <span className="text-[11px] font-medium truncate">Duration</span>
              </div>
              <p className="font-semibold text-slate-900 text-xs sm:text-sm truncate">{interview.duration} Minutes</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-2.5 sm:p-3 border border-slate-100 flex flex-col justify-center h-full">
              <div className="flex items-center gap-1.5 text-slate-500 mb-0.5">
                <Target size={14} className="shrink-0" />
                <span className="text-[11px] font-medium truncate">Questions</span>
              </div>
              <p className="font-semibold text-slate-900 text-xs sm:text-sm truncate">{interview.totalQuestions} Qs</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-2.5 sm:p-3 border border-slate-100 flex flex-col justify-center h-full">
              <div className="flex items-center gap-1.5 text-slate-500 mb-0.5">
                <FileText size={14} className="shrink-0" />
                <span className="text-[11px] font-medium truncate">Context</span>
              </div>
              <p className="font-semibold text-slate-900 text-xs sm:text-sm truncate">{interview.resumeId ? 'Resume' : 'General'}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Timeline */}
          <motion.div 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-xs"
          >
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 mb-4 flex items-center gap-1.5">
              <Activity size={16} className="text-blue-600" /> Session Timeline
            </h3>
            
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[9px] before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200">
              {/* Created */}
              <div className="relative flex items-start gap-3">
                <div className="relative z-10 bg-white pt-0.5">
                  <CheckCircle2 className="text-blue-600 bg-white" size={18} />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-xs sm:text-sm">Created</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{formatDate(interview.createdAt)} {formatTime(interview.createdAt)}</div>
                </div>
              </div>

              {/* Started */}
              <div className="relative flex items-start gap-3">
                <div className="relative z-10 bg-white pt-0.5">
                  {interview.status !== 'Draft' && interview.status !== 'Ready' ? (
                    <CheckCircle2 className="text-blue-600 bg-white" size={18} />
                  ) : (
                    <Circle className="text-slate-300 bg-white" size={18} />
                  )}
                </div>
                <div>
                  <div className={`font-semibold text-xs sm:text-sm ${interview.status !== 'Draft' && interview.status !== 'Ready' ? 'text-slate-900' : 'text-slate-400'}`}>Started</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {interview.startedAt ? `${formatDate(interview.startedAt)} ${formatTime(interview.startedAt)}` : 'Pending'}
                  </div>
                </div>
              </div>

              {/* Completed */}
              <div className="relative flex items-start gap-3">
                <div className="relative z-10 bg-white pt-0.5">
                  {interview.status === 'Completed' ? (
                    <CheckCircle2 className="text-green-600 bg-white" size={18} />
                  ) : (
                    <Circle className="text-slate-300 bg-white" size={18} />
                  )}
                </div>
                <div>
                  <div className={`font-semibold text-xs sm:text-sm ${interview.status === 'Completed' ? 'text-slate-900' : 'text-slate-400'}`}>Completed</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {interview.completedAt ? `${formatDate(interview.completedAt)} ${formatTime(interview.completedAt)}` : 'Pending'}
                  </div>
                </div>
              </div>
            </div>

            {interview.score !== null && (
              <div className="mt-4 pt-3.5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-slate-600">Final Score</span>
                  <span className="text-sm font-bold text-blue-700">{interview.score}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${interview.score}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full bg-blue-600 rounded-full"
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* Resume Info Card */}
          {resume && (
            <motion.div 
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-xs"
            >
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 mb-3 flex items-center gap-1.5">
                <FileBadge2 size={16} className="text-indigo-600" /> Attached Resume
              </h3>
              <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
                <div className="flex items-start gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <FileText size={16} />
                  </div>
                  <div className="overflow-hidden min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate" title={resume.metadata?.fileName || (resume as any).fileName}>
                      {resume.metadata?.fileName || (resume as any).fileName || 'Your_Resume.pdf'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Uploaded {formatDate(resume.createdAt)}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded uppercase">
                      PDF Document
                    </span>
                  </div>
                </div>
                <Button 
                  onClick={() => window.open(resume.metadata?.fileUrl || (resume as any).fileUrl, '_blank')}
                  className="w-full bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-200 shadow-2xs rounded-lg h-8 text-xs font-medium cursor-pointer"
                  variant="outline"
                  disabled={!(resume.metadata?.fileUrl || (resume as any).fileUrl)}
                >
                  <Eye size={14} className="mr-1.5" /> Preview Resume
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Main Interface Area */}
        <div className="lg:col-span-2 h-full">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/90 shadow-xs min-h-[300px] h-full flex flex-col items-center justify-center text-center"
          >
            {interview.status === 'Draft' || interview.status === 'Ready' ? (
              <div className="max-w-md w-full">
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner border border-blue-100">
                  <Play size={24} className="text-blue-600 ml-0.5" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Ready to Begin?</h3>
                <p className="text-xs sm:text-sm text-slate-500 mb-5 px-2 leading-relaxed">
                  Your AI mock interview for <strong className="text-slate-700">{interview.role}</strong> at <strong className="text-slate-700">{interview.company}</strong> is ready. The session is estimated to take {interview.duration} minutes.
                </p>
                <Button 
                  onClick={() => startInterview(interview.id)}
                  className="bg-blue-600 hover:bg-blue-700 h-9 px-6 text-xs sm:text-sm rounded-lg font-medium shadow-xs w-full sm:w-auto transition-all active:scale-[0.98] cursor-pointer"
                >
                  Start Session Now
                </Button>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-slate-500 px-4">
                AI Interview Session Interface
              </p>
            )}
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Interview;
