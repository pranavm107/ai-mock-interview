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
    <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center justify-between">
          <span className="text-zinc-100">Overall Score</span>
          <div className="flex items-center space-x-2">
            <span className={`text-4xl font-extrabold ${getScoreColor(review.overallScore)}`}>
              {review.overallScore}
            </span>
            <span className="text-zinc-500 text-lg">/ 100</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-1 mb-6">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-6 h-6 ${i < stars ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-700'}`}
            />
          ))}
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">AI Summary</h4>
            <p className="text-zinc-200 leading-relaxed text-lg">
              {review.summary}
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Recommendation
            </h4>
            <p className="text-blue-400 font-medium">
              {review.recommendation}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
