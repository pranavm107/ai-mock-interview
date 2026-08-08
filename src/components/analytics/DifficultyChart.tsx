import React from 'react';
import type { DifficultyAnalytics } from '../../types/analytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DifficultyChartProps {
  data: DifficultyAnalytics;
}

export const DifficultyChart: React.FC<DifficultyChartProps> = ({ data }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#10B981'; // green
      case 'medium': return '#F59E0B'; // yellow
      case 'hard': return '#EF4444'; // red
      case 'mixed': return '#2563EB'; // blue
      default: return '#64748B';
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Scores by Difficulty</h3>
      <div className="flex-1 w-full min-h-0 relative">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="difficulty" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', borderColor: '#E2E8F0', color: '#0F172A', borderRadius: '0.5rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
              cursor={{ fill: '#F1F5F9' }}
            />
            <Bar dataKey="averageScore" radius={[4, 4, 0, 0]} name="Avg Score">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getDifficultyColor(entry.difficulty)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
            No difficulty data available
          </div>
        )}
      </div>
    </div>
  );
};
