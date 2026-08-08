import React from 'react';
import { AchievementCategory } from '../../types/achievement';

export type FilterStatus = 'ALL' | 'UNLOCKED' | 'LOCKED';
export type FilterCategory = 'ALL' | AchievementCategory;

interface AchievementFiltersProps {
  statusFilter: FilterStatus;
  setStatusFilter: (status: FilterStatus) => void;
  categoryFilter: FilterCategory;
  setCategoryFilter: (category: FilterCategory) => void;
}

export const AchievementFilters: React.FC<AchievementFiltersProps> = ({
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter
}) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
      <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            statusFilter === 'ALL' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter('UNLOCKED')}
          className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            statusFilter === 'UNLOCKED' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Unlocked
        </button>
        <button
          onClick={() => setStatusFilter('LOCKED')}
          className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            statusFilter === 'LOCKED' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Locked
        </button>
      </div>

      <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
        <div className="flex gap-2">
          {['ALL', ...Object.values(AchievementCategory)].map((category) => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category as FilterCategory)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                categoryFilter === category
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {category === 'ALL' ? 'All Categories' : category.charAt(0) + category.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
