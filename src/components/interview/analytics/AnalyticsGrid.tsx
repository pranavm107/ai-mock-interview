import React from 'react';
import { MetricCard } from './MetricCard';
import type { LiveEvaluation } from '../../../types/liveEvaluation';
import { Code2, MessagesSquare, Lightbulb, TrendingUp, Users } from 'lucide-react';

interface AnalyticsGridProps {
  evaluation: LiveEvaluation;
}

export const AnalyticsGrid: React.FC<AnalyticsGridProps> = ({ evaluation }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <MetricCard
        title="Technical"
        score={evaluation.technicalScore}
        icon={<Code2 size={18} />}
      />
      <MetricCard
        title="Communication"
        score={evaluation.communicationScore}
        icon={<MessagesSquare size={18} />}
      />
      <MetricCard
        title="Problem Solving"
        score={evaluation.problemSolvingScore}
        icon={<Lightbulb size={18} />}
      />
      <MetricCard
        title="Confidence"
        score={evaluation.confidenceScore}
        icon={<TrendingUp size={18} />}
      />
      {evaluation.behavioralScore > 0 && (
        <MetricCard
          title="Behavioral"
          score={evaluation.behavioralScore}
          icon={<Users size={18} />}
        />
      )}
      {evaluation.leadershipScore > 0 && (
        <MetricCard
          title="Leadership"
          score={evaluation.leadershipScore}
          icon={<Users size={18} />}
        />
      )}
    </div>
  );
};
