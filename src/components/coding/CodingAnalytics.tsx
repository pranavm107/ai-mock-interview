import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { codingFrontendService } from '../../services/codingFrontendService';
import type { CodingAnalyticsData } from '../../types/coding';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, Code2, Target, CheckCircle2, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';

export const CodingAnalytics: React.FC = () => {
  const { getToken } = useAuth();
  const [data, setData] = useState<CodingAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAnalytics = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        const analytics = await codingFrontendService.getAnalyticsData(token, tz);
        if (isMounted) setData(analytics);
      } catch (err: any) {
        console.error('Failed to load coding analytics:', err);
        if (isMounted) setError(err.message || 'Failed to load analytics');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchAnalytics();
    return () => { isMounted = false; };
  }, [getToken]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex items-center justify-center min-h-[220px]" aria-busy="true" aria-label="Loading analytics">
        <div className="flex flex-col items-center text-slate-400 gap-2">
          <Loader2 className="animate-spin w-6 h-6" />
          <span className="text-xs">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex items-center justify-center min-h-[220px]">
        <div className="flex flex-col items-center text-slate-500 gap-2">
          <AlertCircle className="w-6 h-6 text-slate-400" />
          <span className="text-xs">Failed to load analytics data.</span>
        </div>
      </div>
    );
  }

  if (data.totalAttempts === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-8 text-center flex flex-col items-center">
        <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-3 text-blue-600">
          <Activity size={24} />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">No Submissions Yet</h2>
        <p className="text-slate-500 text-xs sm:text-sm max-w-md">
          Start practicing coding challenges and submitting solutions to see your analytics and progress here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <CheckCircle2 className="text-emerald-500" size={16} />
            <span className="font-semibold text-xs">Problems Solved</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{data.totalSolved}</div>
          <div className="text-xs text-slate-500 mt-0.5">out of {data.uniqueProblemsAttempted} attempted</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Target className="text-blue-500" size={16} />
            <span className="font-semibold text-xs">Acceptance Rate</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{data.acceptanceRate}%</div>
          <div className="text-xs text-slate-500 mt-0.5">across {data.totalAttempts} total submissions</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <TrendingUp className="text-purple-500" size={16} />
            <span className="font-semibold text-xs">Difficulty Breakdown</span>
          </div>
          <div className="flex items-center gap-6 mt-1">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-500">Easy</span>
              <span className="text-xl font-bold text-emerald-600">{data.difficultyBreakdown.EASY || 0}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-500">Medium</span>
              <span className="text-xl font-bold text-amber-600">{data.difficultyBreakdown.MEDIUM || 0}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-500">Hard</span>
              <span className="text-xl font-bold text-rose-600">{data.difficultyBreakdown.HARD || 0}</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Activity className="text-blue-600" size={16} />
            Recent Activity (Last 30 Days)
          </h3>
          <div className="h-56" role="img" aria-label="Bar chart showing daily submission activity over the last 30 days.">
            {data.recentActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.recentActivity} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgb(0 0 0 / 0.05)', fontSize: '12px' }}
                  />
                  <Bar dataKey="attempts" name="Total Submissions" fill="#94a3b8" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="solved" name="Accepted" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                No activity in the last 30 days.
              </div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Code2 className="text-purple-600" size={16} />
            Languages Used
          </h3>
          <div className="flex flex-col gap-2.5">
            {Object.keys(data.languageBreakdown).length > 0 ? (
              Object.entries(data.languageBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([lang, count]) => (
                <div key={lang} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                  <span className="font-semibold text-slate-700 capitalize">{lang}</span>
                  <span className="text-[11px] font-medium bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-600">
                    {count} submissions
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 py-6 text-xs">No languages used yet.</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
