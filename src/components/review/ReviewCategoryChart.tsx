import type { InterviewReview } from '../../types/review';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface ReviewCategoryChartProps {
  review: InterviewReview;
}

export function ReviewCategoryChart({ review }: ReviewCategoryChartProps) {
  const data = [
    { subject: 'Technical', A: review.technicalScore, fullMark: 100 },
    { subject: 'Communication', A: review.communicationScore, fullMark: 100 },
    { subject: 'Confidence', A: review.confidenceScore, fullMark: 100 },
    { subject: 'Fluency', A: review.fluencyScore, fullMark: 100 },
    { subject: 'Relevance', A: review.relevanceScore, fullMark: 100 },
    { subject: 'Professionalism', A: review.professionalismScore, fullMark: 100 },
  ];

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 shadow-xl overflow-hidden h-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-zinc-100">Category Analysis</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#3f3f46" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#52525b' }} axisLine={false} />
            <Radar
              name="Score"
              dataKey="A"
              stroke="#60a5fa"
              fill="#3b82f6"
              fillOpacity={0.5}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5' }}
              itemStyle={{ color: '#60a5fa' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
