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
    <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg">
          <Layers size={18} />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-800">Skill Matrix</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="pb-2.5 pt-1">Skill</th>
              <th className="pb-2.5 pt-1">Proficiency</th>
              <th className="pb-2.5 pt-1 text-right pr-3">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {skills.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-5 text-center text-slate-500 italic">No specific technical skills were extracted during this session.</td>
              </tr>
            ) : (
              skills.map((skill, index) => (
                <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 font-medium text-slate-800">{skill.skillName}</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold uppercase tracking-wider">
                      {skill.proficiencyLevel}
                    </span>
                  </td>
                  <td className="py-2.5 flex justify-end gap-0.5 pr-3">
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
