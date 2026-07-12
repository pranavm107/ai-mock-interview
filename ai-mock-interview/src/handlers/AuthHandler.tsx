import React, { useEffect, useRef, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase.config';
import type { User as UserType } from '../types';

interface AuthHandlerProps {
  children: React.ReactNode;
}

const AuthHandler: React.FC<AuthHandlerProps> = ({ children }) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const hasCheckedRef = useRef<string | null>(null);

  useEffect(() => {
    const syncUserToFirestore = async () => {
      // 1. Wait until Clerk finishes loading and check if user is signed in
      if (!isLoaded || !isSignedIn || !user) return;
      
      // 2. Prevent duplicate execution for the same user during the session
      if (hasCheckedRef.current === user.id) return;

      setIsProcessing(true);
      try {
        // Mark this user as checked immediately to prevent race conditions
        hasCheckedRef.current = user.id;

        // 3. Define the document reference: users/{clerkUserId}
        const userRef = doc(db, 'users', user.id);
        
        // 4. Check whether the user already exists inside Firestore
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          // 5. If it does not exist, create a new user document
          const userData: Omit<UserType, 'createdAt' | 'updatedAt'> & { 
            createdAt: any, 
            updatedAt: any 
          } = {
            id: user.id, // Using clerkId as the document ID
            clerkId: user.id,
            fullName: user.fullName || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.primaryEmailAddress?.emailAddress || '',
            profileImage: user.imageUrl || '',
            username: user.username || '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };

          await setDoc(userRef, userData);
          console.log('New user document created in Firestore');
        } else {
          // 6. If the document already exists, do nothing
          console.log('User document already exists in Firestore');
        }
      } catch (error) {
        console.error('Error syncing user to Firestore:', error);
        // Reset the ref so we can try again if it failed
        hasCheckedRef.current = null;
      } finally {
        setIsProcessing(false);
      }
    };

    syncUserToFirestore();
  }, [isLoaded, isSignedIn, user]);

  // Create a loading state while the user document is being checked.
  // We also show loading if Clerk is still loading to prevent flickering.
  if (!isLoaded || isProcessing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // When finished, render children.
  return <>{children}</>;
};

export default AuthHandler;
