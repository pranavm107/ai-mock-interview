import React from 'react';
import { Search, Filter, SlidersHorizontal, Briefcase } from 'lucide-react';
import type { InterviewStatus, InterviewDifficulty, InterviewType } from '../../types';

interface Props {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  statusFilter: InterviewStatus | 'All';
  onStatusChange: (val: InterviewStatus | 'All') => void;
  difficultyFilter: InterviewDifficulty | 'All';
  onDifficultyChange: (val: InterviewDifficulty | 'All') => void;
  typeFilter: InterviewType | 'All';
  onTypeChange: (val: InterviewType | 'All') => void;
}

export const InterviewFilters: React.FC<Props> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  difficultyFilter,
  onDifficultyChange,
  typeFilter,
  onTypeChange
}) => {
  return (
    <div className="flex flex-col xl:flex-row gap-4 mb-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
      {/* Search Box */}
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={18} className="text-slate-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by role or company..."
          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 outline-none font-medium placeholder:text-slate-400 placeholder:font-normal hover:border-slate-300"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Filter size={16} />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as any)}
            className="pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-semibold text-slate-700 outline-none cursor-pointer hover:border-slate-300"
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Ready">Ready</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Briefcase size={16} />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value as any)}
            className="pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-semibold text-slate-700 outline-none cursor-pointer hover:border-slate-300"
          >
            <option value="All">All Types</option>
            <option value="Technical">Technical</option>
            <option value="Behavioral">Behavioral</option>
            <option value="HR">HR</option>
            <option value="Mixed">Mixed</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <SlidersHorizontal size={16} />
          </div>
          <select
            value={difficultyFilter}
            onChange={(e) => onDifficultyChange(e.target.value as any)}
            className="pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-semibold text-slate-700 outline-none cursor-pointer hover:border-slate-300"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
          </div>
        </div>
      </div>
    </div>
  );
};
