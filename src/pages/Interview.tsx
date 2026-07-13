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

const Interview: React.FC = () => {
  const { id: slug } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const { interviews, loading, refreshInterviews } = useInterview();
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

  return (
    <div className="pb-24 space-y-8 px-4 md:px-0">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/history')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md"
      >
        <ArrowLeft size={16} /> Back to History
      </button>

      {/* Premium Hero Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50/20 rounded-full blur-3xl -mr-20 -mt-20 z-0 hidden md:block"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
              <CompanyLogo company={interview.company} size="lg" />
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight break-words">
                  {interview.role}
                </h1>
                <div className="flex items-center gap-2 mt-1.5 text-slate-500 text-base md:text-lg">
                  <Building size={18} className="shrink-0" />
                  <span className="font-medium break-words">{interview.company}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
              <InterviewStatusBadge status={interview.status} />
              <div className="text-sm text-slate-400 flex items-center gap-1.5">
                <Calendar size={14} className="shrink-0" /> 
                <span className="truncate">Created {formatDate(interview.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-center h-full">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Layers size={16} className="shrink-0" />
                <span className="text-xs md:text-sm font-medium truncate">Type & Diff.</span>
              </div>
              <p className="font-semibold text-slate-900 text-sm md:text-base truncate">{interview.interviewType} • {interview.difficulty}</p>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-center h-full">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Clock size={16} className="shrink-0" />
                <span className="text-xs md:text-sm font-medium truncate">Duration</span>
              </div>
              <p className="font-semibold text-slate-900 text-sm md:text-base truncate">{interview.duration} Minutes</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-center h-full">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Target size={16} className="shrink-0" />
                <span className="text-xs md:text-sm font-medium truncate">Questions</span>
              </div>
              <p className="font-semibold text-slate-900 text-sm md:text-base truncate">{interview.totalQuestions} Qs</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-center h-full">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <FileText size={16} className="shrink-0" />
                <span className="text-xs md:text-sm font-medium truncate">Context</span>
              </div>
              <p className="font-semibold text-slate-900 text-sm md:text-base truncate">{interview.resumeId ? 'Resume' : 'General'}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Timeline */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm"
          >
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Activity size={18} className="text-blue-600" /> Session Timeline
            </h3>
            
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200">
              {/* Created */}
              <div className="relative flex items-start gap-4">
                <div className="relative z-10 bg-white pt-1">
                  <CheckCircle2 className="text-blue-600 bg-white" size={24} />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">Created</div>
                  <div className="text-xs text-slate-500 mt-0.5">{formatDate(interview.createdAt)} {formatTime(interview.createdAt)}</div>
                </div>
              </div>

              {/* Started */}
              <div className="relative flex items-start gap-4">
                <div className="relative z-10 bg-white pt-1">
                  {interview.status !== 'Draft' && interview.status !== 'Ready' ? (
                    <CheckCircle2 className="text-blue-600 bg-white" size={24} />
                  ) : (
                    <Circle className="text-slate-300 bg-white" size={24} />
                  )}
                </div>
                <div>
                  <div className={`font-semibold text-sm ${interview.status !== 'Draft' && interview.status !== 'Ready' ? 'text-slate-900' : 'text-slate-400'}`}>Started</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {interview.startedAt ? `${formatDate(interview.startedAt)} ${formatTime(interview.startedAt)}` : 'Pending'}
                  </div>
                </div>
              </div>

              {/* Completed */}
              <div className="relative flex items-start gap-4">
                <div className="relative z-10 bg-white pt-1">
                  {interview.status === 'Completed' ? (
                    <CheckCircle2 className="text-green-600 bg-white" size={24} />
                  ) : (
                    <Circle className="text-slate-300 bg-white" size={24} />
                  )}
                </div>
                <div>
                  <div className={`font-semibold text-sm ${interview.status === 'Completed' ? 'text-slate-900' : 'text-slate-400'}`}>Completed</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {interview.completedAt ? `${formatDate(interview.completedAt)} ${formatTime(interview.completedAt)}` : 'Pending'}
                  </div>
                </div>
              </div>
            </div>

            {interview.score !== null && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-600">Final Score</span>
                  <span className="text-lg font-bold text-blue-700">{interview.score}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${interview.score}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-blue-600 rounded-full"
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* Resume Info Card */}
          {resume && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm"
            >
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileBadge2 size={18} className="text-indigo-600" /> Attached Resume
              </h3>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-slate-900 truncate" title={resume.fileName}>
                      {resume.fileName}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Uploaded {formatDate(resume.createdAt)}
                    </p>
                    <span className="inline-block mt-2 text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-md uppercase">
                      PDF Document
                    </span>
                  </div>
                </div>
                <Button 
                  onClick={() => window.open(resume.fileUrl, '_blank')}
                  className="w-full bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-200 shadow-sm rounded-xl h-10"
                  variant="outline"
                  disabled={!resume.fileUrl}
                >
                  <Eye size={16} className="mr-2" /> Preview Resume
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Main Interface Area */}
        <div className="lg:col-span-2 h-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm min-h-[400px] h-full flex flex-col items-center justify-center text-center"
          >
            {interview.status === 'Draft' || interview.status === 'Ready' ? (
              <div className="max-w-md w-full">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-blue-100">
                  <Play size={32} className="text-blue-600 ml-1" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Ready to Begin?</h3>
                <p className="text-slate-500 mb-8 px-4">
                  Your AI mock interview for <strong className="text-slate-700">{interview.role}</strong> at <strong className="text-slate-700">{interview.company}</strong> is ready. The session is estimated to take {interview.duration} minutes.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700 h-14 px-8 text-base rounded-xl font-semibold shadow-sm w-full md:w-auto transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                  Start Session Now
                </Button>
              </div>
            ) : (
              <p className="text-slate-500 px-4">
                {/* Phase 3.3 placeholder */}
                AI Interview Session Interface Goes Here
              </p>
            )}
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Interview;
