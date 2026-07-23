import React from 'react';
import { CardWrapper } from './CommunicationScore';
import type { FillerWordMetrics } from '../../../types/speech';

export interface FillerWordsCardProps {
  fillers: FillerWordMetrics;
  delay?: number;
}

export const FillerWordsCard: React.FC<FillerWordsCardProps> = ({ fillers, delay = 0 }) => {
  if (!fillers) return null;
  const isHigh = fillers.severity === 'High';
  return (
    <CardWrapper title="Filler Words" icon="🗣️" delay={delay}>
       <div className="flex justify-between items-end">
        <div>
          <div className="text-3xl font-light text-white">{fillers.count}</div>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium ${isHigh ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
          {fillers.severity}
        </div>
      </div>
      {fillers.words.length > 0 && (
        <div className="mt-2 text-xs text-white/50 truncate">
          Found: {Array.from(new Set(fillers.words)).join(', ')}
        </div>
      )}
    </CardWrapper>
  );
};
