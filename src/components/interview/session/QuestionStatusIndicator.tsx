import React from 'react';
import type { QuestionStatus } from '../../../types';

interface Props {
  status: QuestionStatus;
}

export const QuestionStatusIndicator: React.FC<Props> = ({ status }) => {
  if (status === 'current') {
    return (
      <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
    );
  }
  
  if (status === 'answered') {
    return (
      <div className="w-2 h-2 rounded-full bg-green-500" />
    );
  }
  
  return (
    <div className="w-2 h-2 rounded-full bg-slate-300" />
  );
};
