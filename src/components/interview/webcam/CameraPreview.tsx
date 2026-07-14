import React, { useEffect } from 'react';
import type { RefObject } from 'react';
import { RecordingBadge } from './RecordingBadge';
import type { WebcamState } from '../../../hooks/useWebcam';

interface Props {
  videoRef: RefObject<HTMLVideoElement | null>;
  state: WebcamState;
  stream: MediaStream | null;
  elapsedSeconds?: number;
}

export const CameraPreview: React.FC<Props> = ({ videoRef, state, stream, elapsedSeconds }) => {
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [videoRef, stream, state]);

  return (
    <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-700/50">
      <RecordingBadge state={state} elapsedSeconds={elapsedSeconds} />
      
      {state === 'ready' && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-medium">
          Camera Off
        </div>
      )}

      {state !== 'ready' && state !== 'error' && (
        <div className="absolute bottom-4 left-4 z-10 px-2.5 py-1 bg-slate-900/60 backdrop-blur-md rounded-md shadow-sm border border-white/10 text-white text-[11px] font-medium tracking-wide">
          Candidate
        </div>
      )}
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transition-opacity duration-500 transform scale-x-[-1] ${
          state !== 'ready' && state !== 'error' ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
