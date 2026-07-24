import { ReplayBookmark } from '../../types/replay';
import { getReplayBookmarks, saveReplayBookmark, updateReplayBookmark, deleteReplayBookmark } from './replayStorageService';

export const listBookmarks = async (sessionId: string): Promise<ReplayBookmark[]> => {
  return await getReplayBookmarks(sessionId);
};

export const createBookmark = async (
  sessionId: string,
  bookmarkData: Omit<ReplayBookmark, 'id' | 'createdAt' | 'updatedAt' | 'sessionId'>
): Promise<ReplayBookmark> => {
  const newBookmark: ReplayBookmark = {
    ...bookmarkData,
    id: `bm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    sessionId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  await saveReplayBookmark(sessionId, newBookmark);
  return newBookmark;
};

export const editBookmark = async (sessionId: string, bookmarkId: string, updates: Partial<ReplayBookmark>): Promise<void> => {
  await updateReplayBookmark(sessionId, bookmarkId, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
};

export const removeBookmark = async (sessionId: string, bookmarkId: string): Promise<void> => {
  await deleteReplayBookmark(sessionId, bookmarkId);
};
