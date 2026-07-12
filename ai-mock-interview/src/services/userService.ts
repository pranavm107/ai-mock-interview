import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase.config';
import type { User as UserType } from '../types';

export const syncUser = async (clerkUser: any): Promise<void> => {
  console.log("syncUser started");
  console.log(clerkUser);

  if (!clerkUser || !clerkUser.id) return;

  const userRef = doc(db, 'users', clerkUser.id);
  
  try {
    const userSnap = await getDoc(userRef);

    const clerkName = clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
    const clerkEmail = clerkUser.primaryEmailAddress?.emailAddress || '';
    const clerkImage = clerkUser.imageUrl || '';

    if (!userSnap.exists()) {
      // Create new user document with specified default fields
      const userData: Omit<UserType, 'createdAt' | 'updatedAt' | 'lastLogin'> & { 
        createdAt: any, 
        updatedAt: any,
        lastLogin: any 
      } = {
        id: clerkUser.id,
        name: clerkName,
        email: clerkEmail,
        image: clerkImage,
        plan: 'Free',
        resumeCount: 0,
        defaultResumeId: null,
        interviewCount: 0,
        completedInterviewCount: 0,
        overallScore: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalPracticeHours: 0,
        isOnboarded: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      };

      console.log("Creating Firestore document...");
      await setDoc(userRef, userData);
      console.log("Firestore document created");
      console.log('New user document created in Firestore');
    } else {
      // Document already exists, migrate/update fields
      const data = userSnap.data();
      
      const updatePayload: any = {
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // 1. Map old deprecated fields to new fields if new ones are missing
      if (!data.name && (data.fullName || data.firstName)) {
        updatePayload.name = data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || clerkName;
      } else if (!data.name) {
        updatePayload.name = clerkName;
      }

      if (!data.image && data.profileImage) {
        updatePayload.image = data.profileImage;
      } else if (!data.image) {
        updatePayload.image = clerkImage;
      }

      if (!data.email) {
        updatePayload.email = clerkEmail;
      }

      // 2. Safely add new schema fields if they are missing
      if (data.defaultResumeId === undefined) updatePayload.defaultResumeId = null;
      if (data.completedInterviewCount === undefined) updatePayload.completedInterviewCount = 0;
      if (data.longestStreak === undefined) updatePayload.longestStreak = 0;
      if (data.totalPracticeHours === undefined) updatePayload.totalPracticeHours = 0;
      if (data.plan === undefined) updatePayload.plan = 'Free';
      if (data.resumeCount === undefined) updatePayload.resumeCount = 0;
      if (data.interviewCount === undefined) updatePayload.interviewCount = 0;
      if (data.overallScore === undefined) updatePayload.overallScore = 0;
      if (data.currentStreak === undefined) updatePayload.currentStreak = 0;
      if (data.isOnboarded === undefined) updatePayload.isOnboarded = false;

      // 3. Keep createdAt if it exists, otherwise set it
      if (!data.createdAt) {
        updatePayload.createdAt = serverTimestamp();
      }

      await updateDoc(userRef, updatePayload);
      console.log('User document migrated/updated in Firestore');
    }
  } catch (error) {
    console.error('Error in syncUser:', error);
    throw error;
  }
};

export const getUser = async (userId: string): Promise<UserType | null> => {
  if (!userId) return null;
  
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserType;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};
