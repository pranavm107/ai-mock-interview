import { db } from "../../config/firebaseAdmin";
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
  const querySnapshot = await db.collection("interviews").where("cacheKey", "==", cacheKey).get();
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

  const docRef = db.collection("interviews").doc(interviewId);
  await docRef.set(dataToSave);
  
  return interviewId;
};

export const getInterviewById = async (interviewId: string): Promise<Interview | null> => {
  const docRef = db.collection("interviews").doc(interviewId);
  const snap = await docRef.get();
  
  if (snap.exists) {
    return snap.data() as Interview;
  }
  
  return null;
};

export const deleteInterview = async (interviewId: string): Promise<void> => {
  const docRef = db.collection("interviews").doc(interviewId);
  await docRef.delete();
};

