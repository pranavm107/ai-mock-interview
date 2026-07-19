import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInterviewSession } from '../hooks/useInterviewSession';
import { useVoiceInterview } from '../hooks/useVoiceInterview';
import { VoiceControls } from '../components/voice/VoiceControls';
import { VoiceVisualizer } from '../components/voice/VoiceVisualizer';
import { LiveTranscript } from '../components/voice/LiveTranscript';
import { Loader2, Play, Square, SkipForward, CheckCircle2, MessageSquare } from 'lucide-react';
import { PageHeader } from '../components/dashboard/PageHeader';

const InterviewRuntime: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { session, interview, loading, error, reportPending, startSession, nextQuestion, submitAnswer, skipQuestion } = useInterviewSession(sessionId);

  const [currentAnswer, setCurrentAnswer] = useState('');
  const [questionStartTime, setQuestionStartTime] = useState<string | null>(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);



  useEffect(() => {
    if ((session?.state === 'STARTED' || session?.state === 'ASKING') && !questionStartTime) {
      setQuestionStartTime(new Date().toISOString());
    }
  }, [session?.state, session?.progress.currentQuestionIndex]);

  useEffect(() => {
    if (session?.state === 'COMPLETED' && !reportPending) {
      // Auto-redirect to the report page after a short delay
      const timer = setTimeout(() => {
        navigate(`/report/${session.id}`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [session?.state, session?.id, navigate, reportPending]);

  const currentQuestion = session?.progress?.currentQuestionIndex !== undefined && session.progress.currentQuestionIndex >= 0 && interview?.questions
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

  const isSubmittingRef = React.useRef(false);

  const handleSubmit = async (overrideAnswer?: string, shouldAdvance = true) => {
    if (!currentQuestion || !questionStartTime || !session || isSubmittingRef.current) return;
    const answerToSubmit = overrideAnswer || currentAnswer;
    if (!answerToSubmit.trim()) return;

    isSubmittingRef.current = true;
    try {
      await submitAnswer(currentQuestion.id || `q_${session.progress.currentQuestionIndex}`, answerToSubmit, questionStartTime, answerToSubmit.split(' ').length);
      setCurrentAnswer('');
      setQuestionStartTime(null);
      if (shouldAdvance) {
        await nextQuestion();
      }
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleSubmitRef = React.useRef(handleSubmit);
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  const voice = useVoiceInterview(session?.id, {
    onFinishAnswer: async (transcript) => {
      if (isVoiceMode && transcript.trim()) {
        try {
          await handleSubmitRef.current(transcript, false); // submit but do NOT advance
          voice.setInterviewState('SHOW_FEEDBACK');
        } catch (e) {
          console.error(e);
          voice.setInterviewState('READY');
        }
      } else {
        voice.setInterviewState('READY');
      }
    }
  });

  const getVoiceStatusText = () => {
    if (!isVoiceMode) return '';
    switch (voice.interviewState) {
      case 'READY': return 'Ready. Press "Start Answer" when you are ready to speak.';
      case 'LISTENING': return 'Listening...';
      case 'PAUSED': return 'Waiting for you to continue...';
      case 'SUBMITTING': return 'Submitting your answer...';
      case 'SCORING': return 'Evaluating your response...';
      case 'GENERATING_REPORT': return 'Generating your interview report...';
      case 'REPORT_PENDING': return 'Report generation pending.';
      case 'SHOW_FEEDBACK': return 'Answer submitted. You may proceed to the next question.';
      default: return '';
    }
  };

  // Read question aloud when it changes
  useEffect(() => {
    if (isVoiceMode && currentQuestion && session?.state === 'ASKING') {
      voice.replayQuestion(currentQuestion.question);
    }
  }, [currentQuestion, isVoiceMode, session?.state, voice]);

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

        {session.state === 'COMPLETED' && reportPending && (
          <div className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Interview Completed Successfully!</h2>
            <p className="text-slate-600 mb-6">Your answers have been safely saved. However, AI report generation failed because the AI quota was exceeded.</p>
            <div className="flex justify-center gap-4 mt-8">
              <button 
                onClick={() => {
                  // Actually since nextQuestion generates the report on the last question, calling it again won't work easily if session is COMPLETED
                  // Let's just reload the page for now or navigate to report page which might retry.
                  navigate(`/report/${session.id}`);
                }}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700"
              >
                Retry Generate Report
              </button>
            </div>
          </div>
        )}

        {session.state === 'COMPLETED' && !reportPending && (
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
            <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl flex justify-between items-start">
              <div>
                <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Question {session.progress.currentQuestionIndex + 1}</span>
                <h3 className="text-xl font-medium mt-2 text-slate-800">{currentQuestion.question}</h3>
              </div>
              <button 
                onClick={async () => {
                  if (!isVoiceMode) {
                    setIsVoiceMode(true);
                    await voice.startVoice();
                  } else {
                    voice.stopVoice();
                    setIsVoiceMode(false);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50"
              >
                {isVoiceMode ? <><MessageSquare size={16} /> Switch to Text</> : <><Play size={16} /> Switch to Voice</>}
              </button>
            </div>

            {isVoiceMode ? (
              <div className="space-y-6">
                <VoiceVisualizer 
                  isSpeaking={voice.isSpeaking} 
                  isListening={voice.interviewState === 'LISTENING'} 
                />
                <LiveTranscript 
                  transcript={voice.transcript || currentAnswer} 
                  isListening={voice.interviewState === 'LISTENING' || voice.interviewState === 'PAUSED'} 
                  statusText={getVoiceStatusText()}
                />
                <VoiceControls 
                  isVoiceMode={isVoiceMode}
                  connectionStatus={voice.connectionStatus}
                  interviewState={voice.interviewState}
                  isMuted={voice.isMuted}
                  onStartVoice={voice.startVoice}
                  onStopVoice={() => { voice.stopVoice(); setIsVoiceMode(false); }}
                  onStartAnswer={voice.startAnswer}
                  onFinishAnswer={voice.finishAnswer}
                  onRestartAnswer={voice.restartAnswer}
                  onNextQuestion={async () => {
                    const isLast = session.progress.currentQuestionIndex === session.progress.totalQuestions - 1;
                    if (isLast) voice.setInterviewState('GENERATING_REPORT');
                    else voice.setInterviewState('NEXT_QUESTION');
                    
                    await nextQuestion();
                    
                    if (!isLast) await voice.nextQuestion();
                  }}
                  onToggleMute={voice.toggleMute}
                  onReplayQuestion={() => voice.replayQuestion(currentQuestion.question)}
                  isLastQuestion={session.progress.currentQuestionIndex === session.progress.totalQuestions - 1}
                />
              </div>
            ) : (

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
                  onClick={() => handleSubmit(undefined, true)}
                  disabled={loading || !currentAnswer.trim()}
                  className="px-6 py-2 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (session.progress.currentQuestionIndex === session.progress.totalQuestions - 1 ? 'Finish Interview' : 'Submit Answer')}
                </button>
              </div>
            </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default InterviewRuntime;
