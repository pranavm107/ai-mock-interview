import React, { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { syncUser } from '../services/userService';

interface AuthHandlerProps {
  children: React.ReactNode;
}

const AuthHandler: React.FC<AuthHandlerProps> = ({ children }) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const hasCheckedRef = useRef<string | null>(null);

  useEffect(() => {
    console.log("AuthHandler");
    console.log({
        isLoaded,
        isSignedIn,
        userId: user?.id,
    });

    const handleSync = async () => {
      // Wait until Clerk finishes loading and check if user is signed in
      if (!isLoaded || !isSignedIn || !user) return;
      
      // Prevent duplicate execution for the same user during the session
      if (hasCheckedRef.current === user.id) return;

      setIsProcessing(true);
      try {
        // Mark this user as checked immediately to prevent race conditions
        hasCheckedRef.current = user.id;

        // Delegate all Firestore logic to our dedicated user service
        console.log("Calling syncUser...");
        await syncUser(user);
        
      } catch (error) {
        console.error('Error syncing user to Firestore:', error);
        // Reset the ref so we can try again if it failed
        hasCheckedRef.current = null;
      } finally {
        setIsProcessing(false);
      }
    };

    handleSync();
  }, [isLoaded, isSignedIn, user]);

  // Create a loading state while the user document is being checked.
  // We also show loading if Clerk is still loading to prevent flickering.
  if (!isLoaded || isProcessing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Authenticating workspace...</p>
        </div>
      </div>
    );
  }

  // When finished processing and synced with the database, render the protected children.
  return <>{children}</>;
};

export default AuthHandler;
