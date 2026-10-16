import React from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Circle, PlayCircle } from 'lucide-react';

interface EngineDailyGoal {
  id: string;
  title: string;
  completed: boolean;
}

interface DailyGoalsCardProps {
  goals: EngineDailyGoal[] | null;
}

export const DailyGoalsCard: React.FC<DailyGoalsCardProps> = ({ goals }) => {
  if (!goals) return null;

  const completedCount = goals.filter(t => t.completed).length;
  const totalCount = goals.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-xs"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5">
          <CheckSquare className="w-4 h-4 text-blue-600" />
          Daily Goals
        </h3>
        <span className="text-xs font-bold text-slate-500">{progressPercent}%</span>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          className="bg-blue-600 h-1.5 rounded-full"
        ></motion.div>
      </div>

      <div className="space-y-1.5">
        {goals.map((task, idx) => (
          <div key={task.id || idx} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group cursor-pointer">
            {task.completed ? (
              <CheckSquare className="w-4 h-4 text-green-500 shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded border border-slate-300 group-hover:border-blue-400 shrink-0 transition-colors flex items-center justify-center">
              </div>
            )}
            <span className={`text-xs font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'} leading-tight`}>
              {task.title}
            </span>
            {!task.completed && (
              <button className="ml-auto opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-700 transition-opacity">
                <PlayCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};
