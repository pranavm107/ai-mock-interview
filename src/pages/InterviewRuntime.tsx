import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInterviewSession } from '../hooks/useInterviewSession';
import { useVoiceInterview } from '../hooks/useVoiceInterview';
import { VoiceControls } from '../components/voice/VoiceControls';
import { VoiceVisualizer } from '../components/voice/VoiceVisualizer';
import { LiveTranscript } from '../components/voice/LiveTranscript';
import { Loader2, Play, SkipForward, CheckCircle2, MessageSquare, Mic } from 'lucide-react';
import { InterviewAnalyticsPanel } from '../components/interview/analytics/InterviewAnalyticsPanel';

import { useUiStore } from '../stores/uiStore';

const SessionTimer: React.FC<{ startedAt?: string, isComplete: boolean, fallbackElapsedSeconds?: number }> = ({ startedAt, isComplete, fallbackElapsedSeconds = 0 }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (isComplete) return;
    
    let interval: ReturnType<typeof setInterval>;
    if (startedAt) {
      const start = new Date(startedAt).getTime();
      const update = () => setElapsed(Math.floor((Date.now() - start) / 1000));
      update();
      interval = setInterval(update, 1000);
    } else {
      setElapsed(fallbackElapsedSeconds);
      interval = setInterval(() => setElapsed(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [startedAt, isComplete, fallbackElapsedSeconds]);

  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return <div className="flex items-center gap-2 text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg font-medium text-sm">
    <span>⏱</span>
    <span>{m}:{s.toString().padStart(2, '0')}</span>
  </div>;
};

const InterviewRuntime: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const setFocusMode = useUiStore((state) => state.setFocusMode);

  const { 
    session, interview, liveEvaluation, loading, error, reportPending, 
    decision, difficulty, remainingQuestions, remainingTime, confidence,
    adaptiveResult, communicationAnalytics, speechTimeline, analyticsError, loadingAnalytics,
    startSession, nextQuestion, submitAnswer, skipQuestion, elapsedSeconds 
  } = useInterviewSession(sessionId);

  const [currentAnswer, setCurrentAnswer] = useState('');
  const [questionStartTime, setQuestionStartTime] = useState<string | null>(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [dynamicQuestion, setDynamicQuestion] = useState<any>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    if (session?.state === 'STARTED' || session?.state === 'ASKING') {
      setFocusMode(true);
    } else {
      setFocusMode(false);
    }
    return () => setFocusMode(false);
  }, [session?.state, setFocusMode]);

  useEffect(() => {
    if ((session?.state === 'STARTED' || session?.state === 'ASKING') && !questionStartTime) {
      setQuestionStartTime(new Date().toISOString());
    }
  }, [session?.state, session?.progress.currentQuestionIndex, questionStartTime]);

  useEffect(() => {
    if (session?.state === 'COMPLETED' && !reportPending) {
      // Auto-redirect to the report page after a short delay
      const timer = setTimeout(() => {
        navigate(`/report/${session.id}`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [session?.state, session?.id, navigate, reportPending]);

  const handleExit = () => {
    if (session?.state === 'STARTED' || session?.state === 'ASKING') {
      setShowExitConfirm(true);
    } else {
      navigate('/dashboard');
    }
  };

  const confirmExit = () => {
    setFocusMode(false);
    navigate('/dashboard');
  };

  const currentQuestion = dynamicQuestion || (session?.progress?.currentQuestionIndex !== undefined && session.progress.currentQuestionIndex >= 0 && interview?.questions
    ? interview.questions[session.progress.currentQuestionIndex]
    : null);

  const getInterviewTitle = (type: string) => {
    if (!type) return 'Interview';
    const lower = type.toLowerCase();
    if (lower.includes('technical')) return 'Technical Interview';
    if (lower.includes('behavioral')) return 'Behavioral Interview';
    if (lower.includes('mcq')) return 'MCQ Interview';
    if (lower.includes('resume')) return 'Resume-Based Interview';
    if (lower.includes('hr')) return 'HR Interview';
    return `${type} Interview`;
  };

  const interviewTitle = getInterviewTitle(interview?.interviewType || '');
  const interviewSubtitle = interview?.company ? `${interview.role} · ${interview.company}` : interview?.role;
  const currentQNum = (session?.progress?.currentQuestionIndex ?? 0) + 1;
  const totalQNum = session?.progress?.totalQuestions ?? 1;
  const progressPercent = Math.min(100, Math.max(0, (currentQNum / totalQNum) * 100));

  const handleStart = async () => {
    await startSession();
  };

  const handleSkip = async () => {
    await skipQuestion();
  };

  const isSubmittingRef = React.useRef(false);

  const handleSubmit = React.useCallback(async (overrideAnswer?: string, shouldAdvance = true) => {
    if (!currentQuestion || !questionStartTime || !session || isSubmittingRef.current) return;
    const answerToSubmit = overrideAnswer || currentAnswer;
    if (!answerToSubmit.trim()) return;

    isSubmittingRef.current = true;
    try {
      const responseData = await submitAnswer(currentQuestion.id || `q_${session.progress.currentQuestionIndex}`, answerToSubmit, questionStartTime, answerToSubmit.split(' ').length);
      setCurrentAnswer('');
      setQuestionStartTime(null);
      if (responseData?.nextQuestion) {
        setDynamicQuestion(responseData.nextQuestion);
      } else if (shouldAdvance) {
        setDynamicQuestion(null);
        await nextQuestion();
      }
    } finally {
      isSubmittingRef.current = false;
    }
  }, [currentQuestion, questionStartTime, session, currentAnswer, submitAnswer, nextQuestion]);

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
    if (voice.connectionStatus === 'connecting') return 'Checking microphone and voice connection...';
    if (voice.connectionStatus === 'error') return 'Voice unavailable. We couldn\'t connect to the voice service.';
    
    switch (voice.interviewState) {
      case 'READY': return '✓ Voice ready. Press "Start Answer" when you are ready to speak.';
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

  const isFocused = session.state === 'STARTED' || session.state === 'ASKING';

  return (
    <div className={`flex flex-col lg:flex-row h-full ${isFocused ? 'bg-white' : ''}`}>
      
      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Leave interview?</h3>
            <p className="text-slate-600 mb-8">Your current interview progress may be lost. Are you sure you want to exit?</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setShowExitConfirm(false)}
                className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Continue Interview
              </button>
              <button 
                onClick={confirmExit}
                className="w-full py-3 px-4 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
              >
                Exit Interview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Left side: Interview Content */}
      <div className={`flex-1 ${liveEvaluation ? 'lg:w-2/3' : 'w-full'} overflow-y-auto pb-24 px-4 sm:px-6 lg:px-8 py-6 scrollbar-thin scrollbar-thumb-slate-200`}>
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          
          {/* Header Row (Title + Exit Button) */}
          <div className="flex justify-between items-start mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{interviewTitle}</h1>
              <p className="text-slate-600 mt-1 text-lg">{interviewSubtitle}</p>
            </div>
            
            {isFocused && (
              <button 
                onClick={handleExit}
                className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-transparent hover:border-slate-200"
              >
                Exit Interview
              </button>
            )}
          </div>

          {(session.state === 'STARTED' || session.state === 'ASKING') && currentQuestion && (
            <div className="mb-8">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-slate-700">Question {currentQNum} of {totalQNum}</span>
                <SessionTimer startedAt={session.startedAt} isComplete={false} fallbackElapsedSeconds={elapsedSeconds} />
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${progressPercent}%` }}
                  role="progressbar"
                  aria-valuenow={currentQNum}
                  aria-valuemin={1}
                  aria-valuemax={totalQNum}
                  aria-label="Interview Progress"
                ></div>
              </div>
            </div>
          )}

      <div className={`mt-2 ${isFocused ? '' : 'bg-white rounded-3xl p-8 shadow-sm border border-slate-200'}`}>
        
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
            <div className="flex bg-slate-100 rounded-xl p-1 mb-6 w-full sm:w-fit">
              <button 
                onClick={() => {
                  if (isVoiceMode) {
                    voice.stopVoice();
                    setIsVoiceMode(false);
                  }
                }}
                className={`flex-1 sm:flex-none sm:px-8 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${!isVoiceMode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <MessageSquare size={16} /> Text
              </button>
              <button 
                onClick={async () => {
                  if (!isVoiceMode) {
                    setIsVoiceMode(true);
                    await voice.startVoice();
                  }
                }}
                className={`flex-1 sm:flex-none sm:px-8 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${isVoiceMode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Mic size={16} /> Voice
              </button>
            </div>

            <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl">
              <h3 className="text-xl font-medium text-slate-800">{currentQuestion.question}</h3>
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
                  isSpeaking={voice.isSpeaking}
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

                {voice.connectionStatus === 'error' && (
                  <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 bg-rose-50 p-6 rounded-2xl border border-rose-100">
                    <p className="text-rose-700 font-medium">Voice is currently unavailable.</p>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => { voice.stopVoice(); setIsVoiceMode(false); }}
                        className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                      >
                        Continue with Text
                      </button>
                      <button 
                        onClick={() => voice.startVoice()}
                        className="px-6 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                )}
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
      </div>

      {/* Right side: Analytics Panel */}
      {liveEvaluation && (
        <div className="w-full lg:w-1/3 h-full border-t lg:border-t-0 border-slate-200 bg-slate-50">
          <InterviewAnalyticsPanel 
            evaluation={liveEvaluation}
            decision={decision}
            difficulty={difficulty}
            remainingQuestions={remainingQuestions}
            remainingTime={remainingTime}
            confidence={confidence}
            adaptiveResult={adaptiveResult}
            communicationAnalytics={communicationAnalytics}
            speechTimeline={speechTimeline}
            isLoading={loadingAnalytics || (loading && !liveEvaluation)}
            error={analyticsError}
            hasStarted={session.state === 'STARTED' || session.state === 'ASKING'}
          />
        </div>
      )}

    </div>
  );
};

export default InterviewRuntime;
