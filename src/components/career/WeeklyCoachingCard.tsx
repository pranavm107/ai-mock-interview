import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, Lightbulb } from 'lucide-react';

interface WeeklyFocus {
  id: string;
  topic: string;
  description: string;
  status: string;
}

interface WeeklyCoachingCardProps {
  coaching: WeeklyFocus[] | null;
}

export const WeeklyCoachingCard: React.FC<WeeklyCoachingCardProps> = ({ coaching }) => {
  if (!coaching || coaching.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-6 shadow-md text-white relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3"></div>

      <div className="flex items-center gap-3 mb-6">
        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-bold">This Week's Focus</h3>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-indigo-100 mb-2 uppercase tracking-wider">Priority Tasks</h4>
          <ul className="space-y-2">
            {coaching.slice(0, 3).map((item, idx) => (
              <li key={idx} className="flex flex-col items-start gap-1 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-200 shrink-0" />
                  <span className="font-semibold text-sm">{item.topic}</span>
                </div>
                <span className="text-xs text-indigo-50 ml-6">{item.description}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="pt-2 border-t border-white/20">
          <h4 className="text-sm font-semibold text-indigo-100 mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" /> Quick Tip
          </h4>
          <p className="text-sm text-white/90 bg-white/5 p-3 rounded-lg border border-white/10">
            Keep practicing consistently!
          </p>
        </div>
      </div>
    </motion.div>
  );
};
