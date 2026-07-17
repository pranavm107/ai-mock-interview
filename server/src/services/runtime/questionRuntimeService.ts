import { InterviewSession, QuestionState } from "../../types/interviewSession";
import { InterviewQuestion } from "../../types/interview";

export const getNextQuestion = (
  session: InterviewSession,
  questions: InterviewQuestion[]
): InterviewQuestion | null => {
  if (session.progress.currentQuestionIndex >= questions.length - 1) {
    return null;
  }
  return questions[session.progress.currentQuestionIndex + 1];
};

export const advanceToNextQuestion = (
  session: InterviewSession,
  questions: InterviewQuestion[]
): InterviewSession => {
  const nextIndex = session.progress.currentQuestionIndex + 1;
  const isComplete = nextIndex >= questions.length;
  
  return {
    ...session,
    progress: {
      ...session.progress,
      currentQuestionIndex: isComplete ? session.progress.currentQuestionIndex : nextIndex,
      isComplete
    }
  };
};

export const skipCurrentQuestion = (
  session: InterviewSession,
  questions: InterviewQuestion[]
): InterviewSession => {
  // Update metrics for skipped
  const updatedSession = advanceToNextQuestion(session, questions);
  updatedSession.metrics.questionsSkipped += 1;
  return updatedSession;
};
