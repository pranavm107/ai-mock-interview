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
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-zinc-100 mb-4">Question Analysis</h3>
      {questionReviews.map((qr, index) => {
        const isExpanded = expandedId === qr.id;

        return (
          <div key={qr.id || index} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden transition-all duration-200">
            <button
              onClick={() => toggleExpand(qr.id || String(index))}
              className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors text-left"
            >
              <div className="flex-1 pr-4">
                <span className="text-zinc-500 text-sm font-semibold mr-3">Q{index + 1}</span>
                <span className="text-zinc-200 font-medium line-clamp-1">{qr.question}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`font-bold ${getScoreColor(qr.score)}`}>{qr.score}/100</span>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
              </div>
            </button>

            {isExpanded && (
              <div className="p-4 border-t border-zinc-800 bg-zinc-900/30 space-y-6">
                
                {/* Answer Given */}
                <div>
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Candidate Answer</h4>
                  <div className="bg-zinc-950 p-3 rounded text-zinc-300 text-sm italic border border-zinc-800/50">
                    "{qr.candidateAnswer || 'No answer provided.'}"
                  </div>
                </div>

                {/* Feedback */}
                <div>
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Feedback</h4>
                  <p className="text-zinc-200 text-sm leading-relaxed">
                    {qr.feedback}
                  </p>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-500/10 border border-green-500/20 p-3 rounded">
                    <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2 flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" /> Strengths
                    </h4>
                    <ul className="list-disc list-inside text-sm text-green-200/80 space-y-1">
                      {qr.strengths.length > 0 ? qr.strengths.map((s, i) => <li key={i}>{s}</li>) : <li>None noted.</li>}
                    </ul>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 p-3 rounded">
                    <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2 flex items-center">
                      <XCircle className="w-3 h-3 mr-1" /> Needs Improvement
                    </h4>
                    <ul className="list-disc list-inside text-sm text-red-200/80 space-y-1">
                      {qr.weaknesses.length > 0 ? qr.weaknesses.map((w, i) => <li key={i}>{w}</li>) : <li>None noted.</li>}
                    </ul>
                  </div>
                </div>

                {/* Ideal Answer */}
                <div>
                  <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Ideal Answer Approach</h4>
                  <div className="bg-blue-950/20 p-3 rounded text-blue-200/90 text-sm border border-blue-900/30">
                    {qr.idealAnswer}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
