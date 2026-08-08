import React, { useMemo } from 'react';
import type { ActivityHeatmap as ActivityHeatmapType } from '../../types/analytics';

interface ActivityHeatmapProps {
  data: ActivityHeatmapType;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ data }) => {
  // Generate 90 days of history
  const days = useMemo(() => {
    const arr = [];
    const today = new Date();
    
    // Map dates to counts for quick lookup
    const counts = new Map(data.map(d => [d.date, d.completedCount]));

    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = counts.get(dateStr) || 0;
      arr.push({ date: dateStr, count });
    }
    return arr;
  }, [data]);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-slate-100';
    if (count === 1) return 'bg-blue-200';
    if (count === 2) return 'bg-blue-400';
    if (count === 3) return 'bg-blue-600';
    return 'bg-blue-800';
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Activity Heatmap</h3>
        <span className="text-xs text-slate-500">Last 90 days</span>
      </div>
      
      <div className="w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
        <div className="flex gap-[3px] min-w-max">
          {/* Group into weeks (7 days per column) */}
          {Array.from({ length: Math.ceil(days.length / 7) }).map((_, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-[3px]">
              {days.slice(colIndex * 7, (colIndex + 1) * 7).map((day, rowIndex) => (
                <div 
                  key={day.date}
                  title={`${day.count} interviews on ${day.date}`}
                  className={`w-[14px] h-[14px] rounded-sm transition-colors duration-200 ${getColor(day.count)} hover:ring-2 hover:ring-blue-400`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full flex justify-end items-center mt-4 space-x-2 text-xs text-slate-500">
        <span>Less</span>
        <div className="flex gap-[3px]">
          <div className="w-[12px] h-[12px] rounded-sm bg-slate-100" />
          <div className="w-[12px] h-[12px] rounded-sm bg-blue-200" />
          <div className="w-[12px] h-[12px] rounded-sm bg-blue-400" />
          <div className="w-[12px] h-[12px] rounded-sm bg-blue-600" />
          <div className="w-[12px] h-[12px] rounded-sm bg-blue-800" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};
