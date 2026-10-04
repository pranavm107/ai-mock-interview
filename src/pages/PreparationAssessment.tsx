import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { PageHeader } from '../components/dashboard/PageHeader';
import { PreparationBreadcrumb } from '../components/preparation/PreparationBreadcrumb';
import { Play, ArrowLeft, ArrowRight, CheckCircle2, Clock, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config/api';
import type { Assessment, AssessmentQuestionForUser } from '../types/assessment';

export const PreparationAssessment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestionForUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Timed Test support
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE_URL}/api/assessments/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load assessment');
        }

        if (data.assessment.status === 'COMPLETED') {
          navigate(`/preparation/results/${id}`, { replace: true });
          return;
        }

        if (data.assessment.status !== 'READY' && data.assessment.status !== 'IN_PROGRESS') {
          throw new Error('Assessment is not ready to be taken.');
        }

        setAssessment(data.assessment);
        setQuestions(data.questions);

        // Load saved answers from localStorage to support refresh recovery
        const savedState = localStorage.getItem(`assessment_${id}_answers`);
        if (savedState) {
          setAnswers(JSON.parse(savedState));
        }

        // Initialize timer if it's a timed test
        if (data.assessment.mode === 'TIMED' && data.assessment.startedAt) {
          // Duration based on question count: 1.5 min per question (e.g. 15 questions = 22.5 min = 1350 sec)
          const totalDurationSeconds = (data.assessment.questionCount * 1.5) * 60;
          const startedAtTime = new Date(data.assessment.startedAt).getTime();
          const elapsedSeconds = Math.floor((Date.now() - startedAtTime) / 1000);
          const remaining = Math.max(0, totalDurationSeconds - elapsedSeconds);
          
          setTimeLeft(remaining);
        }

      } catch (err: any) {
        setError(err.message || 'Error loading assessment');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id, getToken, navigate]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isTimeUp && assessment) {
      setIsTimeUp(true);
      handleSubmit(true); // Auto-submit
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, isTimeUp, assessment]);

  const handleSelectAnswer = (optionId: string) => {
    if (isTimeUp || submitting) return;
    const currentQ = questions[currentIndex];
    const newAnswers = { ...answers, [currentQ.id]: optionId };
    setAnswers(newAnswers);
    localStorage.setItem(`assessment_${id}_answers`, JSON.stringify(newAnswers));
  };

  const handleSubmit = async (autoSubmit: boolean = false) => {
    if (submitting) return; // Prevent concurrent submissions
    
    try {
      setSubmitting(true);
      const token = await getToken();

      const payload = {
        answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId
        }))
      };

      const res = await fetch(`${API_BASE_URL}/api/assessments/${id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit assessment');

      // Cleanup local storage
      localStorage.removeItem(`assessment_${id}_answers`);

      navigate(`/preparation/results/${id}`, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Submission failed');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p>Loading Assessment...</p>
      </div>
    );
  }

  if (error || !assessment || questions.length === 0) {
    return (
      <div className="pb-24 max-w-5xl mx-auto">
        <PreparationBreadcrumb items={[{ label: 'Assessment Error' }]} />
        <div className="text-center mt-20">
          <AlertCircle size={48} className="mx-auto text-rose-500 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Failed to load assessment</h2>
          <p className="text-slate-600 mb-6">{error || 'Unknown error occurred'}</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const isAnswered = (idx: number) => !!answers[questions[idx].id];
  const answeredCount = Object.keys(answers).length;
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="pb-24 max-w-5xl mx-auto">
      <PreparationBreadcrumb items={[{ label: 'Assessment' }]} />
      {/* Header & Meta */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 mt-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{assessment.title}</h1>
          <p className="text-slate-500">{assessment.mode === 'TIMED' ? 'Timed Test' : 'Practice Mode'} • {assessment.questionCount} Questions</p>
        </div>
        
        <div className="flex gap-4">
          {timeLeft !== null && (
            <div className={`flex items-center px-4 py-2 rounded-xl font-bold ${timeLeft < 60 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
              <Clock size={18} className="mr-2" />
              {formatTime(timeLeft)}
            </div>
          )}
          <button 
            onClick={() => handleSubmit(false)}
            disabled={submitting || isTimeUp}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow-sm transition-all flex items-center disabled:opacity-50"
          >
            {submitting ? <Loader2 size={16} className="animate-spin mr-2" /> : <CheckCircle2 size={16} className="mr-2" />}
            Submit Assessment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Main Question Area */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm mb-6 min-h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6 text-sm font-semibold text-slate-500">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              {currentQ.difficulty && <span className="px-2 py-1 bg-slate-100 rounded-md text-xs">{currentQ.difficulty}</span>}
            </div>
            
            <h2 className="text-xl font-bold text-slate-800 mb-8 leading-relaxed">
              {currentQ.question}
            </h2>

            <div className="space-y-3 mt-auto">
              {currentQ.options.map(opt => {
                const isSelected = answers[currentQ.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectAnswer(opt.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      isSelected ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className={`font-medium ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nav Controls */}
          <div className="flex justify-between">
            <button 
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="flex items-center px-5 py-3 rounded-xl font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <ArrowLeft size={18} className="mr-2" /> Previous
            </button>
            <button 
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIndex === questions.length - 1}
              className="flex items-center px-5 py-3 rounded-xl font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Next <ArrowRight size={18} className="ml-2" />
            </button>
          </div>
        </div>

        {/* Sidebar Palette */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm sticky top-6">
            <h3 className="font-bold text-slate-900 mb-4">Progress</h3>
            <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2">
              <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${(answeredCount / questions.length) * 100}%` }}></div>
            </div>
            <p className="text-sm text-slate-500 font-semibold mb-6">{answeredCount} of {questions.length} answered</p>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isActive = idx === currentIndex;
                const answered = isAnswered(idx);
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`aspect-square rounded-lg font-bold text-sm transition-all flex items-center justify-center border-2 ${
                      isActive 
                        ? 'border-blue-600 text-blue-700' 
                        : answered 
                          ? 'border-transparent bg-blue-100 text-blue-800' 
                          : 'border-transparent bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
