import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { API_BASE_URL } from '../config/api';
import type { ReviewResponse } from '../types/review';
import { ReviewSummaryCard } from '../components/review/ReviewSummaryCard';
import { ReviewCategoryChart } from '../components/review/ReviewCategoryChart';
import { ReviewQuestionList } from '../components/review/ReviewQuestionList';
import { ReviewStrengthsWeaknesses } from '../components/review/ReviewStrengthsWeaknesses';
import { ArrowLeft, Loader2, PlaySquare } from 'lucide-react';

export default function InterviewReview() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { userId, getToken } = useAuth();
  
  const [data, setData] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReview = useCallback(async () => {
    if (!sessionId || !userId) return;
    try {
      setLoading(true);
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/api/reviews/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status === 404) {
        setData(null);
        return;
      }
      
      if (!response.ok) throw new Error('Failed to fetch review');
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sessionId, userId, getToken]);

  useEffect(() => {
    fetchReview();
  }, [fetchReview]);

  const handleGenerateReview = async () => {
    if (!sessionId || !userId) return;
    try {
      setGenerating(true);
      setError(null);
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/api/reviews/${sessionId}/generate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate review');
      }
      
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className="text-zinc-400">Loading your AI Review...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans p-4 sm:p-5 pb-12 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-5">
        
        {/* Header navigation */}
        <div className="flex items-center justify-between">
          <Link to={`/replay/${sessionId}`} className="flex items-center text-xs sm:text-sm text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Replay
          </Link>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold">Interview AI Coach</h1>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-3 sm:p-3.5 rounded-lg flex items-center justify-between text-xs sm:text-sm">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 font-bold hover:text-red-300 cursor-pointer">&times;</button>
          </div>
        )}

        {!data && !loading && (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 bg-zinc-900/50 border border-zinc-800 rounded-xl text-center px-4">
            <PlaySquare className="w-12 h-12 text-zinc-700 mb-3" />
            <h2 className="text-lg sm:text-xl font-bold text-zinc-200 mb-1.5">Ready for your AI Evaluation?</h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto mb-5 leading-relaxed">
              We'll analyze your interview transcript, evaluating your technical skills, communication, and confidence to provide actionable feedback.
            </p>
            <button
              onClick={handleGenerateReview}
              disabled={generating}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-5 h-9 rounded-lg font-medium text-xs sm:text-sm transition-colors flex items-center shadow-xs cursor-pointer"
            >
              {generating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Review...</>
              ) : (
                'Generate Review'
              )}
            </button>
          </div>
        )}

        {data && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {/* Left Column: Overall Summary (2/3 width on large screens) */}
              <div className="lg:col-span-2">
                <ReviewSummaryCard review={data.review} />
              </div>
              
              {/* Right Column: Category Radar Chart (1/3 width) */}
              <div className="lg:col-span-1">
                <ReviewCategoryChart review={data.review} />
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div>
              <ReviewStrengthsWeaknesses review={data.review} />
            </div>

            {/* Detailed Question List */}
            <div className="pt-2">
              <ReviewQuestionList questionReviews={data.questionReviews} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
