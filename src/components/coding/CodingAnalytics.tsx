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
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8 flex items-center justify-center min-h-[300px]" aria-busy="true" aria-label="Loading analytics">
        <div className="flex flex-col items-center text-slate-400 gap-2">
          <Loader2 className="animate-spin w-8 h-8" />
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center text-slate-500 gap-2">
          <AlertCircle className="w-8 h-8 text-slate-400" />
          <span>Failed to load analytics data.</span>
        </div>
      </div>
    );
  }

  if (data.totalAttempts === 0) {
    return (
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center">
        <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
          <Activity size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Submissions Yet</h2>
        <p className="text-slate-500 max-w-md">
          Start practicing coding challenges and submitting solutions to see your analytics and progress here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-3">
            <CheckCircle2 className="text-green-500" size={20} />
            <span className="font-semibold text-sm">Problems Solved</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{data.totalSolved}</div>
          <div className="text-sm text-slate-500 mt-1">out of {data.uniqueProblemsAttempted} attempted</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-3">
            <Target className="text-blue-500" size={20} />
            <span className="font-semibold text-sm">Acceptance Rate</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{data.acceptanceRate}%</div>
          <div className="text-sm text-slate-500 mt-1">across {data.totalAttempts} total submissions</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-1 md:col-span-2">
          <div className="flex items-center gap-3 text-slate-500 mb-3">
            <TrendingUp className="text-purple-500" size={20} />
            <span className="font-semibold text-sm">Difficulty Breakdown</span>
          </div>
          <div className="flex items-center gap-6 mt-2">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-500">Easy</span>
              <span className="text-2xl font-bold text-green-600">{data.difficultyBreakdown.EASY || 0}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-500">Medium</span>
              <span className="text-2xl font-bold text-yellow-600">{data.difficultyBreakdown.MEDIUM || 0}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-500">Hard</span>
              <span className="text-2xl font-bold text-red-600">{data.difficultyBreakdown.HARD || 0}</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Activity className="text-blue-600" size={20} />
            Recent Activity (Last 30 Days)
          </h3>
          <div className="h-64" role="img" aria-label="Bar chart showing daily submission activity over the last 30 days.">
            {data.recentActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.recentActivity} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="attempts" name="Total Submissions" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="solved" name="Accepted" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                No activity in the last 30 days.
              </div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Code2 className="text-purple-600" size={20} />
            Languages Used
          </h3>
          <div className="flex flex-col gap-4">
            {Object.keys(data.languageBreakdown).length > 0 ? (
              Object.entries(data.languageBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([lang, count]) => (
                <div key={lang} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-semibold text-slate-700 capitalize">{lang}</span>
                  <span className="text-sm font-medium bg-white px-3 py-1 rounded-full border border-slate-200">
                    {count} submissions
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 py-8">No languages used yet.</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
