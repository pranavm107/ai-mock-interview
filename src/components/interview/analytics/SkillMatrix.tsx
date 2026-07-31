import React from 'react';
import { SkillRow } from './SkillRow';
import type { SkillScore } from '../../../types/liveEvaluation';

interface SkillMatrixProps {
  skills: SkillScore[];
}

export const SkillMatrix: React.FC<SkillMatrixProps> = ({ skills }) => {
  if (!skills || skills.length === 0) return null;

  // Sort by highest score first and limit to top 10 to keep UI clean
  const sortedSkills = [...skills].sort((a, b) => b.score - a.score).slice(0, 10);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800 mb-4 uppercase tracking-wider">Detected Skills</h3>
      <div className="space-y-3">
        {sortedSkills.map((skill, index) => (
          <SkillRow key={`${skill.name}-${index}`} name={skill.name} score={skill.score} />
        ))}
      </div>
    </div>
  );
};
