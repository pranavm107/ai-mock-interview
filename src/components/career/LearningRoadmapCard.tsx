import React from 'react';
import { motion } from 'framer-motion';
import { Map, Clock, ArrowRight } from 'lucide-react';

interface EngineRoadmapItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  status: string;
}

interface LearningRoadmapCardProps {
  roadmap: EngineRoadmapItem[] | null;
}

export const LearningRoadmapCard: React.FC<LearningRoadmapCardProps> = ({ roadmap }) => {
  if (!roadmap || roadmap.length === 0) return null;

  const thisWeek = roadmap.filter(r => r.status === 'available' || r.duration === '1 week');
  const thisMonth = roadmap.filter(r => r.status === 'locked' && r.duration !== '1 week');

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-xs col-span-1 lg:col-span-2"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5">
          <Map className="w-4 h-4 text-blue-600" />
          Learning Roadmap
        </h3>
        <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
          View Full Plan <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* This Week */}
        <div className="space-y-3 relative">
          <div className="absolute left-2.5 top-2 bottom-0 w-px bg-slate-200"></div>
          <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-2 bg-white relative z-10 pl-6">
            <div className="absolute left-1.5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white"></div>
            Next Steps
          </h4>
          <div className="pl-6 space-y-2">
            {thisWeek.map((item, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-100 rounded-lg p-3 shadow-2xs hover:shadow-xs transition-shadow">
                <div className="flex justify-between items-start mb-1">
                  <h5 className="font-semibold text-xs sm:text-sm text-slate-800">{item.title}</h5>
                  <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.duration}
                  </span>
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">{item.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* This Month */}
        <div className="space-y-3 relative">
          <div className="absolute left-2.5 top-2 bottom-0 w-px bg-slate-200"></div>
          <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-2 bg-white relative z-10 pl-6">
            <div className="absolute left-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white"></div>
            Upcoming
          </h4>
          <div className="pl-6 space-y-2">
            {thisMonth.map((item, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3 hover:border-slate-300 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <h5 className="font-semibold text-xs sm:text-sm text-slate-700">{item.title}</h5>
                </div>
                <div className="flex gap-2">
                  <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.duration}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
