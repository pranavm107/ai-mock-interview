import { db } from '../../config/firebaseAdmin';
import {
  CareerProfile,
  CareerScoreHistory,
  WeeklyCoaching,
  MonthlyCoaching,
  LearningRoadmap,
  DailyGoal
} from '../../types/career.types';

export const saveCareerProfile = async (profile: CareerProfile): Promise<string> => {
  if (!db) throw new Error('Firestore not initialized');
  const docRef = db.collection('careerProfiles').doc(profile.userId);
  await docRef.set({
    ...profile,
    createdAt: profile.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }, { merge: true });
  return profile.userId;
};

export const getCareerProfile = async (userId: string): Promise<CareerProfile | null> => {
  if (!db) return null;
  const doc = await db.collection('careerProfiles').doc(userId).get();
  return doc.exists ? (doc.data() as CareerProfile) : null;
};

export const saveCareerScore = async (score: CareerScoreHistory): Promise<string> => {
  if (!db) throw new Error('Firestore not initialized');
  const docRef = db.collection('careerScores').doc();
  const data = {
    ...score,
    id: docRef.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await docRef.set(data);
  return docRef.id;
};

export const getLatestCareerScore = async (userId: string): Promise<CareerScoreHistory | null> => {
  if (!db) return null;
  const snapshot = await db.collection('careerScores')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as CareerScoreHistory;
};

export const saveWeeklyCoaching = async (coaching: WeeklyCoaching): Promise<string> => {
  if (!db) throw new Error('Firestore not initialized');
  const docRef = db.collection('weeklyCoaching').doc();
  const data = {
    ...coaching,
    id: docRef.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await docRef.set(data);
  return docRef.id;
};

export const getLatestWeeklyCoaching = async (userId: string): Promise<WeeklyCoaching | null> => {
  if (!db) return null;
  const snapshot = await db.collection('weeklyCoaching')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as WeeklyCoaching;
};

export const saveMonthlyCoaching = async (coaching: MonthlyCoaching): Promise<string> => {
  if (!db) throw new Error('Firestore not initialized');
  const docRef = db.collection('monthlyCoaching').doc();
  const data = {
    ...coaching,
    id: docRef.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await docRef.set(data);
  return docRef.id;
};

export const getLatestMonthlyCoaching = async (userId: string): Promise<MonthlyCoaching | null> => {
  if (!db) return null;
  const snapshot = await db.collection('monthlyCoaching')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as MonthlyCoaching;
};

export const saveLearningRoadmap = async (roadmap: LearningRoadmap): Promise<string> => {
  if (!db) throw new Error('Firestore not initialized');
  const docRef = db.collection('learningRoadmaps').doc();
  const data = {
    ...roadmap,
    id: docRef.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await docRef.set(data);
  return docRef.id;
};

export const getLatestLearningRoadmap = async (userId: string): Promise<LearningRoadmap | null> => {
  if (!db) return null;
  const snapshot = await db.collection('learningRoadmaps')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as LearningRoadmap;
};

export const saveDailyGoals = async (goals: DailyGoal): Promise<string> => {
  if (!db) throw new Error('Firestore not initialized');
  const docRef = db.collection('dailyGoals').doc();
  const data = {
    ...goals,
    id: docRef.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await docRef.set(data);
  return docRef.id;
};

export const getLatestDailyGoals = async (userId: string): Promise<DailyGoal | null> => {
  if (!db) return null;
  const snapshot = await db.collection('dailyGoals')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as DailyGoal;
};
