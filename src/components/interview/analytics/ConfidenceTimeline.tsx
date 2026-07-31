import React, { useMemo } from 'react';
import type { ConfidenceHistory } from '../../../types/liveEvaluation';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ConfidenceTimelineProps {
  timeline: ConfidenceHistory[];
}

export const ConfidenceTimeline: React.FC<ConfidenceTimelineProps> = ({ timeline }) => {
  const chartData = useMemo(() => {
    return timeline.map(t => ({
      name: `Q${t.questionNumber}`,
      confidence: t.confidence
    }));
  }, [timeline]);

  if (!chartData || chartData.length === 0) return null;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800 mb-4 uppercase tracking-wider">Confidence Trend</h3>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#3b82f6', fontWeight: 600 }}
              labelStyle={{ color: '#64748b', marginBottom: '4px' }}
            />
            <Area 
              type="monotone" 
              dataKey="confidence" 
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorConfidence)" 
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
