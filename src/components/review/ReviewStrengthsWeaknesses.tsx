import type { InterviewReview } from '../../types/review';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ReviewStrengthsWeaknessesProps {
  review: InterviewReview;
}

export function ReviewStrengthsWeaknesses({ review }: ReviewStrengthsWeaknessesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
      <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl overflow-hidden h-full">
        <div className="h-1 w-full bg-green-500" />
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center text-zinc-100">
            <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
            Key Strengths
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {review.strengths.map((strength, index) => (
              <li key={index} className="flex items-start text-zinc-300">
                <span className="text-green-500 mr-2 mt-0.5">•</span>
                <span className="leading-relaxed">{strength}</span>
              </li>
            ))}
            {review.strengths.length === 0 && (
              <li className="text-zinc-500 italic">No significant strengths noted.</li>
            )}
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl overflow-hidden h-full">
        <div className="h-1 w-full bg-red-500" />
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center text-zinc-100">
            <XCircle className="w-5 h-5 text-red-500 mr-2" />
            Areas for Improvement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {review.weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-start text-zinc-300">
                <span className="text-red-500 mr-2 mt-0.5">•</span>
                <span className="leading-relaxed">{weakness}</span>
              </li>
            ))}
            {review.weaknesses.length === 0 && (
              <li className="text-zinc-500 italic">No major weaknesses noted.</li>
            )}
          </ul>
          
          {review.improvements.length > 0 && (
            <div className="mt-6 pt-4 border-t border-zinc-800">
              <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Action Items</h4>
              <ul className="space-y-2">
                {review.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start text-zinc-400 text-sm">
                    <span className="text-blue-500 mr-2 mt-0.5">→</span>
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
