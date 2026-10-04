import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { PageHeader } from '../components/dashboard/PageHeader';
import { PreparationBreadcrumb } from '../components/preparation/PreparationBreadcrumb';
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
        <PreparationBreadcrumb items={[{ label: 'Assessment Result' }]} />
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
    <div className="pb-24 max-w-4xl mx-auto">
      <PreparationBreadcrumb items={[{ label: 'Assessment Result' }]} />
      
      <PageHeader 
        title="Assessment Results"
        description="Review your performance and detailed explanations."
        icon={FileText}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm mb-8"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Score</p>
            <p className="text-3xl font-bold text-blue-600">{Math.round(result.percentage)}%</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Correct</p>
            <p className="text-3xl font-bold text-emerald-600">{result.correctAnswers}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Incorrect</p>
            <p className="text-3xl font-bold text-rose-600">{result.incorrectAnswers}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Unanswered</p>
            <p className="text-3xl font-bold text-slate-600">{result.unansweredQuestions}</p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Detailed Review</h3>
        {result.questionResults.map((q, idx) => {
          const isCorrect = q.isCorrect;
          return (
            <div key={q.questionId} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="shrink-0 mt-1">
                  {isCorrect ? <CheckCircle2 className="text-emerald-500" size={24} /> : <XCircle className="text-rose-500" size={24} />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg text-slate-800">Q{idx + 1}. {q.question}</h4>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    {q.options.map(opt => {
                      const isUserChoice = q.selectedOptionId === opt.id;
                      const isActualCorrect = q.correctOptionId === opt.id;
                      
                      let borderClass = 'border-slate-200 bg-slate-50';
                      let textClass = 'text-slate-700';

                      if (isActualCorrect) {
                        borderClass = 'border-emerald-500 bg-emerald-50';
                        textClass = 'text-emerald-900 font-bold';
                      } else if (isUserChoice && !isActualCorrect) {
                        borderClass = 'border-rose-500 bg-rose-50';
                        textClass = 'text-rose-900 font-bold';
                      }

                      return (
                        <div key={opt.id} className={`p-3 rounded-xl border-2 flex items-center ${borderClass}`}>
                          <span className={textClass}>{opt.text}</span>
                          {isActualCorrect && <CheckCircle2 size={16} className="ml-auto text-emerald-500" />}
                          {isUserChoice && !isActualCorrect && <XCircle size={16} className="ml-auto text-rose-500" />}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <p className="text-sm font-bold text-blue-900 mb-1">Explanation</p>
                    <p className="text-sm text-blue-800">{q.explanation}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 pt-8 border-t border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-6 text-center">What's next?</h3>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/preparation/practice" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm w-full sm:w-auto text-center">
            Continue Practice
          </Link>
          <Link to="/preparation/analytics" className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm w-full sm:w-auto text-center">
            View Analytics
          </Link>
          <Link to="/preparation/history" className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm w-full sm:w-auto text-center">
            View History
          </Link>
        </div>
      </div>
    </div>
  );
};
