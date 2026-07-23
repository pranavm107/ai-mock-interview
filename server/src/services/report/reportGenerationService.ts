import { InterviewReport } from "../../types/interviewReport";
import { Interview } from "../../types/interview";
import { InterviewSession, SessionAnswer } from "../../types/interviewSession";
import { evaluateQuestions } from "./questionEvaluationService";
import { analyzeStrengths } from "./strengthAnalysisService";
import { analyzeWeaknesses } from "./weaknessAnalysisService";
import { generateRecommendations } from "./recommendationService";
import { calculateScores } from "./scoringEngine";
import { saveReport, getReportBySessionId } from "./reportStorageService";
import { generateReportSummaryAndVerdict } from "./aiSummaryService";
import { getSessionTimeline } from "../runtime/eventLogger";
import { SpeechSummary } from "../../types/speech";

export const generateInterviewReport = async (
  session: InterviewSession,
  interview: Interview
): Promise<InterviewReport> => {
  
  // 1. Check if report already exists
  const existingReport = await getReportBySessionId(session.id);
  if (existingReport) {
    return existingReport;
  }

  // 2. Fetch answers (answers are embedded in session in this implementation or fetched from storage)
  const { getAnswersBySession } = await import('../runtime/answerStorageService');
  let answers: SessionAnswer[] = [];
  try {
    answers = await getAnswersBySession(session.id);
  } catch (_e) {
    console.warn("Failed to get answers from getAnswersBySession");
  }
  
  // 3. Evaluate Questions
  const questionEvaluations = await evaluateQuestions(interview.questions, answers);
  
  // 4. Calculate Scores
  const scores = calculateScores(questionEvaluations);
  
  // 5. Analyze Strengths and Weaknesses
  const strengths = analyzeStrengths(questionEvaluations);
  const weaknesses = analyzeWeaknesses(questionEvaluations);
  
  // 6. Generate Recommendations
  const { skillsAnalysis, recommendations, improvementPlan } = await generateRecommendations(
    strengths, 
    weaknesses, 
    interview.role, 
    interview.settings.candidateExperienceLevel
  );

  // 7. Generate Summary and Hiring Verdict
  const { summary, hiringRecommendation } = await generateReportSummaryAndVerdict(
    scores.overallEvaluation.overallScore,
    scores.overallEvaluation.technicalScore,
    scores.overallEvaluation.communicationScore,
    scores.overallEvaluation.behavioralScore,
    scores.overallEvaluation.problemSolvingScore,
    strengths,
    weaknesses,
    interview.role,
    interview.settings.candidateExperienceLevel
  );
  
  scores.overallEvaluation.summary = summary;
  
  // 8. Fetch Timeline
  const timeline = await getSessionTimeline(session.id);
  
  // 9. Mock ATS Readiness
  const mockResumeScore = Math.floor(Math.random() * (95 - 75 + 1) + 75); // 75 to 95
  const overallEmployability = Math.round((mockResumeScore * 0.4) + (scores.overallEvaluation.overallScore * 0.6));
  const atsReadiness = {
    resumeScore: mockResumeScore,
    interviewScore: scores.overallEvaluation.overallScore,
    overallEmployability
  };

  // 10. Fetch Speech Analytics
  const { getSessionSpeechSummary } = await import('../speech/speechStorageService');
  const speechAnalytics = await getSessionSpeechSummary(session.id);
  let speechSummary: SpeechSummary | undefined = undefined;
  
  if (speechAnalytics) {
    speechSummary = {
      overallCommunicationScore: speechAnalytics.averageCommunicationScore,
      averageFluency: speechAnalytics.averageFluency,
      averageGrammar: speechAnalytics.averageGrammar,
      averageVocabulary: speechAnalytics.averageVocabulary,
      averagePronunciation: speechAnalytics.averagePronunciation,
      averagePace: speechAnalytics.averagePace,
      totalFillerWords: speechAnalytics.averageFillers,
      topRecommendations: speechAnalytics.recommendations
    };
  }

  // 11. Assemble Report
  const reportId = `rep_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  
  const report: InterviewReport = {
    id: reportId,
    sessionId: session.id,
    interviewId: interview.id!,
    userId: session.userId,
    generatedAt: new Date().toISOString(),
    
    overallEvaluation: scores.overallEvaluation,
    technicalEvaluation: scores.technicalEvaluation,
    communicationEvaluation: scores.communicationEvaluation,
    behavioralEvaluation: scores.behavioralEvaluation,
    
    hiringRecommendation,
    atsReadiness,
    speechSummary,
    timeline,
    
    strengths,
    weaknesses,
    skillsAnalysis,
    recommendations,
    improvementPlan,
    
    questionEvaluations,
    version: "1.0"
  };

  // 8. Save Report
  await saveReport(report);
  
  return report;
};
