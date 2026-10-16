import type { InterviewReview } from '../../types/review';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ReviewStrengthsWeaknessesProps {
  review: InterviewReview;
}

export function ReviewStrengthsWeaknesses({ review }: ReviewStrengthsWeaknessesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 h-full">
      <Card className="bg-zinc-900/60 border-zinc-800 shadow-xs overflow-hidden h-full rounded-xl">
        <div className="h-0.5 w-full bg-emerald-500" />
        <CardHeader className="p-4 sm:p-5 pb-2">
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center text-zinc-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2" />
            Key Strengths
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-0">
          <ul className="space-y-2">
            {review.strengths.map((strength, index) => (
              <li key={index} className="flex items-start text-zinc-300 text-xs sm:text-sm">
                <span className="text-emerald-400 mr-2 mt-0.5">•</span>
                <span className="leading-relaxed">{strength}</span>
              </li>
            ))}
            {review.strengths.length === 0 && (
              <li className="text-zinc-500 italic text-xs">No significant strengths noted.</li>
            )}
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/60 border-zinc-800 shadow-xs overflow-hidden h-full rounded-xl">
        <div className="h-0.5 w-full bg-rose-500" />
        <CardHeader className="p-4 sm:p-5 pb-2">
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center text-zinc-100">
            <XCircle className="w-4 h-4 text-rose-400 mr-2" />
            Areas for Improvement
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-0">
          <ul className="space-y-2">
            {review.weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-start text-zinc-300 text-xs sm:text-sm">
                <span className="text-rose-400 mr-2 mt-0.5">•</span>
                <span className="leading-relaxed">{weakness}</span>
              </li>
            ))}
            {review.weaknesses.length === 0 && (
              <li className="text-zinc-500 italic text-xs">No major weaknesses noted.</li>
            )}
          </ul>

          {review.improvements.length > 0 && (
            <div className="mt-4 pt-3 border-t border-zinc-800">
              <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Action Items</h4>
              <ul className="space-y-1.5">
                {review.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start text-zinc-400 text-xs sm:text-sm">
                    <span className="text-blue-400 mr-2 mt-0.5">→</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
