import React, { useState } from 'react';
import type { ReplayBookmark } from '../../types/replay';

interface Props {
  bookmarks: ReplayBookmark[];
  onAddBookmark: (note: string, type: ReplayBookmark['type']) => void;
  onJumpToBookmark: (bookmark: ReplayBookmark) => void;
  onDeleteBookmark: (bookmarkId: string) => void;
}

export const ReplayBookmarks: React.FC<Props> = React.memo(({ bookmarks, onAddBookmark, onJumpToBookmark, onDeleteBookmark }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [note, setNote] = useState('');
  const [type, setType] = useState<ReplayBookmark['type']>('Important');

  const handleAdd = () => {
    if (!note.trim()) return;
    onAddBookmark(note, type);
    setNote('');
    setIsAdding(false);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <h3 className="font-semibold text-slate-900 dark:text-white">Bookmarks</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-1 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
          title="Add Bookmark"
          aria-label="Add Bookmark"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {isAdding && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
          <select 
            value={type}
            onChange={(e) => setType(e.target.value as ReplayBookmark['type'])}
            className="w-full mb-2 p-2 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            aria-label="Bookmark Type"
          >
            <option value="Important">Important</option>
            <option value="Mistake">Mistake</option>
            <option value="Excellent">Excellent</option>
            <option value="Review Later">Review Later</option>
            <option value="Custom Note">Custom Note</option>
          </select>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note..."
            className="w-full p-2 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white mb-2 resize-none"
            rows={2}
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsAdding(false)} className="px-3 py-1 text-xs text-slate-600 dark:text-slate-400">Cancel</button>
            <button onClick={handleAdd} className="px-3 py-1 text-xs bg-primary-600 text-white rounded">Save</button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {bookmarks.length === 0 && !isAdding && (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No bookmarks yet.</p>
        )}
        {bookmarks.map(bm => (
          <div key={bm.id} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 group relative cursor-pointer hover:border-primary-300" onClick={() => onJumpToBookmark(bm)}>
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded">
                {bm.type}
              </span>
              <span className="text-xs text-slate-500">{new Date(bm.timestamp).toLocaleTimeString([], {minute: '2-digit', second:'2-digit'})}</span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300">{bm.note}</p>
            <button 
              onClick={(e) => { e.stopPropagation(); onDeleteBookmark(bm.id); }}
              className="absolute top-2 right-2 p-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Delete Bookmark"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});
