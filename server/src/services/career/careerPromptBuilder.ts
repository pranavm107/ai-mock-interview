import { CareerContext } from './careerAggregationService';

export const buildCareerPrompt = (
  userId: string,
  context: CareerContext
): string => {
  const { interviewSessions, totalInterviews, averageScore } = context;
  return `
You are an expert AI Career Coach. Your goal is to analyze the user's interview history, resume skills, and progress to provide personalized career guidance.

User Profile context:
- User ID: ${userId}
- Total Completed Interviews: ${totalInterviews}
- Average Interview Score: ${averageScore}
- Last Interview Date: ${context.lastInterviewDate || 'N/A'}
- Interview History Details: ${JSON.stringify(interviewSessions)}

Based on this information, generate a comprehensive career profile update.
You must return the response in strict JSON format. DO NOT INCLUDE ANY FREE-FORM TEXT OR MARKDOWN.
Return ONLY valid JSON matching this exact structure:

{
  "careerScore": 85,
  "careerReadiness": "High",
  "careerSummary": "A brief 2-sentence summary of overall career readiness.",
  "recommendedSkills": ["System Design", "React"],
  "priorityTopics": ["Behavioral Interviews"],
  "estimatedHiringReadiness": "Ready for senior roles",
  "weeklyCoaching": {
    "focusAreas": ["Algorithms", "Communication"],
    "tasks": ["Practice 3 medium DSA problems", "Improve communication pace", "Complete one mock interview"],
    "recommendations": ["Review Operating Systems", "Practice behavioral STAR questions"]
  },
  "monthlyCoaching": {
    "achievements": ["Completed 5 mock interviews", "Improved System Design score"],
    "focusAreas": ["Leadership principles", "Advanced Node.js"],
    "improvementTrends": ["Communication improved by 10%"],
    "longTermAdvice": "Focus on system scalability concepts to target Staff level roles."
  },
  "dailyGoals": {
    "tasks": [
      { "description": "Complete one coding problem" },
      { "description": "Practice 10 minutes speaking" },
      { "description": "Watch one System Design lesson" }
    ]
  },
  "learningRoadmap": {
    "thisWeek": [
      {
        "learningGoal": "Master sliding window technique",
        "priority": "High",
        "estimatedHours": 5,
        "resources": ["LeetCode", "YouTube"],
        "status": "Pending"
      }
    ],
    "thisMonth": [
      {
        "learningGoal": "Understand database normalization",
        "priority": "Medium",
        "estimatedHours": 10,
        "resources": ["Designing Data-Intensive Applications"],
        "status": "Pending"
      }
    ],
    "next3Months": [],
    "futureSkills": []
  }
}

Important constraints:
- "careerScore" should be a number from 0-100.
- "careerReadiness" should be one of "Low", "Medium", "High", "Excellent".
- Ensure tasks are actionable and specific.
`;
};
