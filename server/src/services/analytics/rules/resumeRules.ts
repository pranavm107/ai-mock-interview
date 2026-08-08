import { AnalyticsRecommendation } from '../../../types/analyticsResponse';
import { RuleContext } from './recommendationTypes';

export const evaluateResumeRules = (context: RuleContext): AnalyticsRecommendation[] => {
  const recommendations: AnalyticsRecommendation[] = [];
  const { resumeAnalytics } = context;

  if (!resumeAnalytics) {
    recommendations.push({
      id: 'resume-missing',
      priority: 'HIGH',
      title: 'Upload Resume',
      description: 'Upload your resume to receive ATS scores and personalized career coaching.',
      action: 'Upload Resume',
      category: 'Resume'
    });
    return recommendations;
  }

  // ATS < 80
  if (resumeAnalytics.atsScore !== null && resumeAnalytics.atsScore < 80) {
    recommendations.push({
      id: 'resume-ats-low',
      priority: 'HIGH',
      title: 'Improve ATS compatibility',
      description: `Your ATS score is ${resumeAnalytics.atsScore}/100. Consider adding more relevant keywords.`,
      action: 'Optimize Resume Keywords',
      category: 'Resume'
    });
  }

  // Projects < 3
  if (resumeAnalytics.projectsCount < 3) {
    recommendations.push({
      id: 'resume-projects',
      priority: 'MEDIUM',
      title: 'Add more projects',
      description: 'You have fewer than 3 projects listed. Strong portfolios highlight your practical skills.',
      action: 'Expand Projects Section',
      category: 'Career'
    });
  }

  // Skills < 10
  if (resumeAnalytics.skillsCount < 10) {
    recommendations.push({
      id: 'resume-skills',
      priority: 'LOW',
      title: 'Expand technical skills',
      description: 'You have few skills extracted from your resume.',
      action: 'Add More Skills',
      category: 'Career'
    });
  }

  // Experience == 0
  if (resumeAnalytics.experienceCount === 0) {
    recommendations.push({
      id: 'resume-experience',
      priority: 'MEDIUM',
      title: 'Add internship experience',
      description: 'No work experience found. Highlight internships, volunteer work, or freelance projects.',
      action: 'Update Experience Section',
      category: 'Career'
    });
  }

  return recommendations;
};
