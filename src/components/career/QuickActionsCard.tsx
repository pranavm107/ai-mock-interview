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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
    >
      <h3 className="text-lg font-bold text-slate-800 mb-6">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all bg-slate-50 group"
          >
            <div className={`p-3 rounded-full ${action.color} mb-3 group-hover:scale-110 transition-transform`}>
              <action.icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-700 text-center">{action.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};
