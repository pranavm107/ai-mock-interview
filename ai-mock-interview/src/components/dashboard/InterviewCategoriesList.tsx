import React from 'react';
import { Code2, Server, Layout, Database, Terminal, BrainCircuit, LineChart, Users, Boxes } from 'lucide-react';

const categories = [
  { name: 'Frontend', icon: Layout, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
  { name: 'Backend', icon: Server, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  { name: 'React', icon: Code2, color: 'text-cyan-500', bg: 'bg-cyan-50', border: 'border-cyan-100' },
  { name: 'Node.js', icon: Terminal, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-100' },
  { name: 'Java', icon: Database, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
  { name: 'Python', icon: Code2, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-100' },
  { name: 'AI / ML', icon: BrainCircuit, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100' },
  { name: 'Data Science', icon: LineChart, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100' },
  { name: 'Behavioral', icon: Users, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' },
  { name: 'System Design', icon: Boxes, color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200' },
];

export const InterviewCategoriesList: React.FC = () => {
  return (
    <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Explore Categories</h2>
        <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
          View All
        </button>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {categories.map((cat, idx) => (
          <button 
            key={idx}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-full hover:border-blue-300 hover:shadow-sm transition-all group"
          >
            <div className={`p-1.5 rounded-full ${cat.bg} ${cat.border} border group-hover:scale-110 transition-transform`}>
              <cat.icon size={14} className={cat.color} />
            </div>
            <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
