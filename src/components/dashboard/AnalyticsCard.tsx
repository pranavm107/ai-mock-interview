import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface AnalyticsCardProps {
  performanceData?: { 
    name: string; 
    date?: string;
    score: number;
    interviewId?: string;
    role?: string;
    company?: string;
  }[];
  trend?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-lg min-w-[160px]">
        <div className="space-y-2">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Interview</p>
            <p className="text-sm font-medium text-slate-900">{data.role || 'Mock Interview'}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company</p>
            <p className="text-sm font-medium text-slate-900">{data.company || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</p>
            <p className="text-sm font-medium text-slate-900">{data.date || data.name}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score</p>
            <p className="text-sm font-bold text-indigo-600">{data.score}%</p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ performanceData = [], trend = 0 }) => {
  const isPositive = trend >= 0;
  const hasEnoughData = performanceData.length >= 2;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white border border-slate-200 rounded-[20px] p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Performance Trend</h2>
          <p className="text-sm text-slate-500 mt-1">Your average score over time</p>
        </div>
        {hasEnoughData && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${
            isPositive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
          }`}>
            <TrendingUp size={16} className={!isPositive ? 'rotate-180' : ''} />
            <span>{isPositive ? '+' : ''}{trend}%</span>
          </div>
        )}
      </div>
      
      <div className="flex-1 min-h-[200px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          {hasEnoughData ? (
            <AreaChart data={performanceData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b' }} 
              domain={[0, 100]} 
              ticks={[0, 20, 40, 60, 80, 100]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area 
              type="linear" 
              dataKey="score" 
              stroke="#4F46E5" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorScore)" 
              activeDot={{ r: 5, fill: "#4F46E5", stroke: "#fff", strokeWidth: 2 }}
              dot={{ r: 3, fill: "#4F46E5", stroke: "#fff", strokeWidth: 1 }}
            />
          </AreaChart>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm">
              <p className="font-semibold text-slate-700 mb-1">No performance history yet.</p>
              <p>Complete interviews to start tracking your progress.</p>
            </div>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
