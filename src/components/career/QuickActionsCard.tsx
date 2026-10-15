import React from 'react';
import { motion } from 'framer-motion';
import { Play, FileText, Settings, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QuickActionsCard: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    { icon: Play, label: 'Start Mock Interview', color: 'bg-blue-100 text-blue-600', path: '/generate' },
    { icon: FileText, label: 'Update Resume', color: 'bg-indigo-100 text-indigo-600', path: '/resume' },
    { icon: BookOpen, label: 'View Roadmap', color: 'bg-emerald-100 text-emerald-600', path: '/dashboard' },
    { icon: Settings, label: 'Career Settings', color: 'bg-slate-100 text-slate-600', path: '/settings' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-xs"
    >
      <h3 className="text-xs sm:text-sm font-semibold text-slate-800 mb-3.5">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2.5">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-lg border border-slate-100 hover:border-slate-300 hover:shadow-xs transition-all bg-slate-50 group cursor-pointer"
          >
            <div className={`p-2 rounded-full ${action.color} mb-1.5 group-hover:scale-105 transition-transform`}>
              <action.icon className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-700 text-center leading-tight">{action.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};
