import React, { useState } from 'react';
import type { QuestionEvaluation } from '../../../server/src/types/interviewReport';
import { CheckCircle2, ChevronDown, ChevronUp, AlertCircle, Clock, MessageSquare, Target, SkipForward } from 'lucide-react';

interface Props {
  evaluations: QuestionEvaluation[];
}

export const QuestionReview: React.FC<Props> = ({ evaluations }) => {
  const [expanded, setExpanded] = useState<string | null>(evaluations[0]?.questionId || null);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-slate-800 mb-6">Question by Question Review</h3>
      
      {evaluations.map((ev, index) => {
        const isExpanded = expanded === ev.questionId;
        const avgScore = Math.round((ev.correctness + ev.completeness + ev.technicalDepth) / 3);
        
        return (
          <div key={ev.questionId} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all">
            <button 
              onClick={() => setExpanded(isExpanded ? null : ev.questionId)}
              className="w-full text-left p-6 flex items-start justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex gap-4 pr-8 flex-1">
                <div className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${avgScore >= 80 ? 'bg-emerald-100 text-emerald-700' : 
                    avgScore >= 60 ? 'bg-orange-100 text-orange-700' : 
                    'bg-red-100 text-red-700'}`}
                >
                  Q{index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {ev.durationMs === 0 ? (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-500 flex items-center gap-1"><SkipForward size={12}/> Skipped</span>
                    ) : avgScore >= 80 ? (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-700 flex items-center gap-1"><CheckCircle2 size={12}/> Correct</span>
                    ) : avgScore >= 50 ? (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-700 flex items-center gap-1"><AlertCircle size={12}/> Partial</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700 flex items-center gap-1"><AlertCircle size={12}/> Incorrect</span>
                    )}
                  </div>
                  <h4 className="text-lg font-semibold text-slate-800 leading-tight">{ev.questionText}</h4>
                  <div className="flex gap-4 mt-3 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><Target size={14} /> Score: {avgScore}/100</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {Math.round(ev.durationMs / 1000)}s</span>
                  </div>
                </div>
              </div>
              <div className="shrink-0 p-2 text-slate-400">
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>
            
            {isExpanded && (
              <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-6">
                <div>
                  <h5 className="flex items-center gap-2 text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">
                    <MessageSquare size={16} /> Your Answer
                  </h5>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {ev.userAnswer}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="flex items-center gap-2 text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-3">
                      <CheckCircle2 size={16} /> What you did well
                    </h5>
                    <ul className="space-y-2">
                      {ev.goodPoints.length > 0 ? ev.goodPoints.map((point, i) => (
                        <li key={i} className="flex gap-2 text-slate-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-sm">
                          <span className="text-emerald-500 mt-0.5">•</span> {point}
                        </li>
                      )) : (
                        <li className="text-slate-500 text-sm italic">None identified.</li>
                      )}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="flex items-center gap-2 text-sm font-semibold text-rose-700 uppercase tracking-wider mb-3">
                      <AlertCircle size={16} /> Areas to improve
                    </h5>
                    <ul className="space-y-2">
                      {ev.areasForImprovement.length > 0 ? ev.areasForImprovement.map((point, i) => (
                        <li key={i} className="flex gap-2 text-slate-600 bg-rose-50 p-3 rounded-lg border border-rose-100 text-sm">
                          <span className="text-rose-500 mt-0.5">•</span> {point}
                        </li>
                      )) : (
                        <li className="text-slate-500 text-sm italic">None identified.</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Detailed Feedback</h5>
                  <p className="text-slate-600 text-sm leading-relaxed">{ev.feedback}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
