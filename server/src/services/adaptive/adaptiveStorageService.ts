import { db } from "../../config/firebase.config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ConversationMemory, MemorySnapshot } from "../../types/conversationMemory";
import { AdaptiveState } from "../../types/adaptive";

export const getConversationMemory = async (sessionId: string): Promise<ConversationMemory | null> => {
  const docRef = doc(db, "conversationMemories", sessionId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data() as ConversationMemory;
  }
  return null;
};

export const saveConversationMemory = async (sessionId: string, memory: ConversationMemory): Promise<void> => {
  const docRef = doc(db, "conversationMemories", sessionId);
  await setDoc(docRef, {
    ...memory,
    updatedAt: new Date().toISOString()
  }, { merge: true });
};

export const saveMemorySnapshot = async (sessionId: string, snapshot: MemorySnapshot): Promise<void> => {
  const docRef = doc(db, `conversationMemories/${sessionId}/snapshots`, snapshot.id);
  await setDoc(docRef, snapshot);
};

export const getAdaptiveState = async (sessionId: string): Promise<AdaptiveState | null> => {
  const docRef = doc(db, "adaptiveStates", sessionId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data() as AdaptiveState;
  }
  return null;
};

export const saveAdaptiveState = async (sessionId: string, state: AdaptiveState): Promise<void> => {
  const docRef = doc(db, "adaptiveStates", sessionId);
  await setDoc(docRef, {
    ...state,
    updatedAt: new Date().toISOString()
  }, { merge: true });
};
