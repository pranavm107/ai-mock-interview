import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, CheckCircle2, Clock, Calendar, Hash, BookOpen, Sparkles, ChevronRight, AlertCircle, RefreshCcw } from 'lucide-react';
import type { CodingDashboardData } from '../types/coding';
import { codingFrontendService } from '../services/codingFrontendService';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { CodingAnalytics } from '../components/coding/CodingAnalytics';
import { CodingReadiness } from '../components/coding/CodingReadiness';

const DifficultyBadge: React.FC<{ difficulty: string }> = ({ difficulty }) => {
  const colors = {
    EASY: 'bg-green-100 text-green-700 border-green-200',
    MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    HARD: 'bg-red-100 text-red-700 border-red-200'
  };
  const color = colors[difficulty as keyof typeof colors] || colors.EASY;
  const label = difficulty.charAt(0) + difficulty.slice(1).toLowerCase();

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      {label}
    </span>
  );
};

const formatDateKey = (dateKey?: string) => {
  if (!dateKey) return "Today's Challenge";
  try {
    const [year, month, day] = dateKey.split('-');
    if (!year || !month || !day) return "Today's Challenge";
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (isNaN(d.getTime())) return "Today's Challenge";
    return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  } catch {
    return "Today's Challenge";
  }
};

const CodingDashboard: React.FC = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<CodingDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token available");
      
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      const result = await codingFrontendService.getDashboardData(token, tz);
      setData(result);
    } catch (err) {
      console.error('Failed to load coding dashboard', err);
      setError('We couldn\'t load your coding practice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto animate-pulse" aria-busy="true" aria-label="Loading dashboard">
        <div className="h-24 bg-slate-200 rounded-2xl w-full"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-slate-200 rounded-2xl"></div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
        <p className="text-slate-600 mb-6 max-w-md">{error}</p>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <RefreshCcw size={18} />
          Try Again
        </button>
      </div>
    );
  }

  const { dailyAssignment, recentTasks, progress } = data!;

  const isNewUser = progress.problemsAssigned === 0;

  return (
    <div className="flex flex-col gap-5 w-full max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 bg-gradient-to-r from-slate-900 to-slate-800 p-5 sm:p-6 rounded-xl text-white shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-500/10 blur-2xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-xl sm:text-2xl font-bold mb-1.5 flex items-center gap-2.5">
            <Sparkles className="text-blue-400" size={22} />
            Coding Practice
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Build your problem-solving skills through focused, personalized coding practice.
          </p>
        </div>
      </div>

      {!dailyAssignment ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs text-center flex flex-col items-center">
          <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-blue-600">
            <Clock size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1.5">Coding Practice is getting ready</h2>
          <p className="text-slate-500 text-xs sm:text-sm max-w-md">
            There aren't enough coding challenges available yet. Please check back soon as we add more content.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
            >
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                  <Calendar className="text-blue-600" size={16} />
                  TODAY'S CHALLENGE
                </h2>
                <span className="text-xs font-medium text-slate-500">
                  {formatDateKey(dailyAssignment.dateKey)}
                </span>
              </div>
              
              <div className="p-5 sm:p-6 flex flex-col gap-4">
                {isNewUser && (
                  <div className="bg-blue-50 text-blue-700 px-3.5 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2 border border-blue-100">
                    <Sparkles size={15} className="text-blue-600 shrink-0" />
                    Start Coding Practice: Your first challenge is ready. We'll personalize future challenges as you build history.
                  </div>
                )}
                
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2.5 mb-0.5">
                    <DifficultyBadge difficulty={dailyAssignment.difficulty} />
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <Hash size={12} />
                      {dailyAssignment.topic}
                    </span>
                    {dailyAssignment.problem?.estimatedMinutes && (
                      <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        <Clock size={12} />
                        {dailyAssignment.problem.estimatedMinutes} min
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">{dailyAssignment.problem?.title || 'Daily Challenge'}</h3>
                </div>

                <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                  {dailyAssignment.problem?.description || 'Complete your daily coding challenge.'}
                </p>

                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 flex items-start gap-2.5">
                  <Sparkles className="text-purple-500 shrink-0 mt-0.5" size={16} />
                  <div>
                    <span className="block text-xs font-bold text-slate-900 mb-0.5">Recommended for you</span>
                    <span className="text-xs text-slate-600">{dailyAssignment.reason}</span>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    {dailyAssignment.status === 'COMPLETED' ? (
                      <span className="flex items-center gap-1.5 text-green-600 font-semibold text-xs sm:text-sm">
                        <CheckCircle2 size={16} /> Completed
                      </span>
                    ) : dailyAssignment.status === 'IN_PROGRESS' ? (
                      <span className="flex items-center gap-1.5 text-amber-600 font-semibold text-xs sm:text-sm">
                        <Play size={16} /> In Progress
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-slate-500 font-semibold text-xs sm:text-sm">
                        <BookOpen size={16} /> Not Started
                      </span>
                    )}
                  </div>
                  <button 
                    disabled={false}
                    onClick={() => {
                      if (dailyAssignment.problem?.slug) {
                        navigate(`/coding/problem/${dailyAssignment.problem.slug}`);
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white font-medium text-xs sm:text-sm rounded-lg hover:bg-blue-500 transition-colors group shadow-xs"
                  >
                    View Challenge
                    <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
            >
              <div className="px-5 py-3.5 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">Recent Practice</h2>
              </div>
              <div className="p-4 sm:p-5">
                {recentTasks.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    <p>Your coding activity will appear here as you complete challenges.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentTasks.map(task => (
                      <div key={task.id} className="py-3 flex items-center justify-between group">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {task.problem?.title || 'Unknown Problem'}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs">
                            <DifficultyBadge difficulty={task.difficulty} />
                            <span className="text-slate-400">&middot;</span>
                            <span className="text-slate-500 text-[11px] font-medium">{task.topic}</span>
                          </div>
                        </div>
                        <div>
                          {task.status === 'COMPLETED' ? (
                            <span className="text-green-600 text-xs font-semibold flex items-center gap-1"><CheckCircle2 size={14}/> Completed</span>
                          ) : task.status === 'IN_PROGRESS' ? (
                            <span className="text-amber-600 text-xs font-semibold flex items-center gap-1"><Play size={14}/> In Progress</span>
                          ) : (
                            <span className="text-slate-400 text-xs font-semibold">Not Started</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
            >
              <div className="px-5 py-3.5 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">Progress</h2>
              </div>
              <div className="p-4 sm:p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-500">Assigned</span>
                    <span className="text-lg sm:text-xl font-bold text-slate-900">{progress.problemsAssigned}</span>
                  </div>
                  <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                    <Calendar size={16} />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-500">Completed</span>
                    <span className="text-lg sm:text-xl font-bold text-slate-900">{progress.problemsCompleted}</span>
                  </div>
                  <div className="h-8 w-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                    <CheckCircle2 size={16} />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-500">Topics</span>
                    <span className="text-lg sm:text-xl font-bold text-slate-900">{progress.topicsPracticed.length}</span>
                  </div>
                  <div className="h-8 w-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                    <Hash size={16} />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
            >
              <div className="px-5 py-3.5 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">Topics Practiced</h2>
              </div>
              <div className="p-4 sm:p-5">
                {progress.topicsPracticed.length === 0 ? (
                  <p className="text-slate-500 text-xs text-center py-2">No topics practiced yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {progress.topicsPracticed.map(topic => (
                      <span key={topic} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-md border border-slate-200">
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      <div className="mt-5">
        <CodingReadiness />
      </div>

      <div className="mt-5">
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Your Analytics</h2>
          <p className="text-slate-500 text-xs sm:text-sm">Track your problem-solving journey and activity over time.</p>
        </div>
        <CodingAnalytics />
      </div>
    </div>
  );
};

export default CodingDashboard;
