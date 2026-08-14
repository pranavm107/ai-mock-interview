import { RecommendationContext, RecommendationSource } from '../types/recommendation';

export interface RecommendationDecision {
  interviewType: "Technical" | "HR" | "Behavioral" | "Mixed";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  focusAreas: string[];
  questionCount: number;
  durationMinutes: number;
  recommendationReason: string;
  recommendationSource: RecommendationSource;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}

const PERFORMANCE_THRESHOLDS = {
  critical: 50,
  weak: 60,
  strong: 80,
};

const INACTIVITY_DAYS = 15;
const FOCUS_AREA_LIMIT = 3;

export const recommendInterview = (context: RecommendationContext): RecommendationDecision => {
  // Normalize strings for weak areas and skills
  const normalizedWeakAreas = context.performance.weakAreas.map(w => w.trim());
  const normalizedSkills = context.resume.skills.map(s => s.trim());

  // Determine inactivity
  let daysSinceLastInterview = -1;
  if (context.activity.lastInterviewDate) {
    const lastDate = new Date(context.activity.lastInterviewDate);
    const now = new Date();
    daysSinceLastInterview = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
  }
  const isInactive = daysSinceLastInterview >= INACTIVITY_DAYS;

  // Signal Analysis
  const hasWeakAreas = normalizedWeakAreas.length > 0;
  const hasHistory = context.performance.completedInterviews > 0;
  const isPoorPerformance = hasHistory && context.performance.averageScore > 0 && context.performance.averageScore < PERFORMANCE_THRESHOLDS.weak;
  const isStrongPerformance = hasHistory && context.performance.averageScore >= PERFORMANCE_THRESHOLDS.strong;
  
  // Priority Resolution & Source
  let priority: RecommendationDecision["priority"] = "LOW";
  let source: RecommendationSource = "default";
  let reason = "This is a great starting point to practice your interview skills.";

  if (isPoorPerformance && hasWeakAreas) {
    priority = "CRITICAL";
    source = "weak_areas";
    reason = `Your recent interviews highlight challenges in ${normalizedWeakAreas.slice(0, 2).join(" and ")}. Let's focus on these areas.`;
  } else if (isInactive && hasHistory) {
    priority = "HIGH";
    source = "streak_recovery";
    reason = `You haven't practiced in ${daysSinceLastInterview} days. Let's do a quick session to get back into the rhythm!`;
  } else if (hasWeakAreas) {
    priority = "HIGH";
    source = "weak_areas";
    reason = `We've identified ${normalizedWeakAreas.slice(0, 2).join(" and ")} as areas for improvement from your recent sessions.`;
  } else if (isStrongPerformance) {
    priority = "MEDIUM";
    source = "analytics";
    reason = "Your performance has been excellent. Challenge yourself with a harder interview to keep growing.";
  } else if (!hasHistory && context.profile.targetRole) {
    priority = "MEDIUM";
    source = "career_goal";
    reason = `This session is tailored to help you prepare for a ${context.profile.targetRole} role.`;
  } else if (!hasHistory && normalizedSkills.length > 0) {
    priority = "LOW";
    source = "resume";
    reason = "Based on your resume, this interview will evaluate your core competencies.";
  }

  // Interview Type determination
  let interviewType: "Technical" | "HR" | "Behavioral" | "Mixed" = "Technical";
  let focusAreas: string[] = [];

  const behavioralKeywords = ["communication", "leadership", "conflict", "behavioral", "teamwork", "soft skills"];
  if (source === "weak_areas") {
    focusAreas = normalizedWeakAreas.slice(0, FOCUS_AREA_LIMIT);
    const isBehavioral = focusAreas.some(area => behavioralKeywords.some(kw => area.toLowerCase().includes(kw)));
    interviewType = isBehavioral ? "Behavioral" : "Technical";
  } else if (source === "resume" || source === "career_goal") {
    focusAreas = normalizedSkills.slice(0, FOCUS_AREA_LIMIT);
    interviewType = context.profile.targetRole && context.profile.targetRole.toLowerCase().includes("hr") ? "HR" : "Technical";
  }

  if (focusAreas.length === 0 && context.profile.targetRole) {
    interviewType = "Mixed";
  }

  // Difficulty determination
  let difficulty: "EASY" | "MEDIUM" | "HARD" = "MEDIUM";

  if (source === "streak_recovery") {
    difficulty = isPoorPerformance ? "EASY" : "MEDIUM";
  } else if (!hasHistory) {
    difficulty = "MEDIUM";
  } else if (isPoorPerformance) {
    difficulty = "EASY";
  } else if (isStrongPerformance) {
    difficulty = "HARD";
  } else {
    // Repeated HARD with moderate scores drops difficulty
    const recentHards = context.performance.recentDifficulties.slice(0, 3).filter(d => d === 'HARD').length;
    if (recentHards >= 2 && context.performance.averageScore < 75) {
      difficulty = "MEDIUM";
      if (source === "default" || source === "analytics") {
        reason = "You've tackled some tough sessions recently. A medium difficulty interview will help reinforce core concepts.";
        source = "analytics";
      }
    }
  }

  // Duration & Question Count
  let questionCount = 5;
  let durationMinutes = 30;

  if (source === "streak_recovery") {
    questionCount = 3;
    durationMinutes = 15;
  } else if (difficulty === "EASY") {
    questionCount = 5;
    durationMinutes = 20;
  } else if (difficulty === "MEDIUM") {
    questionCount = 6;
    durationMinutes = 30;
  } else if (difficulty === "HARD") {
    questionCount = 8;
    durationMinutes = 45;
  }

  return {
    interviewType,
    difficulty,
    focusAreas,
    questionCount,
    durationMinutes,
    recommendationReason: reason,
    recommendationSource: source,
    priority
  };
};
