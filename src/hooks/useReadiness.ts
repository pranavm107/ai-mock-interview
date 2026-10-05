import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import type { ReadinessProfile } from '../../server/src/types/readiness';

export const useReadiness = () => {
  const { getToken } = useAuth();
  const [data, setData] = useState<ReadinessProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReadiness = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await getToken();
      const response = await fetch('/api/analytics/readiness', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch readiness intelligence');
      }
      
      const json = await response.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  return { data, loading, error, fetchReadiness };
};
