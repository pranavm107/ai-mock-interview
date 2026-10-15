import { useState } from 'react';
import type { QuestionReview } from '../../types/review';
import { ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';

interface ReviewQuestionListProps {
  questionReviews: QuestionReview[];
}

export function ReviewQuestionList({ questionReviews }: ReviewQuestionListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(questionReviews[0]?.id || null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-rose-400';
  };

  return (
    <div className="space-y-3">
      <h3 className="text-base sm:text-lg font-bold text-zinc-100">Question Analysis</h3>
      <div className="space-y-2">
        {questionReviews.map((qr, index) => {
          const isExpanded = expandedId === qr.id;

          return (
            <div key={qr.id || index} className="bg-zinc-900/70 border border-zinc-800 rounded-xl overflow-hidden transition-all duration-200">
              <button
                onClick={() => toggleExpand(qr.id || String(index))}
                className="w-full flex items-center justify-between p-3.5 hover:bg-zinc-800/50 transition-colors text-left cursor-pointer"
              >
                <div className="flex-1 pr-3 flex items-center">
                  <span className="text-zinc-500 text-xs font-semibold mr-2 shrink-0">Q{index + 1}</span>
                  <span className="text-zinc-200 font-medium text-xs sm:text-sm line-clamp-1">{qr.question}</span>
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                  <span className={`font-bold text-xs sm:text-sm ${getScoreColor(qr.score)}`}>{qr.score}/100</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                </div>
              </button>

              {isExpanded && (
                <div className="p-3.5 sm:p-4 border-t border-zinc-800 bg-zinc-900/40 space-y-3.5">
                  {/* Answer Given */}
                  <div>
                    <h4 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Candidate Answer</h4>
                    <div className="bg-zinc-950/80 p-2.5 rounded-lg text-zinc-300 text-xs sm:text-sm italic border border-zinc-800/60 leading-relaxed">
                      "{qr.candidateAnswer || 'No answer provided.'}"
                    </div>
                  </div>

                  {/* Feedback */}
                  <div>
                    <h4 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Feedback</h4>
                    <p className="text-zinc-200 text-xs sm:text-sm leading-relaxed">
                      {qr.feedback}
                    </p>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 sm:p-3 rounded-lg">
                      <h4 className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" /> Strengths
                      </h4>
                      <ul className="list-disc list-inside text-xs text-emerald-200/90 space-y-0.5">
                        {qr.strengths.length > 0 ? qr.strengths.map((s, i) => <li key={i}>{s}</li>) : <li>None noted.</li>}
                      </ul>
                    </div>
                    <div className="bg-rose-500/10 border border-rose-500/20 p-2.5 sm:p-3 rounded-lg">
                      <h4 className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider mb-1.5 flex items-center">
                        <XCircle className="w-3 h-3 mr-1" /> Needs Improvement
                      </h4>
                      <ul className="list-disc list-inside text-xs text-rose-200/90 space-y-0.5">
                        {qr.weaknesses.length > 0 ? qr.weaknesses.map((w, i) => <li key={i}>{w}</li>) : <li>None noted.</li>}
                      </ul>
                    </div>
                  </div>

                  {/* Ideal Answer */}
                  <div>
                    <h4 className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider mb-1">Ideal Answer Approach</h4>
                    <div className="bg-blue-950/20 p-2.5 sm:p-3 rounded-lg text-blue-200/90 text-xs sm:text-sm border border-blue-900/30 leading-relaxed">
                      {qr.idealAnswer}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
