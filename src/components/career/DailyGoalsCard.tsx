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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-blue-600" />
          Daily Goals
        </h3>
        <span className="text-sm font-bold text-slate-500">{progressPercent}%</span>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-2 mb-6">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          className="bg-blue-600 h-2 rounded-full"
        ></motion.div>
      </div>

      <div className="space-y-3">
        {goals.map((task, idx) => (
          <div key={task.id || idx} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group cursor-pointer">
            {task.completed ? (
              <CheckSquare className="w-5 h-5 text-green-500 shrink-0" />
            ) : (
              <div className="w-5 h-5 rounded-md border-2 border-slate-300 group-hover:border-blue-400 shrink-0 transition-colors flex items-center justify-center">
              </div>
            )}
            <span className={`text-sm font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
              {task.title}
            </span>
            {!task.completed && (
              <button className="ml-auto opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-700 transition-opacity">
                <PlayCircle className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};
