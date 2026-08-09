import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { API_BASE_URL } from '../config/api';
import SuggestedInterviewCard from '../components/interview/SuggestedInterviewCard';
import { SuggestedInterviewValidationSchema } from '../types/recommendation';
import type { SuggestedInterview, SuggestionResponse } from '../types/recommendation';
import { PageHeader } from '../components/dashboard/PageHeader';
import { Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type SuggestionState =
  | { status: "loading" }
  | { status: "ready"; recommendation: SuggestedInterview }
  | { status: "incomplete_profile" }
  | { status: "api_error" }
  | { status: "auth_error" }
  | { status: "ai_error" };

const loadingMessages = [
  "Analyzing your profile...",
  "Reviewing interview performance...",
  "Preparing your recommendation..."
];

const SuggestedInterviewPage: React.FC = () => {
  const { isLoaded, user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  
  const [state, setState] = useState<SuggestionState>({ status: "loading" });
  const [starting, setStarting] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  
  const requestInProgress = useRef(false);

  // Animated loading messages
  useEffect(() => {
    if (state.status !== "loading") return;
    
    const interval = setInterval(() => {
      setLoadingTextIndex(prev => (prev + 1) % loadingMessages.length);
    }, 2500);
    
    return () => clearInterval(interval);
  }, [state.status]);

  const fetchRecommendation = async () => {
    if (!isLoaded || !user || requestInProgress.current) return;
    
    requestInProgress.current = true;
    setState({ status: "loading" });
    setLoadingTextIndex(0);

    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/api/interviews/suggest`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ resumeId: undefined })
      });

      if (response.status === 401) {
        setState({ status: "auth_error" });
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (errorData?.error?.code === 'AI_RECOMMENDATION_FAILED') {
          setState({ status: "ai_error" });
        } else {
          setState({ status: "api_error" });
        }
        return;
      }

      const data = await response.json() as SuggestionResponse;

      if (data.status === 'incomplete_profile') {
        setState({ status: "incomplete_profile" });
      } else if (data.data?.suggestion) {
        const parsed = SuggestedInterviewValidationSchema.safeParse(data.data.suggestion);
        if (parsed.success) {
          setState({ status: "ready", recommendation: parsed.data });
        } else {
          setState({ status: "api_error" });
        }
      } else {
        setState({ status: "api_error" });
      }
    } catch (err: unknown) {
      setState({ status: "api_error" });
    } finally {
      requestInProgress.current = false;
    }
  };

  useEffect(() => {
    if (!isLoaded || !user) return;
    fetchRecommendation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user]);

  const handleStart = async () => {
    if (!user?.id || state.status !== "ready" || starting) return;
    const recommendation = state.recommendation;
    
    try {
      setStarting(true);

      // We only send useRecommendation: true. The backend handles the rest securely.
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/api/interviews/generate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          useRecommendation: true,
          targetRole: recommendation.targetRole,
          targetCompany: recommendation.targetCompany ?? '',
          interviewType: recommendation.interviewType,
          difficulty: recommendation.difficulty,
          candidateExperienceLevel: recommendation.experienceLevel,
          totalQuestions: recommendation.questionCount,
          durationMinutes: recommendation.durationMinutes,
          resumeId: recommendation.resumeId || null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start recommended interview.');
      }

      const responseData = await response.json();

      if (responseData.id) {
        const interviewId = responseData.id;
        
        // Follow existing pattern: generate interview, then create session
        const sessionResponse = await fetch(`${API_BASE_URL}/api/interview-sessions`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
          body: JSON.stringify({
            interviewId: interviewId
          })
        });

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          navigate(`/session/${sessionData.id}`);
          return;
        } else {
          throw new Error('Failed to create interview session');
        }
      } else {
        throw new Error('Invalid response from generation endpoint');
      }

    } catch (err: unknown) {
      console.error(err);
      alert('Failed to start interview. Please try again.');
    } finally {
      setStarting(false);
    }
  };

  const handleCustomize = () => {
    if (state.status !== "ready") return;
    const recommendation = state.recommendation;

    navigate('/generate', {
      state: {
        recommendation: {
          targetRole: recommendation.targetRole,
          targetCompany: recommendation.targetCompany ?? '',
          interviewType: recommendation.interviewType,
          difficulty: recommendation.difficulty,
          experienceLevel: recommendation.experienceLevel,
          questionCount: recommendation.questionCount,
          durationMinutes: recommendation.durationMinutes,
          focusAreas: recommendation.focusAreas ?? []
        }
      }
    });
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <PageHeader 
        title="AI Recommended Interview" 
        description="Review your personalized interview plan generated from your recent performance and career goals."
        icon={Sparkles}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="max-w-4xl mx-auto"
      >
        {state.status === "loading" && (
          <div className="bg-white p-16 text-center rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-6 min-h-[350px]">
            <Loader2 size={48} className="text-blue-600 animate-spin" />
            <div className="h-8 overflow-hidden relative w-full max-w-sm">
              <AnimatePresence mode="wait">
                <motion.p 
                  key={loadingTextIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-lg font-medium text-slate-700 absolute inset-0 text-center"
                >
                  {loadingMessages[loadingTextIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        )}

        {state.status === "api_error" && (
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-4 min-h-[350px]">
            <AlertCircle size={48} className="text-rose-500 mb-2" />
            <h3 className="text-xl font-bold text-slate-800">API Error</h3>
            <p className="text-slate-500 max-w-sm mx-auto">We couldn't generate your recommendation.</p>
            <button 
              onClick={fetchRecommendation}
              className="mt-6 px-8 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {state.status === "auth_error" && (
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-4 min-h-[350px]">
            <AlertCircle size={48} className="text-slate-400 mb-2" />
            <h3 className="text-xl font-bold text-slate-800">Authentication Error</h3>
            <p className="text-slate-500 max-w-sm mx-auto">Your session has expired.</p>
            <button 
              onClick={() => navigate('/sign-in')}
              className="mt-6 px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Sign In Again
            </button>
          </div>
        )}

        {state.status === "ai_error" && (
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-4 min-h-[350px]">
            <Sparkles size={48} className="text-slate-300 mb-2" />
            <h3 className="text-xl font-bold text-slate-800">AI Unavailable</h3>
            <p className="text-slate-500 max-w-sm mx-auto">We couldn't prepare an AI recommendation right now.</p>
            <button 
              onClick={() => navigate('/generate')}
              className="mt-6 px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Create Custom Interview
            </button>
          </div>
        )}

        {state.status === "incomplete_profile" && (
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-4 min-h-[350px]">
            <Sparkles size={48} className="text-amber-400 mb-2" />
            <h3 className="text-xl font-bold text-slate-800">Incomplete Profile</h3>
            <p className="text-slate-500 max-w-sm mx-auto">We need more information to create a personalized interview.</p>
            <button 
              onClick={() => navigate('/profile')}
              className="mt-6 px-8 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors"
            >
              Complete Profile
            </button>
          </div>
        )}

        {state.status === "ready" && state.recommendation && (
          <SuggestedInterviewCard 
            recommendation={state.recommendation}
            onStart={handleStart}
            onCustomize={handleCustomize}
            loading={starting}
          />
        )}
      </motion.div>
    </div>
  );
};

export default SuggestedInterviewPage;
