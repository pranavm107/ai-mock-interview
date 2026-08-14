import { db } from '../../config/firebaseAdmin';

export interface EnrichedSession {
  id: string;
  interviewId: string;
  userId: string;
  state: string;
  createdAt: any;
  progress: any;
  metrics: any;
  company: string;
  role: string;
  interviewType: string;
  difficulty: string;
  score: number | null;
  [key: string]: any;
}

export const getEnrichedUserSessions = async (userId: string): Promise<EnrichedSession[]> => {
  if (!db) {
    throw new Error("Firestore Admin not initialized");
  }

  // Fetch all sessions for this user using Admin SDK
  const sessionsSnapshot = await db.collection('interviewSessions').where('userId', '==', userId).get();
  
  if (sessionsSnapshot.empty) {
    return [];
  }

  const sessions = sessionsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as any[];

  // Fetch the parent interviews to enrich the sessions
  // Note: For a user with many sessions, doing a get() per interview might be slow, 
  // but since an interview has 1 session currently, it's manageable. 
  // We can optimize by fetching all interviews for the user at once and mapping them.
  const interviewsSnapshot = await db.collection('interviews').where('userId', '==', userId).get();
  const interviewsMap = new Map();
  
  if (!interviewsSnapshot.empty) {
    interviewsSnapshot.docs.forEach(doc => {
      interviewsMap.set(doc.id, doc.data());
    });
  }

  // Fetch all user resumes to map resume names efficiently
  const resumesSnapshot = await db.collection('resumes').where('userId', '==', userId).get();
  const resumesMap = new Map();
  if (!resumesSnapshot.empty) {
    resumesSnapshot.docs.forEach(doc => {
      resumesMap.set(doc.id, doc.data());
    });
  }

  const enrichedSessions = sessions.map(session => {
    const interview = interviewsMap.get(session.interviewId);
    
    let company = 'Unknown';
    let role = 'Unknown';
    let interviewType = 'Technical';
    let difficulty = 'Mixed';
    let resumeName = null;
    let score = null;
    let estimatedTime = null;
    
    if (interview) {
      company = interview.company || company;
      role = interview.role || role;
      interviewType = interview.interviewType || interview.settings?.interviewType || interviewType;
      difficulty = interview.difficulty || difficulty;
      
      // Estimated Time in ms
      estimatedTime = interview.settings?.totalTimeLimitMs 
        || (interview.duration ? interview.duration * 60000 : null);
      
      if (session.state === 'COMPLETED') {
        score = interview.score ?? session.score ?? null;
      }

      if (interview.resumeId) {
        const resumeDoc = resumesMap.get(interview.resumeId);
        resumeName = resumeDoc?.metadata?.fileName || resumeDoc?.file?.name || resumeDoc?.name || 'Attached';
      }
    }

    return {
      ...session,
      company,
      role,
      interviewType,
      difficulty,
      score,
      resumeName,
      estimatedTime
    };
  });

  // Sort by createdAt desc
  enrichedSessions.sort((a, b) => {
    const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
    const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
    return bTime - aTime;
  });

  return enrichedSessions;
};
