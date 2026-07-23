import React from 'react';
import { CardWrapper } from './CommunicationScore';
import type { PauseMetrics } from '../../../types/speech';

export interface PauseCardProps {
  pauses: PauseMetrics;
  delay?: number;
}

export const PauseCard: React.FC<PauseCardProps> = ({ pauses, delay = 0 }) => {
  if (!pauses) return null;
  return (
    <CardWrapper title="Pauses & Silence" icon="⏸️" delay={delay}>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-white/50 text-xs">Silence</div>
          <div className="text-lg text-white">{pauses.silencePercentage}%</div>
        </div>
        <div>
          <div className="text-white/50 text-xs">Longest</div>
          <div className="text-lg text-white">{(pauses.longestPauseMs / 1000).toFixed(1)}s</div>
        </div>
      </div>
    </CardWrapper>
  );
};
