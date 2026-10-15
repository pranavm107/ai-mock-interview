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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl p-4 sm:p-5 shadow-xs text-white relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none translate-x-1/3 -translate-y-1/3"></div>

      <div className="flex items-center gap-2 mb-3.5">
        <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
          <Calendar className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-xs sm:text-sm font-semibold">This Week's Focus</h3>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="text-[11px] font-semibold text-indigo-100 mb-1.5 uppercase tracking-wider">Priority Tasks</h4>
          <ul className="space-y-1.5">
            {coaching.slice(0, 3).map((item, idx) => (
              <li key={idx} className="flex flex-col items-start gap-0.5 bg-white/10 rounded-lg p-2.5 backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-200 shrink-0" />
                  <span className="font-semibold text-xs sm:text-sm">{item.topic}</span>
                </div>
                <span className="text-[11px] text-indigo-50 ml-5 leading-relaxed">{item.description}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="pt-2 border-t border-white/20">
          <h4 className="text-[11px] font-semibold text-indigo-100 mb-1 uppercase tracking-wider flex items-center gap-1">
            <Lightbulb className="w-3 h-3" /> Quick Tip
          </h4>
          <p className="text-xs text-white/90 bg-white/5 p-2 rounded-lg border border-white/10">
            Keep practicing consistently!
          </p>
        </div>
      </div>
    </motion.div>
  );
};
