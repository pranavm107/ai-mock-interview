import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  updateDoc,
  serverTimestamp,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { supabase } from '../config/supabase';
import type { Resume } from '../types';

export const uploadResumeFile = async (file: File, userId: string, resumeId: string): Promise<string> => {
  if (!file) throw new Error("File is undefined");
  if (!userId) throw new Error("userId is undefined");
  if (!resumeId) throw new Error("resumeId is undefined");

  const storagePath = `${userId}/${resumeId}.pdf`;
  
  console.log("Bucket:", "resumes");
  console.log("Storage Path:", storagePath);
  console.log("File:", file);
  console.log("File Name:", file.name);
  console.log("File Size:", file.size);

  const { data, error } = await supabase.storage
    .from("resumes")
    .upload(storagePath, file, {
      contentType: "application/pdf",
      upsert: false
    });

  if (error) {
    console.error(error);
    throw error;
  }
  
  console.log(data);
  return storagePath;
};

export const getPublicResumeUrl = (storagePath: string): string => {
  const { data } = supabase.storage
    .from('resumes')
    .getPublicUrl(storagePath);
  return data.publicUrl;
};

export const deleteResumeFile = async (storagePath: string): Promise<void> => {
  const { error } = await supabase.storage
    .from('resumes')
    .remove([storagePath]);
    
  if (error) {
    console.warn("Could not delete object from Supabase storage, might not exist.", error);
  }
};

export const createResume = async (
  userId: string,
  file: File,
  title?: string
): Promise<Resume> => {
  try {
    const resumesRef = collection(db, 'resumes');
    const newResumeRef = doc(resumesRef);
    const resumeId = newResumeRef.id;

    // 1. Upload to Supabase Storage
    const storagePath = await uploadResumeFile(file, userId, resumeId);
    
    // 2. Get Public URL
    const fileUrl = getPublicResumeUrl(storagePath);

    // 3. Determine if it's the first resume
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    let isFirstResume = true;
    if (userSnap.exists()) {
      const userData = userSnap.data();
      if (userData.resumeCount > 0) {
        isFirstResume = false;
      }
    }

    // 4. Create Resume doc in Firestore
    const newResume: Resume = {
      id: resumeId,
      userId,
      version: 1,
      source: 'upload',
      isDefault: isFirstResume,
      metadata: {
        title: title || file.name,
        fileName: file.name,
        fileUrl,
        storagePath,
        fileSize: file.size,
        fileType: file.type || 'application/pdf',
        uploadedAt: serverTimestamp(),
      },
      status: {
        state: 'UPLOADED',
        uploadedAt: serverTimestamp(),
      },
      analysis: {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // 5. Batch write: create resume + update user stats
    const batch = writeBatch(db);
    batch.set(newResumeRef, newResume);
    
    const userUpdate: any = {
      resumeCount: increment(1)
    };
    
    if (isFirstResume) {
      userUpdate.defaultResumeId = resumeId;
    }
    
    batch.update(userRef, userUpdate);

    await batch.commit();

    return { ...newResume, createdAt: new Date(), updatedAt: new Date() };
  } catch (error) {
    console.error('Error creating resume:', error);
    throw error;
  }
};

export const getUserResumes = async (userId: string): Promise<Resume[]> => {
  try {
    const q = query(
      collection(db, 'resumes'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    const resumes = querySnapshot.docs.map(doc => doc.data() as Resume);
    resumes.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
    return resumes;
  } catch (error) {
    console.error('Error fetching resumes:', error);
    throw error;
  }
};

export const getResume = async (resumeId: string): Promise<Resume | null> => {
  try {
    const docRef = doc(db, 'resumes', resumeId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Resume;
    }
    return null;
  } catch (error) {
    console.error('Error fetching resume:', error);
    throw error;
  }
};

export const deleteResume = async (userId: string, resumeId: string): Promise<void> => {
  try {
    const resumeRef = doc(db, 'resumes', resumeId);
    const resumeSnap = await getDoc(resumeRef);

    if (!resumeSnap.exists()) return;
    
    const resumeData = resumeSnap.data() as Resume;
    
    if (resumeData.userId !== userId) {
      throw new Error("Unauthorized to delete this resume.");
    }

    // 1. Delete from Supabase Storage
    const pathToDelete = resumeData.metadata?.storagePath || (resumeData as any).storagePath || `${userId}/${resumeId}.pdf`;
    await deleteResumeFile(pathToDelete);

    const batch = writeBatch(db);
    
    // 2. Delete Firestore Document
    batch.delete(resumeRef);
    
    // 3. Decrease resumeCount
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    let newDefaultId = null;

    if (userSnap.exists()) {
       const userData = userSnap.data();
       if (userData.defaultResumeId === resumeId) {
          // find another resume to set as default
          const q = query(collection(db, 'resumes'), where('userId', '==', userId));
          const resumesSnap = await getDocs(q);
          const otherResumes = resumesSnap.docs.filter(d => d.id !== resumeId);
          
          if (otherResumes.length > 0) {
            newDefaultId = otherResumes[0].id;
            batch.update(doc(db, 'resumes', newDefaultId), { isDefault: true, updatedAt: serverTimestamp() });
          }
       } else {
          newDefaultId = userData.defaultResumeId;
       }
    }
    
    const userUpdate: any = {
      resumeCount: increment(-1),
      defaultResumeId: newDefaultId
    };
    batch.update(userRef, userUpdate);
    
    await batch.commit();

  } catch (error) {
    console.error('Error deleting resume:', error);
    throw error;
  }
};

export const setDefaultResume = async (userId: string, resumeId: string): Promise<void> => {
  try {
    const resumesRef = collection(db, 'resumes');
    const q = query(resumesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    
    querySnapshot.docs.forEach((d) => {
      if (d.id === resumeId) {
        batch.update(d.ref, { isDefault: true, updatedAt: serverTimestamp() });
      } else if (d.data().isDefault) {
        batch.update(d.ref, { isDefault: false, updatedAt: serverTimestamp() });
      }
    });

    const userRef = doc(db, 'users', userId);
    batch.update(userRef, { defaultResumeId: resumeId });

    await batch.commit();
  } catch (error) {
    console.error('Error setting default resume:', error);
    throw error;
  }
};

export const updateResume = async (resumeId: string, data: Partial<Resume>): Promise<void> => {
  try {
    const resumeRef = doc(db, 'resumes', resumeId);
    await updateDoc(resumeRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating resume:', error);
    throw error;
  }
};
