import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../components/dashboard/PageHeader';
import { API_BASE_URL } from '../config/api';

const MCQRuntime: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  
  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE_URL}/api/interviews/${id}/mcq`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to fetch interview');
        }

        const data = await res.json();
        if (data.status === 'Completed') {
          // If already completed, maybe redirect to result or show it
          // We can fetch the raw interview for the result
          const fullRes = await fetch(`${API_BASE_URL}/api/interviews/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const fullData = await fullRes.json();
          setResult(fullData.mcqResult);
        }
        
        setInterview(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchInterview();
  }, [id, getToken]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (result || interview?.status === 'Completed') return;
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleNext = () => {
    if (currentIndex < interview.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (window.confirm('Are you sure you want to submit your answers?')) {
      setSubmitting(true);
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE_URL}/api/interviews/${id}/mcq/submit`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ answers })
        });
        
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to submit');
        }

        const data = await res.json();
        setResult(data.result.mcqResult);
      } catch (err: any) {
        alert(err.message);
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="p-8 text-center text-rose-600">
        <p>Error loading interview.</p>
        <p className="text-sm opacity-70">{error}</p>
        <button onClick={() => navigate('/dashboard')} className="mt-4 px-4 py-2 bg-slate-100 rounded-lg">Return to Dashboard</button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <PageHeader title="Interview Results" description="Here is how you performed." icon={CheckCircle2} />
        
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-center mb-6">Score: {result.score}%</h2>
          <div className="flex justify-around mb-8 text-center">
            <div>
              <p className="text-2xl font-bold text-emerald-600">{result.correctCount}</p>
              <p className="text-xs text-slate-500">Correct</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-rose-600">{result.incorrectCount}</p>
              <p className="text-xs text-slate-500">Incorrect</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-600">{result.unansweredCount}</p>
              <p className="text-xs text-slate-500">Unanswered</p>
            </div>
          </div>

          <div className="space-y-4">
            {result.results.map((res: any, idx: number) => {
              const q = interview.questions.find((qi: any) => qi.id === res.questionId);
              return (
                <div key={res.questionId} className={`p-4 border rounded-xl ${res.isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'}`}>
                  <p className="font-semibold text-sm sm:text-base text-slate-800 mb-2">Q{idx + 1}: {q?.question}</p>
                  
                  <div className="space-y-2 mt-3">
                    {q?.options?.map((opt: any) => {
                      const isSelected = res.selectedOptionId === opt.id;
                      const isCorrectOpt = res.correctOptionId === opt.id;
                      
                      let className = "p-2.5 rounded-lg border text-xs sm:text-sm ";
                      if (isCorrectOpt) {
                        className += "bg-emerald-100 border-emerald-400 text-emerald-800 font-medium";
                      } else if (isSelected) {
                        className += "bg-rose-100 border-rose-400 text-rose-800";
                      } else {
                        className += "bg-white border-slate-200 opacity-70";
                      }

                      return (
                        <div key={opt.id} className={className}>
                          <span className="font-semibold mr-1.5">{opt.id}.</span> {opt.text}
                          {isSelected && !isCorrectOpt && <span className="ml-2 text-xs font-bold uppercase">(Your Answer)</span>}
                          {isSelected && isCorrectOpt && <span className="ml-2 text-xs font-bold uppercase">(Your Answer)</span>}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 p-2.5 bg-white rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-600">
                    <span className="font-semibold text-slate-700">Explanation:</span> {res.explanation}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 text-center">
            <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-700 shadow-2xs transition-colors">Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = interview.questions[currentIndex];
  const isLast = currentIndex === interview.questions.length - 1;

  return (
    <div className="max-w-3xl mx-auto py-5 px-3 sm:px-4 min-h-[calc(100vh-4rem)] flex flex-col">
      <PageHeader 
        title={`MCQ Interview: ${interview.settings?.targetRole}`} 
        description={`Question ${currentIndex + 1} of ${interview.questions.length}`} 
        icon={CheckCircle2} 
      />

      <div className="mt-2 flex-1 bg-white p-4 sm:p-5 rounded-xl shadow-xs border border-slate-200 flex flex-col">
        <div className="mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            {currentQ.section} • {currentQ.difficulty}
          </span>
        </div>
        
        <h3 className="text-base sm:text-lg font-medium text-slate-800 mb-4 leading-snug">{currentQ.question}</h3>

        <div className="space-y-2.5 mb-6 flex-1">
          {currentQ.options?.map((opt: any) => {
            const selected = answers[currentQ.id] === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(currentQ.id, opt.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selected 
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-medium shrink-0 ${
                    selected ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 text-slate-500'
                  }`}>
                    {opt.id}
                  </div>
                  <span className="text-xs sm:text-sm text-slate-700 font-medium">{opt.text}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm text-slate-600 font-medium hover:bg-slate-100 rounded-lg disabled:opacity-50 transition-colors"
          >
            <ArrowLeft size={15} /> Previous
          </button>
          
          <div className="text-xs sm:text-sm text-slate-500 font-medium">
            Answered: {Object.keys(answers).length} / {interview.questions.length}
          </div>

          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 text-white text-xs sm:text-sm font-semibold hover:bg-emerald-600 rounded-lg disabled:opacity-50 transition-colors"
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : 'Submit'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 text-blue-600 text-xs sm:text-sm font-semibold hover:bg-blue-100 rounded-lg transition-colors"
            >
              Next <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MCQRuntime;
