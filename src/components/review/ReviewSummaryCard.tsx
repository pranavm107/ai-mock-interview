import type { InterviewReview } from '../../types/review';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Star, TrendingUp } from 'lucide-react';

interface ReviewSummaryCardProps {
  review: InterviewReview;
}

export function ReviewSummaryCard({ review }: ReviewSummaryCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const stars = Math.round((review.overallScore / 100) * 5);

  return (
    <Card className="bg-zinc-900/60 border-zinc-800 shadow-xs overflow-hidden relative rounded-xl">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
      <CardHeader className="p-4 sm:p-5 pb-2">
        <CardTitle className="text-base sm:text-lg font-bold flex items-center justify-between">
          <span className="text-zinc-100">Overall Score</span>
          <div className="flex items-baseline space-x-1.5">
            <span className={`text-2xl sm:text-3xl font-extrabold ${getScoreColor(review.overallScore)}`}>
              {review.overallScore}
            </span>
            <span className="text-zinc-500 text-xs sm:text-sm">/ 100</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 pt-0">
        <div className="flex space-x-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < stars ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-700'}`}
            />
          ))}
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">AI Summary</h4>
            <p className="text-zinc-200 leading-relaxed text-xs sm:text-sm">
              {review.summary}
            </p>
          </div>

          <div className="pt-3 border-t border-zinc-800">
            <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
              Recommendation
            </h4>
            <p className="text-blue-400 font-medium text-xs sm:text-sm">
              {review.recommendation}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
