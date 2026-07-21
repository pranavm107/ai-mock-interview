import React from 'react';
import { Mic, MicOff, PhoneOff, Loader2, RotateCcw, Check, SkipForward } from 'lucide-react';
import type { InterviewState } from '../../hooks/useVoiceInterview';

interface VoiceControlsProps {
  isVoiceMode: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  interviewState: InterviewState;
  isMuted: boolean;
  onStartVoice: () => void;
  onStopVoice: () => void;
  onStartAnswer: () => void;
  onFinishAnswer: () => void;
  onRestartAnswer: () => void;
  onNextQuestion: () => void;
  onToggleMute: () => void;
  onReplayQuestion: () => void;
  isLastQuestion: boolean;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  isVoiceMode,
  connectionStatus,
  interviewState,
  isMuted,
  onStartVoice,
  onStopVoice,
  onStartAnswer,
  onFinishAnswer,
  onRestartAnswer,
  onNextQuestion,
  onToggleMute,
  onReplayQuestion,
  isLastQuestion
}) => {
  if (!isVoiceMode) {
    return (
      <div className="flex justify-center mt-6">
        <button
          onClick={onStartVoice}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors shadow-lg"
        >
          <Mic size={20} />
          Start Voice Mode
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-4 mt-6">
      {/* Connection Status Indicator */}
      <div className="absolute left-8 bottom-8 flex items-center gap-2 text-sm font-medium">
        {connectionStatus === 'connected' && (
          <><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" /><span className="text-emerald-600">Voice Connected</span></>
        )}
        {connectionStatus === 'connecting' && (
          <><Loader2 className="w-4 h-4 animate-spin text-blue-500" /><span className="text-blue-600">Connecting...</span></>
        )}
        {connectionStatus === 'error' && (
          <><div className="w-2.5 h-2.5 rounded-full bg-rose-500" /><span className="text-rose-600">Connection Error</span></>
        )}
        {connectionStatus === 'disconnected' && (
          <><div className="w-2.5 h-2.5 rounded-full bg-slate-400" /><span className="text-slate-600">Disconnected</span></>
        )}
      </div>

      <button
        onClick={onReplayQuestion}
        disabled={connectionStatus !== 'connected'}
        className="p-4 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50"
        title="Replay Question"
      >
        <RotateCcw size={24} />
      </button>

      {(interviewState === 'LISTENING' || interviewState === 'PAUSED') && (
        <button
          onClick={onRestartAnswer}
          className="p-4 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
          title="Restart Answer"
        >
          <RotateCcw size={24} />
        </button>
      )}

      {interviewState === 'READY' && (
        <button
          onClick={onStartAnswer}
          className="flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 font-medium transition-colors shadow-lg"
        >
          <Mic size={24} />
          Start Answer
        </button>
      )}

      {(interviewState === 'LISTENING' || interviewState === 'PAUSED') && (
        <button
          onClick={onFinishAnswer}
          className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 font-medium transition-colors shadow-lg"
        >
          <Check size={24} />
          Finish Answer
        </button>
      )}

      {(interviewState === 'SUBMITTING' || interviewState === 'SCORING' || interviewState === 'NEXT_QUESTION' || interviewState === 'GENERATING_REPORT') && (
        <button
          disabled
          className="flex items-center gap-2 px-8 py-4 bg-slate-200 text-slate-500 rounded-full font-medium transition-colors"
        >
          <Loader2 size={24} className="animate-spin" />
          {interviewState === 'GENERATING_REPORT' ? 'Generating Report...' : 'Processing...'}
        </button>
      )}

      {interviewState === 'SHOW_FEEDBACK' && (
        <button
          onClick={onNextQuestion}
          className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 font-medium transition-colors shadow-lg"
        >
          {isLastQuestion ? <Check size={24} /> : <SkipForward size={24} />}
          {isLastQuestion ? 'Finish Interview' : 'Next Question'}
        </button>
      )}

      <button
        onClick={onToggleMute}
        disabled={connectionStatus !== 'connected'}
        className={`p-4 rounded-full transition-colors shadow-sm ${
          isMuted ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        } disabled:opacity-50`}
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
      </button>

      <button
        onClick={onStopVoice}
        className="p-4 rounded-full bg-rose-100 text-rose-600 hover:bg-rose-200 transition-colors shadow-sm"
        title="Stop Voice Mode"
      >
        <PhoneOff size={24} />
      </button>
    </div>
  );
};
