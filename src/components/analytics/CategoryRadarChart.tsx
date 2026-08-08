import React from 'react';
import type { CategoryTrend } from '../../types/analytics';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface CategoryRadarChartProps {
  data: CategoryTrend;
}

export const CategoryRadarChart: React.FC<CategoryRadarChartProps> = ({ data }) => {
  // Grab the latest point for the radar chart
  const latestData = data.length > 0 ? data[data.length - 1] : null;

  const radarData = latestData ? [
    { subject: 'Technical', A: latestData.technical, fullMark: 100 },
    { subject: 'Communication', A: latestData.communication, fullMark: 100 },
    { subject: 'Behavioral', A: latestData.behavioral, fullMark: 100 },
    { subject: 'Confidence', A: latestData.confidence, fullMark: 100 },
    { subject: 'Problem Solving', A: latestData.problemSolving, fullMark: 100 },
    { subject: 'Time Mgmt', A: latestData.timeManagement, fullMark: 100 }
  ] : [];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-slate-900 mb-2">Category Performance</h3>
      <p className="text-sm text-slate-500 mb-4">Based on your most recent interview</p>
      
      <div className="flex-1 w-full min-h-0 relative">
        {radarData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#E2E8F0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderColor: '#E2E8F0', color: '#0F172A', borderRadius: '0.5rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                itemStyle={{ color: '#2563EB' }}
              />
              <Radar 
                name="Score" 
                dataKey="A" 
                stroke="#2563EB" 
                fill="#2563EB" 
                fillOpacity={0.2} 
              />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
            No category data available
          </div>
        )}
      </div>
    </div>
  );
};
