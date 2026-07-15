import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import type { Resume } from '../types';
import * as resumeService from '../services/resumeService';

export const useResume = () => {
  const { user } = useUser();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [warning, setWarning] = useState<string | null>(null);

  const fetchResumes = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await resumeService.getUserResumes(user.id);
      setResumes(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch resumes');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchResumes();
    } else {
      setResumes([]);
      setLoading(false);
    }
  }, [user?.id, fetchResumes]);

  const uploadResume = async (file: File, title?: string) => {
    if (!user?.id) throw new Error("User not authenticated");
    try {
      setLoading(true);
      setWarning(null);
      const newResume = await resumeService.createResume(user.id, file, title);
      
      // 2. Ping backend for processing
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/resumes/process`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            resumeId: newResume.id,
            fileUrl: newResume.metadata.fileUrl
          })
        });
        
        const responseData = await response.json();

        if (!response.ok) {
           console.error('Failed to process resume on backend', responseData);
           throw new Error(responseData.message || 'Failed to process resume on backend');
        }

        if (!responseData.aiSuccess) {
          if (responseData.aiError?.code === 'GEMINI_QUOTA_EXCEEDED') {
            setWarning('Resume uploaded successfully. AI analysis is temporarily unavailable because the Gemini API daily quota has been exhausted. You can retry the AI analysis later without uploading the resume again.');
          } else {
            setWarning(`Resume uploaded successfully, but AI analysis failed: ${responseData.aiError?.message || 'Unknown error'}`);
          }
        }
      } catch (backendError) {
        console.error('Backend process request failed:', backendError);
        setWarning('Resume uploaded successfully, but backend processing encountered an error.');
      }

      // Add the new resume and refetch to ensure correct ordering/default status
      await fetchResumes();
      return newResume;
    } catch (err: any) {
      setError(err.message || 'Failed to upload resume');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteResume = async (resumeId: string) => {
    if (!user?.id) throw new Error("User not authenticated");
    try {
      setLoading(true);
      await resumeService.deleteResume(user.id, resumeId);
      // Re-fetch to ensure default resume state is properly synced if it changed
      await fetchResumes(); 
    } catch (err: any) {
      setError(err.message || 'Failed to delete resume');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setDefaultResume = async (resumeId: string) => {
    if (!user?.id) throw new Error("User not authenticated");
    try {
      setLoading(true);
      await resumeService.setDefaultResume(user.id, resumeId);
      setResumes(prev => prev.map(r => ({
        ...r,
        isDefault: r.id === resumeId
      })));
    } catch (err: any) {
      setError(err.message || 'Failed to set default resume');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    resumes,
    loading,
    error,
    warning,
    uploadResume,
    deleteResume,
    setDefaultResume,
    refreshResumes: fetchResumes
  };
};
