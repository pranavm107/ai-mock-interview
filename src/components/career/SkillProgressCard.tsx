import React from 'react';
import { motion } from 'framer-motion';
import { Code2 } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

interface SkillProgressCardProps {
  recommendedSkills: string[];
  skills?: Record<string, number>;
}

export const SkillProgressCard: React.FC<SkillProgressCardProps> = ({ recommendedSkills, skills = {} }) => {
  const defaultSkills = ['Algorithms', 'System Design', 'Communication', 'Leadership', 'Problem Solving'];
  
  const chartData = defaultSkills.map(subject => ({
    subject,
    A: skills[subject] !== undefined ? skills[subject] : null,
    fullMark: 100
  }));
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-xs col-span-1 lg:col-span-2 flex flex-col md:flex-row gap-4 sm:gap-5 items-center"
    >
      <div className="w-full md:w-1/2">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Code2 className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs sm:text-sm font-semibold text-slate-800">Skill Matrix</h3>
        </div>
        <div className="h-44 sm:h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Skills" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
              <Tooltip
                wrapperClassName="rounded-lg shadow-md border-none text-xs"
                formatter={(value: any) => [value === null ? 'N/A' : `${value}/100`, 'Score']}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="w-full md:w-1/2">
        <h4 className="text-xs sm:text-sm font-semibold text-slate-800 mb-2.5">Recommended to Improve</h4>
        <div className="flex flex-wrap gap-1.5">
          {recommendedSkills.map((skill, idx) => (
            <span key={idx} className="bg-blue-50 text-blue-700 border border-blue-100 text-xs font-medium px-2.5 py-1 rounded-lg shadow-2xs">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
