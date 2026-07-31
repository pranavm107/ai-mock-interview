import React, { useEffect, useRef } from 'react';
import { SaveIndicator } from './SaveIndicator';

type SaveStatus = 'saved' | 'saving' | 'offline' | 'error';

interface Props {
  value: string;
  onChange: (value: string) => void;
  saveStatus: SaveStatus;
  disabled?: boolean;
}

export const AnswerEditor: React.FC<Props> = ({ value, onChange, saveStatus, disabled = false }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  return (
    <div className="w-full flex flex-col h-full min-h-[300px] border border-slate-200 rounded-2xl bg-white focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all shadow-sm relative">
      <div className="absolute top-3 right-4 z-10">
        <SaveIndicator status={saveStatus} />
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Type your answer here or use the microphone..."
        className="w-full flex-1 min-h-[250px] resize-none bg-transparent px-6 py-6 pt-12 outline-none text-slate-800 text-[15px] leading-relaxed disabled:opacity-50"
      />
      <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex justify-between items-center text-xs text-slate-400 font-medium">
        <span>Press Ctrl + Enter for next question</span>
        <span>{value.length} characters</span>
      </div>
    </div>
  );
};
