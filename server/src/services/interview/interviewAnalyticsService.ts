import { InterviewAnalytics, InterviewQuestion } from "../../types/interview";
import { InterviewBlueprint } from "../../types/interviewBlueprint";

export const generateInterviewAnalytics = (
  questions: InterviewQuestion[],
  blueprint: InterviewBlueprint
): InterviewAnalytics => {
  // 1. Resume Coverage Percent
  // How many known projects/experience were actually hit?
  const knownResumeTerms = new Set([
    ...blueprint.resumeCoverage.targetProjects.map(p => p.toLowerCase()),
    ...blueprint.resumeCoverage.targetExperience.map(e => e.toLowerCase())
  ]);
  
  let hitResumeTerms = 0;
  knownResumeTerms.forEach(term => {
    const isHit = questions.some(q => 
      q.question.toLowerCase().includes(term) || 
      (q.expectedTopics && q.expectedTopics.some(t => t.toLowerCase().includes(term)))
    );
    if (isHit) hitResumeTerms++;
  });
  
  const resumeCoveragePercent = knownResumeTerms.size > 0 
    ? Math.round((hitResumeTerms / knownResumeTerms.size) * 100)
    : 100;

  // 2. Skill Coverage Percent
  const allSkills = new Set([...blueprint.skillCoverage.prioritySkills.map(s => s.toLowerCase())]);
  let hitSkills = 0;
  
  allSkills.forEach(skill => {
    const isHit = questions.some(q => 
      (q.skillsEvaluated && q.skillsEvaluated.some(s => s.toLowerCase().includes(skill))) ||
      (q.expectedTopics && q.expectedTopics.some(t => t.toLowerCase().includes(skill)))
    );
    if (isHit) hitSkills++;
  });

  const skillCoveragePercent = allSkills.size > 0 
    ? Math.round((hitSkills / allSkills.size) * 100)
    : 100;

  // 3. Role/Company Alignment (Placeholder logic based on distribution accuracy)
  // Since validator ensures exact distribution, alignment is essentially 100%
  const roleAlignmentPercent = 100;
  const companyAlignmentPercent = 100;
  const difficultyAlignmentPercent = 100;

  // 4. Question Diversity (Unique topics / total questions)
  const uniqueTopics = new Set<string>();
  questions.forEach(q => {
    if (q.expectedTopics) {
      q.expectedTopics.forEach(t => uniqueTopics.add(t.toLowerCase()));
    }
  });

  // A very diverse interview has around 1.5 - 2 unique topics per question
  const diversityRatio = uniqueTopics.size / Math.max(1, questions.length);
  const questionDiversityPercent = Math.min(100, Math.round((diversityRatio / 1.5) * 100));

  return {
    resumeCoveragePercent,
    skillCoveragePercent,
    difficultyAlignmentPercent,
    roleAlignmentPercent,
    companyAlignmentPercent,
    questionDiversityPercent
  };
};
