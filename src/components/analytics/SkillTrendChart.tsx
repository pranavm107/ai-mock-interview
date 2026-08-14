import React, { useMemo } from 'react';
import type { SkillTrend } from '../../types/analytics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SkillTrendChartProps {
  data: SkillTrend;
}

export const SkillTrendChart: React.FC<SkillTrendChartProps> = ({ data }) => {
  // We need to transform the nested skillTrend array into a unified flat array for Recharts
  // Input: [ { skill: 'React', history: [{date: 'Jul 1', score: 80}] } ]
  // Output: [ { date: 'Jul 1', React: 80, Node: 70 } ]
  const chartData = useMemo(() => {
    const dateMap = new Map<string, any>();
    
    data.forEach(skillItem => {
      skillItem.history.forEach(point => {
        if (!dateMap.has(point.date)) {
          dateMap.set(point.date, { date: point.date });
        }
        const existing = dateMap.get(point.date);
        existing[skillItem.skill] = point.score;
      });
    });

    return Array.from(dateMap.values());
  }, [data]);

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Skill Progression</h3>
      <div className="flex-1 w-full min-h-0 relative">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderColor: '#E2E8F0', color: '#0F172A', borderRadius: '0.5rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              {data.map((skillItem, index) => (
                <Line 
                  key={skillItem.skill}
                  type="monotone" 
                  dataKey={skillItem.skill} 
                  stroke={colors[index % colors.length]} 
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 1 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <span className="text-slate-500 font-medium mb-1">No skill progression data available yet</span>
            <span className="text-slate-400 text-sm">Complete interviews with skill-level evaluation enabled to track skill progression.</span>
          </div>
        )}
      </div>
    </div>
  );
};
