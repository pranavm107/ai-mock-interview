import React from 'react';
import type { Recommendation, ImprovementPlan, SkillAnalysis } from '../../../server/src/types/interviewReport';
import { TrendingUp, TrendingDown, Lightbulb, Compass, BookOpen } from 'lucide-react';

interface Props {
  strengths: string[];
  weaknesses: string[];
  recommendations: Recommendation[];
  improvementPlan: ImprovementPlan;
  skillsAnalysis: SkillAnalysis[];
}

export const ActionableInsights: React.FC<Props> = ({ strengths, weaknesses, recommendations, improvementPlan, skillsAnalysis }) => {
  return (
    <div className="space-y-8">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingUp size={24} /></div>
            <h3 className="text-xl font-bold text-slate-800">Key Strengths</h3>
          </div>
          <ul className="space-y-3">
            {strengths.map((str, i) => (
              <li key={i} className="flex gap-3 text-slate-700 font-medium">
                <span className="text-emerald-500 mt-1">•</span> {str}
              </li>
            ))}
            {strengths.length === 0 && <li className="text-slate-500 italic text-sm">Not enough data to determine strengths.</li>}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><TrendingDown size={24} /></div>
            <h3 className="text-xl font-bold text-slate-800">Areas for Improvement</h3>
          </div>
          <ul className="space-y-3">
            {weaknesses.map((wk, i) => (
              <li key={i} className="flex gap-3 text-slate-700 font-medium">
                <span className="text-rose-500 mt-1">•</span> {wk}
              </li>
            ))}
            {weaknesses.length === 0 && <li className="text-slate-500 italic text-sm">No critical weaknesses detected.</li>}
          </ul>
        </div>
      </div>

      {/* Improvement Roadmap */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-30"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <Compass size={28} className="text-indigo-300" />
            <h3 className="text-2xl font-bold">Your Improvement Roadmap</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Short Term */}
            <div>
              <h4 className="text-indigo-200 font-semibold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                <Lightbulb size={16} /> This Week
              </h4>
              <ul className="space-y-4">
                {improvementPlan.shortTerm.map((item, i) => (
                  <li key={i} className="flex gap-3 items-start bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold">{i+1}</span>
                    <span className="text-slate-200 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Long Term */}
            <div>
              <h4 className="text-indigo-200 font-semibold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                <TargetIcon /> This Month
              </h4>
              <ul className="space-y-4">
                {improvementPlan.longTerm.map((item, i) => (
                  <li key={i} className="flex gap-3 items-start bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold">{i+1}</span>
                    <span className="text-slate-200 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Practice Topics */}
            <div>
              <h4 className="text-indigo-200 font-semibold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={16} /> Practice Topics
              </h4>
              <div className="flex flex-wrap gap-2">
                {improvementPlan.recommendedPracticeTopics.map((topic, i) => (
                  <span key={i} className="px-3 py-1.5 bg-indigo-500/20 text-indigo-100 border border-indigo-500/30 rounded-lg text-sm font-medium">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
      
    </div>
  );
};

const TargetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
