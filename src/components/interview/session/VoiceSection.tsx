import React from 'react';
import { MicrophoneButton } from '../speech/MicrophoneButton';
import { SpeechWaveAnimation } from '../speech/SpeechWaveAnimation';
import type { SpeechState } from '../../../hooks/useSpeechRecognition';

interface Props {
  speechState: SpeechState;
  isWebcamRecording: boolean;
  isPaused: boolean;
  onToggle: () => void;
}

export const VoiceSection: React.FC<Props> = ({ speechState, isWebcamRecording, isPaused, onToggle }) => {
  const isListening = speechState === 'listening' || isWebcamRecording;

  return (
    <div className="flex flex-col gap-4 mt-6 mb-4">
      {isListening && !isPaused ? (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-3 h-3">
                <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping bg-rose-500" />
                <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-rose-500" />
              </div>
              <p className="text-rose-900 font-bold text-sm tracking-wide">RECORDING</p>
            </div>
            <p className="text-rose-700/80 text-xs font-medium">Listening...</p>
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-[200px]">
              <SpeechWaveAnimation isListening={true} />
            </div>
            <MicrophoneButton state={speechState} onToggle={onToggle} disabled={isPaused} />
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-slate-900 font-semibold mb-1">Voice Answer</p>
              <p className="text-slate-500 text-sm">Speak naturally. Your words will automatically appear below.</p>
            </div>
            <MicrophoneButton state={speechState} onToggle={onToggle} disabled={isPaused} />
          </div>
        </div>
      )}
    </div>
  );
};
