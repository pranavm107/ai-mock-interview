import { useState, useCallback, useEffect } from 'react';
import type { InterviewReport } from '../../server/src/types/interviewReport';

export const useInterviewReport = (sessionId?: string) => {
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:3001/api/interview-reports/session/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Report not found or still generating.');
        }
        throw new Error('Failed to load report');
      }
      const data = await res.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch interview report');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionId) {
      fetchReport(sessionId);
    }
  }, [sessionId, fetchReport]);

  return {
    report,
    loading,
    error,
    refresh: () => sessionId && fetchReport(sessionId)
  };
};
