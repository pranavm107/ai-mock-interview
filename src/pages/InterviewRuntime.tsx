import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInterviewSession } from '../hooks/useInterviewSession';
import { Loader2, Play, Square, SkipForward, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../components/dashboard/PageHeader';

const InterviewRuntime: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { session, interview, loading, error, startSession, nextQuestion, submitAnswer, skipQuestion } = useInterviewSession(sessionId);

  const [currentAnswer, setCurrentAnswer] = useState('');
  const [questionStartTime, setQuestionStartTime] = useState<string | null>(null);

  useEffect(() => {
    if ((session?.state === 'STARTED' || session?.state === 'ASKING') && !questionStartTime) {
      setQuestionStartTime(new Date().toISOString());
    }
  }, [session?.state, session?.progress.currentQuestionIndex]);

  useEffect(() => {
    if (session?.state === 'COMPLETED') {
      // Auto-redirect to the report page after a short delay
      const timer = setTimeout(() => {
        navigate(`/report/${session.id}`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [session?.state, session?.id, navigate]);

  if (loading && !session) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (error || !session || !interview) {
    return (
      <div className="p-8 text-center text-rose-600">
        <p>Failed to load interview session.</p>
        <p className="text-sm opacity-70">{error}</p>
        <button onClick={() => navigate('/dashboard')} className="mt-4 px-4 py-2 bg-slate-100 rounded-lg">Return to Dashboard</button>
      </div>
    );
  }

  const currentQuestion = session.progress.currentQuestionIndex >= 0 && interview.questions
    ? interview.questions[session.progress.currentQuestionIndex]
    : null;

  const handleStart = async () => {
    await startSession();
  };

  const handleNext = async () => {
    await nextQuestion();
  };

  const handleSkip = async () => {
    await skipQuestion();
  };

  const handleSubmit = async () => {
    if (!currentQuestion || !questionStartTime) return;
    await submitAnswer(currentQuestion.id || `q_${session.progress.currentQuestionIndex}`, currentAnswer, questionStartTime, currentAnswer.split(' ').length);
    setCurrentAnswer('');
    setQuestionStartTime(null);
    await nextQuestion();
  };

  return (
    <div className="pb-24 max-w-4xl mx-auto">
      <PageHeader 
        title={`Live Interview: ${interview.role}`}
        description={`Session State: ${session.state} | Progress: ${session.progress.currentQuestionIndex + 1}/${session.progress.totalQuestions}`}
        icon={Play}
      />

      <div className="mt-8 bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
        
        {session.state === 'CREATED' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Ready to start?</h2>
            <button 
              onClick={handleStart}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700"
            >
              {loading ? <Loader2 className="animate-spin inline mr-2" size={18} /> : 'Start Interview'}
            </button>
          </div>
        )}

        {session.state === 'COMPLETED' && (
          <div className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Interview Completed!</h2>
            <p className="text-slate-600 mb-6">Generating your detailed report...</p>
            <div className="flex justify-center items-center gap-3">
              <Loader2 className="animate-spin text-blue-600" size={24} />
              <span className="text-sm font-medium text-slate-500">Redirecting to results...</span>
            </div>
            <button 
              onClick={() => navigate(`/report/${session.id}`)}
              className="mt-8 px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700"
            >
              View Report Now
            </button>
          </div>
        )}

        {(session.state === 'STARTED' || session.state === 'ASKING') && currentQuestion && (
          <div className="space-y-6">
            <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl">
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Question {session.progress.currentQuestionIndex + 1}</span>
              <h3 className="text-xl font-medium mt-2 text-slate-800">{currentQuestion.question}</h3>
            </div>

            <div className="space-y-4">
              <textarea
                value={currentAnswer}
                onChange={e => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows={6}
                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              />
              
              <div className="flex justify-end gap-3">
                {session.settings.allowSkip && (
                  <button 
                    onClick={handleSkip}
                    disabled={loading}
                    className="px-6 py-2 flex items-center gap-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl"
                  >
                    <SkipForward size={18} /> Skip
                  </button>
                )}
                
                <button 
                  onClick={handleSubmit}
                  disabled={loading || !currentAnswer.trim()}
                  className="px-6 py-2 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Submit Answer'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default InterviewRuntime;
