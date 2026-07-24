import { db } from '../../config/firebase.config';
import { doc, getDoc, setDoc, collection, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { ReplayMetadata, ReplayBookmark, ReplayTimelineEvent } from '../../types/replay';

export const getReplayMetadata = async (sessionId: string): Promise<ReplayMetadata | null> => {
  const docRef = doc(db, 'interviewSessions', sessionId, 'replay', 'metadata');
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return snap.data() as ReplayMetadata;
};

export const saveReplayMetadata = async (sessionId: string, metadata: ReplayMetadata): Promise<void> => {
  const docRef = doc(db, 'interviewSessions', sessionId, 'replay', 'metadata');
  await setDoc(docRef, metadata);
};

export const getReplayBookmarks = async (sessionId: string): Promise<ReplayBookmark[]> => {
  const colRef = collection(db, 'interviewSessions', sessionId, 'replay_bookmarks');
  const snap = await getDocs(colRef);
  return snap.docs.map(d => d.data() as ReplayBookmark);
};

export const saveReplayBookmark = async (sessionId: string, bookmark: ReplayBookmark): Promise<void> => {
  const docRef = doc(db, 'interviewSessions', sessionId, 'replay_bookmarks', bookmark.id);
  await setDoc(docRef, bookmark);
};

export const updateReplayBookmark = async (sessionId: string, bookmarkId: string, updates: Partial<ReplayBookmark>): Promise<void> => {
  const docRef = doc(db, 'interviewSessions', sessionId, 'replay_bookmarks', bookmarkId);
  await updateDoc(docRef, updates);
};

export const deleteReplayBookmark = async (sessionId: string, bookmarkId: string): Promise<void> => {
  const docRef = doc(db, 'interviewSessions', sessionId, 'replay_bookmarks', bookmarkId);
  await deleteDoc(docRef);
};

export const getReplayTimeline = async (sessionId: string): Promise<ReplayTimelineEvent[]> => {
  const colRef = collection(db, 'interviewSessions', sessionId, 'replay_timeline');
  const snap = await getDocs(colRef);
  return snap.docs.map(d => d.data() as ReplayTimelineEvent);
};

export const saveReplayTimeline = async (sessionId: string, timeline: ReplayTimelineEvent[]): Promise<void> => {
  // Batching or saving one by one
  for (const event of timeline) {
    const docRef = doc(db, 'interviewSessions', sessionId, 'replay_timeline', event.id);
    await setDoc(docRef, event);
  }
};
