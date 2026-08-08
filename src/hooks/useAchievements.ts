import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { fetchUserAchievements } from '../services/achievementService';
import type { AchievementSummary, AchievementWithProgress } from '../types/achievement';

interface UseAchievementsReturn {
  summary: AchievementSummary | null;
  achievements: AchievementWithProgress[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAchievements = (): UseAchievementsReturn => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [summary, setSummary] = useState<AchievementSummary | null>(null);
  const [achievements, setAchievements] = useState<AchievementWithProgress[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchAchievements = useCallback(async () => {
    if (isLoaded && !isSignedIn) {
      setError('Please sign in again to continue.');
      setLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) {
        if (!signal.aborted) {
          setError('Please sign in again to continue.');
          setLoading(false);
        }
        return;
      }
      
      const res = await fetchUserAchievements(token, signal);
      if (!signal.aborted) {
        setSummary(res.data.summary);
        
        // Defensive data parsing
        const safeAchievements = Array.isArray(res.data.achievements) ? res.data.achievements : [];
        setAchievements(safeAchievements);
        setError(null);
      }
    } catch (err: any) {
      if (!signal.aborted) {
        console.error('Failed to load achievements:', err);
        setError('We couldn\'t load your achievements right now. Please try again.');
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [getToken, isLoaded, isSignedIn]);

  useEffect(() => {
    fetchAchievements();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchAchievements]);

  return { summary, achievements, loading, error, refetch: fetchAchievements };
};
