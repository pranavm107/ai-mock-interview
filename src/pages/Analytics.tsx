import React, { useEffect } from 'react';
import { BarChart3, TrendingUp, AlertCircle } from 'lucide-react';
import { PageHeader } from '../components/dashboard/PageHeader';
import { EmptyState } from '../components/dashboard/EmptyState';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { useInterviewHistory } from '../hooks/useInterviewHistory';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const Analytics: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { sessions, loading, error, fetchUserSessions } = useInterviewHistory();

  useEffect(() => {
    if (isLoaded && user?.id) {
      fetchUserSessions(user.id);
    }
  }, [isLoaded, user?.id, fetchUserSessions]);

  const completedSessions = sessions.filter(s => s.status === 'Completed' && s.score !== null);
  
  // Sort by date ascending for the chart
  const chartData = [...completedSessions]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map(s => ({
      date: new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: s.score,
      role: s.role
    }));

  return (
    <div className="pb-24">
      <PageHeader 
        title="Analytics" 
        description="Track your interview performance over time and identify areas where you can improve the most."
        icon={BarChart3}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {loading ? (
           <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
        ) : error ? (
           <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2"><AlertCircle size={18} /> {error}</div>
        ) : chartData.length > 0 ? (
          <div className="bg-white p-6 rounded-[20px] shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Performance Trend</h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#2563eb" 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                    name="Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <EmptyState 
            title="Not enough data"
            description="Complete at least one mock interview to unlock your performance analytics and charts."
            icon={TrendingUp}
            actionLabel="Generate Interview"
            actionTo="/generate"
          />
        )}
      </motion.div>
    </div>
  );
};

export default Analytics;
