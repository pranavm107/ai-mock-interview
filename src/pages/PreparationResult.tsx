import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { PageHeader } from '../components/dashboard/PageHeader';
import { AppBreadcrumb } from '../components/dashboard/AppBreadcrumb';
import { FileText, ArrowLeft, Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config/api';
import type { AssessmentResult } from '../types/assessment';

export const PreparationResult: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getToken } = useAuth();

  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const token = await getToken();
        
        // Ensure assessment is completed and fetch results
        const res = await fetch(`${API_BASE_URL}/api/assessments/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || 'Failed to load assessment');
        
        if (data.assessment.status !== 'COMPLETED') {
          throw new Error('Assessment has not been completed yet.');
        }

        // Fetching the final result
        const resultRes = await fetch(`${API_BASE_URL}/api/assessments/${id}/result`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const resultData = await resultRes.json();
        if (!resultRes.ok) throw new Error(resultData.error || 'Failed to load results');

        setResult(resultData.data);
      } catch (err: any) {
        setError(err.message || 'Error loading results');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id, getToken]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p>Loading Results...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="pb-24 max-w-4xl mx-auto">
        <AppBreadcrumb items={[{ label: 'Practice' }, { label: 'Assessments', path: '/preparation' }, { label: 'Assessment Result' }]} />
        <div className="text-center mt-20">
          <AlertCircle size={48} className="mx-auto text-rose-500 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Failed to load results</h2>
          <p className="text-slate-600 mb-6">{error || 'Unknown error occurred'}</p>
          <Link to="/preparation" className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12 max-w-4xl mx-auto space-y-4 sm:space-y-5">
      <AppBreadcrumb items={[{ label: 'Practice' }, { label: 'Assessments', path: '/preparation' }, { label: 'Assessment Result' }]} />
      
      <PageHeader 
        title="Assessment Results"
        description="Review your performance and detailed explanations."
        icon={FileText}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-x-0 md:divide-x divide-slate-100">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-0.5">Score</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">{Math.round(result.percentage)}%</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-0.5">Correct</p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-600">{result.correctAnswers}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-0.5">Incorrect</p>
            <p className="text-xl sm:text-2xl font-bold text-rose-600">{result.incorrectAnswers}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-0.5">Unanswered</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-600">{result.unansweredQuestions}</p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-3.5 sm:space-y-4">
        <h3 className="text-sm sm:text-base font-semibold text-slate-900">Detailed Review</h3>
        {result.questionResults.map((q, idx) => {
          const isCorrect = q.isCorrect;
          return (
            <div key={q.questionId} className="bg-white border border-slate-200/90 rounded-xl p-3.5 sm:p-4 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  {isCorrect ? <CheckCircle2 className="text-emerald-500" size={18} /> : <XCircle className="text-rose-500" size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1.5">
                    <h4 className="font-semibold text-xs sm:text-sm text-slate-900 leading-snug">Q{idx + 1}. {q.question}</h4>
                  </div>
                  
                  <div className="mt-3 space-y-1.5">
                    {q.options.map(opt => {
                      const isUserChoice = q.selectedOptionId === opt.id;
                      const isActualCorrect = q.correctOptionId === opt.id;
                      
                      let borderClass = 'border-slate-200 bg-slate-50/60';
                      let textClass = 'text-slate-700 font-normal';

                      if (isActualCorrect) {
                        borderClass = 'border-emerald-400 bg-emerald-50/70 text-emerald-950';
                        textClass = 'text-emerald-900 font-medium';
                      } else if (isUserChoice && !isActualCorrect) {
                        borderClass = 'border-rose-400 bg-rose-50/70 text-rose-950';
                        textClass = 'text-rose-900 font-medium';
                      }

                      return (
                        <div key={opt.id} className={`px-3 py-2 rounded-lg border text-xs sm:text-sm flex items-center justify-between ${borderClass}`}>
                          <span className={textClass}>{opt.text}</span>
                          {isActualCorrect && <CheckCircle2 size={15} className="ml-2 text-emerald-600 shrink-0" />}
                          {isUserChoice && !isActualCorrect && <XCircle size={15} className="ml-2 text-rose-600 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-3.5 p-3 bg-blue-50/60 border border-blue-100 rounded-lg">
                    <p className="text-xs font-semibold text-blue-900 mb-0.5">Explanation</p>
                    <p className="text-xs text-blue-800 leading-relaxed">{q.explanation}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-200">
        <h3 className="text-xs sm:text-sm font-semibold text-slate-900 mb-4 text-center">What's next?</h3>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Link to="/preparation/practice" className="h-9 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-xs w-full sm:w-auto text-center flex items-center justify-center text-xs sm:text-sm">
            Continue Practice
          </Link>
          <Link to="/preparation/analytics" className="h-9 px-4 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-xs w-full sm:w-auto text-center flex items-center justify-center text-xs sm:text-sm">
            View Analytics
          </Link>
          <Link to="/preparation/history" className="h-9 px-4 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-xs w-full sm:w-auto text-center flex items-center justify-center text-xs sm:text-sm">
            View History
          </Link>
        </div>
      </div>
    </div>
  );
};
