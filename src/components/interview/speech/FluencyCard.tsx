import React from 'react';
import { CardWrapper, ScoreCircle } from './CommunicationScore';

export interface FluencyCardProps {
  score: number;
  delay?: number;
}

export const FluencyCard: React.FC<FluencyCardProps> = ({ score, delay = 0 }) => {
  let color = "text-red-400";
  if (score >= 80) color = "text-emerald-400";
  else if (score >= 60) color = "text-amber-400";

  return (
    <CardWrapper title="Fluency" icon="🌊" delay={delay}>
      <div className="flex items-center justify-between">
        <ScoreCircle score={score} size={50} strokeWidth={3} color={color} />
        <div className="text-right">
          <div className="text-white/70 text-xs">Score</div>
          <div className="text-white font-medium">{score >= 80 ? 'Great' : score >= 60 ? 'Fair' : 'Needs Work'}</div>
        </div>
      </div>
    </CardWrapper>
  );
};
