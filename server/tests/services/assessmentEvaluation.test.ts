import { describe, it, expect } from 'vitest';
import { evaluateSubmission } from '../../src/services/assessmentEvaluationService';
import { Assessment, AssessmentQuestion, AssessmentSubmissionRequest } from '../../src/types/assessment';

describe('Assessment Evaluation Engine', () => {
  const mockAssessment: Assessment = {
    id: 'test-123',
    userId: 'user-123',
    status: 'READY',
    type: 'RESUME_MCQ',
    title: 'Test',
    questionCount: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockQuestions: AssessmentQuestion[] = [
    { id: 'q1', assessmentId: 'test-123', question: 'Q1', options: [], correctOptionId: 'optA', explanation: 'E1', difficulty: 'EASY', skill: 'React' },
    { id: 'q2', assessmentId: 'test-123', question: 'Q2', options: [], correctOptionId: 'optB', explanation: 'E2', difficulty: 'EASY', skill: 'React' },
    { id: 'q3', assessmentId: 'test-123', question: 'Q3', options: [], correctOptionId: 'optC', explanation: 'E3', difficulty: 'MEDIUM', skill: 'Node.js' },
    { id: 'q4', assessmentId: 'test-123', question: 'Q4', options: [], correctOptionId: 'optD', explanation: 'E4', difficulty: 'HARD', skill: 'Node.js' },
  ];

  it('should accurately calculate 100% score for all correct answers', () => {
    const submission: AssessmentSubmissionRequest = {
      answers: [
        { questionId: 'q1', selectedOptionId: 'optA' },
        { questionId: 'q2', selectedOptionId: 'optB' },
        { questionId: 'q3', selectedOptionId: 'optC' },
        { questionId: 'q4', selectedOptionId: 'optD' }
      ]
    };

    const result = evaluateSubmission(mockAssessment, mockQuestions, submission);

    expect(result.score).toBe(100);
    expect(result.percentage).toBe(100);
    expect(result.correctAnswers).toBe(4);
    expect(result.incorrectAnswers).toBe(0);
    expect(result.unansweredQuestions).toBe(0);
    expect(result.skillPerformance).toHaveLength(2);
    
    const reactSkill = result.skillPerformance.find(s => s.skill === 'React');
    expect(reactSkill?.percentage).toBe(100);
  });

  it('should safely handle unanswered questions without crashing and score them as incorrect/unanswered', () => {
    // Only answer 1 out of 4 questions correctly. 1 incorrect, 2 unanswered.
    const submission: AssessmentSubmissionRequest = {
      answers: [
        { questionId: 'q1', selectedOptionId: 'optA' }, // Correct
        { questionId: 'q2', selectedOptionId: 'optA' }  // Incorrect
        // q3 and q4 are completely missing (unanswered)
      ]
    };

    const result = evaluateSubmission(mockAssessment, mockQuestions, submission);

    // 1 correct out of 4 total = 25%
    expect(result.totalQuestions).toBe(4);
    expect(result.correctAnswers).toBe(1);
    expect(result.incorrectAnswers).toBe(1);
    expect(result.unansweredQuestions).toBe(2);
    expect(result.score).toBe(25);
    expect(result.percentage).toBe(25);

    // React: 1 correct out of 2 total = 50%
    const reactSkill = result.skillPerformance.find(s => s.skill === 'React');
    expect(reactSkill?.percentage).toBe(50);

    // Node.js: 0 correct out of 2 total (unanswered) = 0%
    const nodeSkill = result.skillPerformance.find(s => s.skill === 'Node.js');
    expect(nodeSkill?.percentage).toBe(0);
    expect(nodeSkill?.totalQuestions).toBe(2);
    expect(nodeSkill?.correctAnswers).toBe(0);
  });

  it('should safely handle zero questions without dividing by zero', () => {
    const submission: AssessmentSubmissionRequest = { answers: [] };
    const result = evaluateSubmission(mockAssessment, [], submission);

    expect(result.totalQuestions).toBe(0);
    expect(result.score).toBe(0);
    expect(result.percentage).toBe(0);
  });
});
