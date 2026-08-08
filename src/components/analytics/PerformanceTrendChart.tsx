import React from 'react';
import type { PerformanceTrend } from '../../types/analytics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PerformanceTrendChartProps {
  data: PerformanceTrend;
}

export const PerformanceTrendChart: React.FC<PerformanceTrendChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Performance Trend</h3>
      <div className="flex-1 w-full min-h-0 relative">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="date" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', borderColor: '#E2E8F0', color: '#0F172A', borderRadius: '0.5rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
              itemStyle={{ color: '#2563EB' }}
            />
            <Line 
              type="monotone" 
              dataKey="overallScore" 
              stroke="#2563EB" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, fill: '#1D4ED8', strokeWidth: 0 }}
              name="Score"
            />
          </LineChart>
        </ResponsiveContainer>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
            No performance trend data available
          </div>
        )}
      </div>
    </div>
  );
};
