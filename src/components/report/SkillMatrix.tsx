import React from 'react';
import type { SkillAnalysis } from '../../../server/src/types/interviewReport';
import { Star, Layers } from 'lucide-react';

interface Props {
  skills: SkillAnalysis[];
}

export const SkillMatrix: React.FC<Props> = ({ skills }) => {
  const getRating = (proficiency: string) => {
    switch(proficiency) {
      case 'Expert': return 5;
      case 'Advanced': return 4;
      case 'Intermediate': return 3;
      case 'Beginner': return 2;
      default: return 1;
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<Star key={i} size={18} className="fill-blue-500 text-blue-500" />);
      } else {
        stars.push(<Star key={i} size={18} className="text-slate-200" />);
      }
    }
    return stars;
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
          <Layers size={20} />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Skill Matrix</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="pb-4 pt-2 font-semibold text-slate-500 uppercase tracking-wider text-sm">Skill</th>
              <th className="pb-4 pt-2 font-semibold text-slate-500 uppercase tracking-wider text-sm">Proficiency</th>
              <th className="pb-4 pt-2 font-semibold text-slate-500 uppercase tracking-wider text-sm text-right pr-4">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {skills.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-6 text-center text-slate-500 italic">No specific technical skills were extracted during this session.</td>
              </tr>
            ) : (
              skills.map((skill, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 font-medium text-slate-800">{skill.skillName}</td>
                  <td className="py-4">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold uppercase tracking-wider">
                      {skill.proficiencyLevel}
                    </span>
                  </td>
                  <td className="py-4 flex justify-end gap-1 pr-4">
                    {renderStars(getRating(skill.proficiencyLevel))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
