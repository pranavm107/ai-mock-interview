import React from 'react';
import { Video, Maximize } from 'lucide-react';

interface Props {
  onTurnOff: () => void;
}

export const CameraControls: React.FC<Props> = ({ onTurnOff }) => {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 p-1.5 bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={onTurnOff}
        className="flex items-center justify-center w-10 h-10 bg-white/10 text-white hover:bg-rose-500 hover:text-white rounded-xl transition-all"
        title="Turn Camera Off"
      >
        <Video size={18} />
      </button>

      <div className="w-px h-6 bg-white/10 mx-1" />

      <button
        className="flex items-center justify-center w-10 h-10 bg-white/10 text-white hover:bg-white/20 rounded-xl transition-all"
        title="Fullscreen"
      >
        <Maximize size={18} />
      </button>
    </div>
  );
};
