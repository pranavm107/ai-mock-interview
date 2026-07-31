import { db } from "../../config/firebase.config";
import { doc, setDoc, getDoc, deleteDoc, query, collection, where, getDocs } from "firebase/firestore";
import { Interview } from "../../types/interview";

export const generateCacheKey = (
  resumeHash: string,
  company: string,
  role: string,
  promptVersion: string,
  plannerVersion: string
): string => {
  return `${resumeHash}_${company.toLowerCase()}_${role.toLowerCase()}_${promptVersion}_${plannerVersion}`;
};

export const findCachedInterview = async (cacheKey: string): Promise<Interview | null> => {
  const q = query(collection(db, "interviews"), where("cacheKey", "==", cacheKey));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data() as Interview;
  }
  return null;
};

export const saveInterview = async (interview: Interview): Promise<string> => {
  // Generate ID if missing
  const interviewId = interview.id || `interview_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  interview.id = interviewId;

  // Generate cache key dynamically before saving
  const cacheKey = generateCacheKey(
    interview.metadata.resumeHash,
    interview.company,
    interview.role,
    interview.metadata.promptVersion,
    interview.metadata.plannerVersion
  );

  const dataToSave = { ...interview, cacheKey };

  const docRef = doc(db, "interviews", interviewId);
  await setDoc(docRef, dataToSave);
  
  return interviewId;
};

export const getInterviewById = async (interviewId: string): Promise<Interview | null> => {
  const docRef = doc(db, "interviews", interviewId);
  const snap = await getDoc(docRef);
  
  if (snap.exists()) {
    return snap.data() as Interview;
  }
  
  return null;
};

export const deleteInterview = async (interviewId: string): Promise<void> => {
  const docRef = doc(db, "interviews", interviewId);
  await deleteDoc(docRef);
};

