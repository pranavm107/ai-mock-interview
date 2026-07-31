import React from 'react';
import { Mic, Play, Loader2, AlertCircle } from 'lucide-react';
import type { SpeechState } from '../../../hooks/useSpeechRecognition';

interface Props {
  state: SpeechState;
  onToggle: () => void;
  disabled?: boolean;
}

export const MicrophoneButton: React.FC<Props> = ({ state, onToggle, disabled }) => {
  const isListening = state === 'listening' || state === 'processing';
  const isPaused = state === 'paused';
  const isConnecting = state === 'connecting';
  const isError = state === 'error';

  let icon = <Mic size={18} />;
  let text = 'Start Answer';
  let colorClasses = 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20';

  if (isConnecting) {
    icon = <Loader2 size={18} className="animate-spin" />;
    text = 'Connecting...';
    colorClasses = 'bg-slate-100 text-slate-500 cursor-wait';
  } else if (isListening) {
    icon = <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />;
    text = 'Recording...';
    colorClasses = 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200';
  } else if (isPaused) {
    icon = <Play size={16} className="fill-current" />;
    text = 'Resume';
    colorClasses = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200';
  } else if (isError) {
    icon = <AlertCircle size={18} />;
    text = 'Retry';
    colorClasses = 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200';
  }

  return (
    <button
      onClick={onToggle}
      disabled={disabled || isConnecting}
      aria-label={text}
      className={`relative flex items-center justify-center min-w-[160px] gap-2.5 px-6 py-3.5 rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${colorClasses}`}
    >
      <span className="relative z-10">{icon}</span>
      <span className="relative z-10">{text}</span>
    </button>
  );
};
