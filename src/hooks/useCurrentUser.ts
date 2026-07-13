import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { getUser } from '../services/userService';
import type { User as UserType } from '../types';

export const useCurrentUser = () => {
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      // If Clerk is still loading, wait.
      if (!isClerkLoaded) return;
      
      // If not signed in, reset and stop loading.
      if (!isSignedIn || !clerkUser?.id) {
        if (isMounted) {
          setCurrentUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        // Fetch the synced user document from Firestore
        const dbUser = await getUser(clerkUser.id);
        if (isMounted) {
          setCurrentUser(dbUser);
        }
      } catch (err: any) {
        console.error('Failed to fetch current user from Firestore:', err);
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [isClerkLoaded, isSignedIn, clerkUser?.id]);

  return {
    currentUser,
    isLoading: !isClerkLoaded || isLoading,
    error,
    clerkUser,
    isSignedIn,
  };
};
