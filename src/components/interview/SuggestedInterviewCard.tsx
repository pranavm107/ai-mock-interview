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
    <div className="w-full bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles size={120} />
        </div>
        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-blue-100 font-medium tracking-wide text-sm uppercase">
            <Sparkles size={16} />
            AI Recommended Interview
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mt-1">Based on your profile and recent performance</h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 flex flex-col flex-grow">
        
        {/* Core Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 mb-8 pb-8 border-b border-slate-100">
          
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Briefcase size={14} /> Target Role</span>
            <p className="font-medium text-slate-800 text-lg">{recommendation.targetRole}</p>
            {recommendation.targetCompany && (
              <p className="text-sm text-slate-500">at {recommendation.targetCompany}</p>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Target size={14} /> Interview Type</span>
            <p className="font-medium text-slate-800">{recommendation.interviewType}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Sparkles size={14} /> Difficulty</span>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 mt-1">
              {displayDifficulty}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Briefcase size={14} /> Experience</span>
            <p className="font-medium text-slate-800">{recommendation.experienceLevel}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><HelpCircle size={14} /> Questions</span>
            <p className="font-medium text-slate-800">{recommendation.questionCount}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Clock size={14} /> Duration</span>
            <p className="font-medium text-slate-800">{recommendation.durationMinutes} minutes</p>
          </div>

        </div>

        {/* Focus Areas */}
        {focusAreas.length > 0 && (
          <div className="mb-8">
            <span className="text-sm font-semibold text-slate-700 mb-3 block">Focus Areas</span>
            <div className="flex flex-wrap gap-2">
              {focusAreas.map((area, idx) => (
                <span key={idx} className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommendation Reason */}
        <div className="mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-100">
          <span className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <BookOpen size={16} className="text-indigo-500" />
            Why we recommend this
          </span>
          <p className="text-sm text-slate-600 leading-relaxed">
            {reason}
          </p>
        </div>
        
        {/* Coaching & Prep (Optional) */}
        {(recommendation.coachingMessage || preparationFocus.length > 0) && (
          <div className="mb-8 space-y-4">
             {recommendation.coachingMessage && (
               <div>
                  <span className="text-sm font-semibold text-slate-700 block mb-1">Coach's Tip</span>
                  <p className="text-sm text-slate-600 italic">"{recommendation.coachingMessage}"</p>
               </div>
             )}
             {preparationFocus.length > 0 && (
               <div>
                 <span className="text-sm font-semibold text-slate-700 block mb-2">Preparation Focus</span>
                 <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                   {preparationFocus.map((focus, idx) => (
                     <li key={idx}>{focus}</li>
                   ))}
                 </ul>
               </div>
             )}
          </div>
        )}

        {/* Actions (pushed to bottom) */}
        <div className="mt-auto flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-100">
          <button
            onClick={onStart}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-xl shadow-sm hover:bg-blue-700 hover:shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            className="w-full sm:w-auto px-6 py-3.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
          >
            Customize Instead
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuggestedInterviewCard;
