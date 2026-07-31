import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterviewSession } from '../../../hooks/useInterviewSession';
import {
  InterviewHeader,
  InterviewProgress,
  InterviewTimer,
  QuestionCard,
  AnswerEditor,
  QuestionNavigator,
  SessionControls,
  PauseDialog,
  FinishDialog,
  InterviewSidebar,
  UploadProgress,
  VoiceSection
} from './index';
import {
  AudioPermissionDialog,
  MicrophoneError
} from '../speech';
import { useWebcam } from '../../../hooks/useWebcam';
import {
  CameraPreview,
  CameraControls,
  CameraPermissionCard,
  CameraError
} from '../webcam';
import * as interviewService from '../../../services/interviewService';

interface Props {
  interviewId: string;
}

export const InterviewSessionView: React.FC<Props> = ({ interviewId }) => {
  const navigate = useNavigate();
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const {
    interview,
    questions,
    loading,
    error,
    currentQuestionIndex,
    currentQuestion,
    currentAnswer,
    elapsedSeconds,
    isPaused,
    updateAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    pauseInterview,
    resumeInterview,
    finishInterview,
    speech,
    interimTranscript
  } = useInterviewSession(interviewId);

  const webcam = useWebcam();

  // Handle video upload when blob is ready
  useEffect(() => {
    if (webcam.videoBlob && interview) {
      interviewService.uploadInterviewVideo(webcam.videoBlob, interview.id)
        .then((url) => {
          return interviewService.saveVideoMetadata(interview.id, {
            videoUrl: url,
            videoSize: webcam.videoBlob!.size,
            videoDuration: elapsedSeconds
          });
        })
        .catch(console.error);
    }
  }, [webcam.videoBlob, interview?.id]); // Note: intentional dependency on just ID/Blob

  // Synchronize pause/resume
  useEffect(() => {
    if (!webcam) return;
    if (isPaused && webcam.isRecording) {
      webcam.pauseRecording();
    } else if (!isPaused && webcam.isPaused) {
      webcam.resumeRecording();
    }
  }, [isPaused, webcam?.isRecording, webcam?.isPaused, webcam]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        pauseInterview();
      } else if (e.ctrlKey && e.key === 'Enter') {
        if (currentQuestionIndex < questions.length - 1) {
          nextQuestion();
        } else {
          setShowFinishConfirm(true);
        }
      } else if (e.ctrlKey && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        if (speech.speechState === 'listening') {
          speech.stopRecording();
          if (webcam?.isRecording) webcam.stopRecording();
        } else if (speech.speechState === 'idle' || speech.speechState === 'paused' || speech.speechState === 'error') {
          speech.startRecording();
          if (webcam?.isCameraEnabled && !webcam?.isRecording) webcam.startRecording();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestionIndex, questions.length, nextQuestion, pauseInterview, speech, webcam]);

  if (loading) {
    return <div className="animate-pulse bg-slate-100 rounded-3xl h-[600px] w-full" />;
  }

  if (error || !interview) {
    return <div className="text-rose-500 p-6 bg-rose-50 rounded-2xl">Error loading session: {error}</div>;
  }

  if (interview.status === 'Completed') {
    // Should be handled by parent or redirect to history
    return <div className="p-6 text-center text-slate-500">Interview is already completed.</div>;
  }

  const answeredCount = questions.filter(q => q.status === 'answered' || (q.id === currentQuestion?.id && currentAnswer.trim().length > 0)).length;

  const handleFinish = () => {
    setShowFinishConfirm(false);
    setIsFinishing(true);
    webcam.stopRecording(); // Trigger blob generation
    speech.stopRecording();
  };

  const finalizeInterview = async () => {
    await finishInterview();
    navigate('/history');
  };

  const handleLeave = () => {
    webcam.stopRecording();
    speech.stopRecording();
    navigate('/history');
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <InterviewHeader interview={interview} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
        <div className="lg:col-span-1">
          <InterviewSidebar
            questions={questions}
            currentIndex={currentQuestionIndex}
            onSelect={goToQuestion}
          />
        </div>

        <div className="lg:col-span-3 flex flex-col min-h-[600px]">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex-1 flex flex-col">

            {isFinishing ? (
              <UploadProgress onComplete={finalizeInterview} />
            ) : currentQuestion && (
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Main Q&A Content (Left Column) */}
                <div className="lg:col-span-8 flex flex-col h-full">
                  <QuestionCard order={currentQuestion.order} question={currentQuestion.question} />

                  <VoiceSection
                    speechState={speech.speechState}
                    isWebcamRecording={webcam.isRecording}
                    isPaused={isPaused}
                    onToggle={() => {
                      if (speech.speechState === 'listening' || webcam.isRecording) {
                        speech.stopRecording();
                        webcam.stopRecording();
                      } else if (speech.speechState === 'paused' || webcam.isPaused) {
                        speech.resumeRecording();
                        webcam.resumeRecording();
                      } else {
                        speech.startRecording();
                        if (webcam.isCameraEnabled) webcam.startRecording();
                      }
                    }}
                  />

                  <MicrophoneError error={speech.error} />

                  <div className="flex-1 min-h-[300px] mb-6">
                    <AnswerEditor
                      value={currentAnswer + (interimTranscript ? (currentAnswer && !currentAnswer.endsWith(' ') ? ' ' : '') + interimTranscript : '')}
                      onChange={updateAnswer}
                      saveStatus={'saved'}
                      disabled={isPaused}
                    />
                  </div>

                  <QuestionNavigator
                    onPrev={prevQuestion}
                    onNext={nextQuestion}
                    onFinish={() => setShowFinishConfirm(true)}
                    isFirst={currentQuestionIndex === 0}
                    isLast={currentQuestionIndex === questions.length - 1}
                    disabled={isPaused}
                  />
                </div>

                {/* Camera & Status (Right Column) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                    <p className="text-slate-500 font-semibold text-xs tracking-wider uppercase mb-4">Recording Timeline</p>
                    <InterviewProgress current={currentQuestionIndex + 1} total={questions.length} />
                    <div className="mt-4 flex items-center justify-between">
                      <InterviewTimer elapsedSeconds={elapsedSeconds} />
                      <div className="text-xs font-medium text-slate-400">
                        {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
                      </div>
                    </div>
                  </div>

                  {!webcam.isCameraEnabled && webcam.webcamState !== 'error' ? (
                    <CameraPermissionCard onEnable={webcam.startCamera} />
                  ) : (
                    <div className="flex flex-col group relative">
                      <CameraPreview videoRef={webcam.videoRef} stream={webcam.stream} state={webcam.webcamState} elapsedSeconds={elapsedSeconds} />
                      <CameraControls onTurnOff={webcam.stopCamera} />
                      <CameraError error={webcam.error} />
                    </div>
                  )}
                </div>

              </div>
            )}

            {!isFinishing && currentQuestion && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <SessionControls
                  onPause={pauseInterview}
                  onFinish={() => setShowFinishConfirm(true)}
                  onLeave={() => setShowLeaveConfirm(true)}
                  disabled={isPaused}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <PauseDialog
        isOpen={isPaused}
        onResume={resumeInterview}
        elapsedSeconds={elapsedSeconds}
      />

      <FinishDialog
        isOpen={showFinishConfirm}
        onConfirm={handleFinish}
        onCancel={() => setShowFinishConfirm(false)}
        answeredCount={answeredCount}
        totalCount={questions.length}
        elapsedSeconds={elapsedSeconds}
      />

      <AudioPermissionDialog
        isOpen={speech.error === 'Microphone permission denied'}
        onRetry={speech.startRecording}
        onCancel={() => {
          // Just close the dialog, let them type
          speech.stopRecording();
        }}
      />

      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Leave Session?</h2>
            <p className="text-slate-500 mb-6">Your progress and answers have been auto-saved. You can resume later from the history page.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 h-12 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLeave}
                className="flex-1 h-12 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
