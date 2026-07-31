import React from 'react';
import { CardWrapper } from './CommunicationScore';
import type { PaceMetrics } from '../../../types/speech';

export interface PaceCardProps {
  pace: PaceMetrics;
  delay?: number;
}

export const PaceCard: React.FC<PaceCardProps> = ({ pace, delay = 0 }) => {
  if (!pace) return null;
  const isIdeal = pace.rating === 'Ideal';
  return (
    <CardWrapper title="Speech Pace" icon="⏱️" delay={delay}>
      <div className="flex justify-between items-end">
        <div>
          <div className="text-3xl font-light text-white">{pace.wpm} <span className="text-sm text-white/50">WPM</span></div>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium ${isIdeal ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
          {pace.rating}
        </div>
      </div>
    </CardWrapper>
  );
};
