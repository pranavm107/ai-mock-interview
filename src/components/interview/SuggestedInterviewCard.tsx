import React from 'react';
import type { SuggestedInterview } from '../../types/recommendation';
import { Sparkles, Briefcase, Clock, Target, HelpCircle, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SuggestedInterviewCardProps {
  recommendation: SuggestedInterview;
  onStart: () => void;
  onCustomize?: () => void;
  loading?: boolean;
}

const SuggestedInterviewCard: React.FC<SuggestedInterviewCardProps> = ({ recommendation, onStart, onCustomize, loading }) => {
  const navigate = useNavigate();

  const difficultyMap: Record<string, string> = {
    EASY: 'Easy',
    MEDIUM: 'Medium',
    HARD: 'Hard',
  };

  const displayDifficulty = difficultyMap[recommendation.difficulty] || recommendation.difficulty || 'Medium';
  const focusAreas = recommendation.focusAreas ?? [];
  const preparationFocus = recommendation.preparationFocus ?? [];
  const reason = recommendation.recommendationReason ?? "Recommended based on your profile and interview activity.";

  return (
    <div className="w-full bg-white rounded-xl shadow-xs border border-slate-200/90 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-5 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles size={80} />
        </div>
        <div className="relative z-10 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-blue-100 font-medium tracking-wide text-xs uppercase">
            <Sparkles size={14} />
            AI Recommended Interview
          </div>
          <h2 className="text-lg sm:text-xl font-bold">Based on your profile and recent performance</h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        {/* Core Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3.5 gap-x-4 mb-4 pb-4 border-b border-slate-100">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Briefcase size={12} /> Target Role
            </span>
            <p className="font-semibold text-slate-800 text-sm truncate">{recommendation.targetRole}</p>
            {recommendation.targetCompany && (
              <p className="text-xs text-slate-500 truncate">at {recommendation.targetCompany}</p>
            )}
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Target size={12} /> Interview Type
            </span>
            <p className="font-medium text-slate-800 text-xs sm:text-sm">{recommendation.interviewType}</p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} /> Difficulty
            </span>
            <div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                {displayDifficulty}
              </span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Briefcase size={12} /> Experience
            </span>
            <p className="font-medium text-slate-800 text-xs sm:text-sm">{recommendation.experienceLevel}</p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <HelpCircle size={12} /> Questions
            </span>
            <p className="font-medium text-slate-800 text-xs sm:text-sm">{recommendation.questionCount}</p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Clock size={12} /> Duration
            </span>
            <p className="font-medium text-slate-800 text-xs sm:text-sm">{recommendation.durationMinutes} mins</p>
          </div>
        </div>

        {/* Focus Areas */}
        {focusAreas.length > 0 && (
          <div className="mb-4">
            <span className="text-xs font-semibold text-slate-700 mb-2 block">Focus Areas</span>
            <div className="flex flex-wrap gap-1.5">
              {focusAreas.map((area, idx) => (
                <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommendation Reason */}
        <div className="mb-4 bg-slate-50/80 p-3.5 sm:p-4 rounded-xl border border-slate-200/70">
          <span className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <BookOpen size={14} className="text-indigo-500" />
            Why we recommend this
          </span>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {reason}
          </p>
        </div>

        {/* Coaching & Prep (Optional) */}
        {(recommendation.coachingMessage || preparationFocus.length > 0) && (
          <div className="mb-4 space-y-2.5">
            {recommendation.coachingMessage && (
              <div className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-lg">
                <span className="text-xs font-semibold text-amber-800 block mb-0.5">Coach's Tip</span>
                <p className="text-xs text-amber-700 italic">"{recommendation.coachingMessage}"</p>
              </div>
            )}
            {preparationFocus.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1.5">Preparation Focus</span>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                  {preparationFocus.map((focus, idx) => (
                    <li key={idx}>{focus}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Actions (pushed to bottom) */}
        <div className="mt-auto flex flex-col sm:flex-row items-center gap-3 pt-3.5 border-t border-slate-100">
          <button
            onClick={onStart}
            disabled={loading}
            className="w-full sm:w-auto px-5 h-9 bg-blue-600 text-white font-medium text-xs sm:text-sm rounded-lg shadow-xs hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Starting...
              </span>
            ) : (
              'Start Recommended Interview'
            )}
          </button>

          <button
            onClick={onCustomize ? onCustomize : () => navigate('/generate')}
            disabled={loading}
            className="w-full sm:w-auto px-4 h-9 text-slate-600 font-medium text-xs sm:text-sm hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            Customize Instead
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuggestedInterviewCard;
