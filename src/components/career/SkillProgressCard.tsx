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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm col-span-1 lg:col-span-2 flex flex-col md:flex-row gap-6 items-center"
    >
      <div className="w-full md:w-1/2">
        <div className="flex items-center gap-2 mb-4">
          <Code2 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-800">Skill Matrix</h3>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Skills" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
              <Tooltip 
                wrapperClassName="rounded-xl shadow-lg border-none" 
                formatter={(value: any) => [value === null ? 'N/A' : `${value}/100`, 'Score']}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="w-full md:w-1/2">
        <h4 className="text-sm font-bold text-slate-800 mb-4">Recommended to Improve</h4>
        <div className="flex flex-wrap gap-2">
          {recommendedSkills.map((skill, idx) => (
            <span key={idx} className="bg-blue-50 text-blue-700 border border-blue-100 text-sm font-medium px-3 py-1.5 rounded-xl shadow-sm">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
