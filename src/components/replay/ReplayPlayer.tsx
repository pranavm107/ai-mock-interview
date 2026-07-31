import React, { useEffect, useRef } from 'react';
import type { ReplayPlayerState } from '../../types/replay';

interface Props {
  playerState: ReplayPlayerState;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (timeMs: number) => void;
  onSpeedChange: (speed: number) => void;
  onVolumeChange: (volume: number) => void;
}

export const ReplayPlayer: React.FC<Props> = React.memo(({ playerState, onPlay, onPause, onSeek, onSpeedChange, onVolumeChange: _onVolumeChange }) => {
  const progressBarRef = useRef<HTMLDivElement>(null);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || playerState.durationMs === 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    onSeek(pos * playerState.durationMs);
  };

  const progressPercent = playerState.durationMs > 0 ? (playerState.currentTimeMs / playerState.durationMs) * 100 : 0;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (playerState.status === 'Playing') {
          onPause();
        } else {
          onPlay();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerState.status, onPlay, onPause]);

  return (
    <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl flex flex-col gap-4">
      {/* Progress Bar */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-slate-400 w-10 text-right">
          {formatTime(playerState.currentTimeMs)}
        </span>
        
        <div 
          ref={progressBarRef}
          className="flex-1 h-2 bg-slate-700 rounded-full cursor-pointer relative group"
          onClick={handleProgressBarClick}
        >
          <div 
            className="absolute top-0 left-0 h-full bg-primary-500 rounded-full group-hover:bg-primary-400 transition-colors"
            style={{ width: `${progressPercent}%` }}
          />
          <div 
            className="absolute top-1/2 -mt-2 -ml-2 w-4 h-4 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${progressPercent}%` }}
          />
        </div>
        
        <span className="text-xs font-medium text-slate-400 w-10">
          {formatTime(playerState.durationMs)}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-2">
        {/* Left: Volume (placeholder) */}
        <div className="flex items-center gap-2 w-24">
           {/* Mock volume icon */}
           <svg className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
           </svg>
        </div>

        {/* Center: Playback */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onSeek(Math.max(0, playerState.currentTimeMs - 10000))}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            title="Rewind 10s"
            aria-label="Rewind 10 seconds"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </button>
          
          <button 
            onClick={playerState.status === 'Playing' ? onPause : onPlay}
            className="w-12 h-12 flex items-center justify-center bg-primary-600 hover:bg-primary-500 rounded-full text-white transition-transform hover:scale-105 active:scale-95"
            aria-label={playerState.status === 'Playing' ? 'Pause Interview' : 'Play Interview'}
          >
            {playerState.status === 'Playing' ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button 
            onClick={() => onSeek(Math.min(playerState.durationMs, playerState.currentTimeMs + 10000))}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            title="Forward 10s"
            aria-label="Forward 10 seconds"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.334-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
            </svg>
          </button>
        </div>

        {/* Right: Speed */}
        <div className="flex items-center justify-end w-24">
          <select 
            value={playerState.playbackSpeed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="bg-slate-800 text-xs text-white font-medium px-2 py-1 rounded cursor-pointer hover:bg-slate-700 outline-none border-none"
            aria-label="Playback Speed"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
        </div>
      </div>
    </div>
  );
});
