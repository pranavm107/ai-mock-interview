import React from 'react';
import type { SpeechState } from '../../../hooks/useSpeechRecognition';

interface Props {
  speechState: SpeechState;
  saveStatus: 'saved' | 'saving' | 'offline' | 'error';
}

export const TranscriptStatus: React.FC<Props> = ({ speechState, saveStatus }) => {
  // Define indicators based on speech state priority
  if (speechState === 'error') {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Error
      </div>
    );
  }

  if (speechState === 'listening' || speechState === 'processing') {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span> Listening
      </div>
    );
  }

  if (speechState === 'connecting') {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse"></span> Connecting
      </div>
    );
  }

  if (speechState === 'paused') {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
        <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Paused
      </div>
    );
  }

  // If speech is idle, show save status or ready
  if (saveStatus === 'saving') {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span> Saving
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
      <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Ready
    </div>
  );
};
