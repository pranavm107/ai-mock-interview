import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateInterview } from '../../src/services/interview/interviewGenerationService';
import * as groqClient from '../../src/services/ai/groqClient';
import { db } from '../../src/config/firebaseAdmin';

// Mock Firebase Admin
vi.mock('../../src/config/firebaseAdmin', () => ({
  db: {
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: vi.fn(() => Promise.resolve({
          exists: true,
          data: () => ({
            structuredResume: { skills: ['React', 'Node.js'] }
          })
        }))
      }))
    }))
  }
}));

describe('generateInterview (MCQ)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate an MCQ interview and validate its schema', async () => {
    const mockAiResponse = {
      title: "Mock Interview for Frontend Engineer at Google",
      estimatedDuration: 45,
      questions: [
        {
          section: "ROLE",
          type: "TECHNICAL",
          difficulty: "MEDIUM",
          question: "What is React?",
          expectedTopics: ["UI", "Components"],
          skillsEvaluated: ["React"],
          followUps: [],
          options: [
            { id: "A", text: "A library" },
            { id: "B", text: "A database" },
            { id: "C", text: "An OS" },
            { id: "D", text: "A browser" }
          ],
          correctOptionId: "A",
          explanation: "React is a JS library for UI."
        },
        {
          section: "ROLE",
          type: "TECHNICAL",
          difficulty: "HARD",
          question: "What is Node?",
          expectedTopics: ["Backend", "V8"],
          skillsEvaluated: ["Node.js"],
          followUps: [],
          options: [
            { id: "A", text: "A runtime" },
            { id: "B", text: "A database" },
            { id: "C", text: "An OS" },
            { id: "D", text: "A browser" }
          ],
          correctOptionId: "A",
          explanation: "Node is a JS runtime."
        },
        {
          section: "COMPANY",
          type: "BEHAVIORAL",
          difficulty: "MEDIUM",
          question: "Why Google?",
          expectedTopics: ["Culture"],
          skillsEvaluated: ["Soft skills"],
          followUps: [],
          options: [
            { id: "A", text: "Scale" },
            { id: "B", text: "Free food" },
            { id: "C", text: "Money" },
            { id: "D", text: "Location" }
          ],
          correctOptionId: "A",
          explanation: "Scale is the best answer."
        }
      ]
    };

    vi.spyOn(groqClient, 'generateJson').mockResolvedValueOnce(JSON.stringify(mockAiResponse));

    const settings: any = {
      durationMinutes: 45,
      totalQuestions: 3,
      targetCompany: 'Google',
      targetRole: 'Frontend Engineer',
      candidateExperienceLevel: 'Mid',
      interviewType: 'MCQ'
    };

    const interview = await generateInterview('test-user', 'resume-123', settings);
    
    expect(interview.questions).toHaveLength(3);
    expect(interview.questions[0].options).toHaveLength(4);
    expect(interview.questions[0].correctOptionId).toBe("A");
    expect(interview.questions[0].explanation).toBeDefined();
  });

  it('should fail validation if MCQ is missing options', async () => {
    const mockAiResponse = {
      title: "Mock Interview",
      estimatedDuration: 45,
      questions: [
        {
          section: "ROLE",
          type: "TECHNICAL",
          difficulty: "MEDIUM",
          question: "What is React?",
          expectedTopics: ["UI", "Components"],
          skillsEvaluated: ["React"],
          followUps: []
          // MISSING options, correctOptionId, explanation
        }
      ]
    };

    vi.spyOn(groqClient, 'generateJson').mockResolvedValueOnce(JSON.stringify(mockAiResponse));

    const settings: any = {
      durationMinutes: 45,
      totalQuestions: 1, // Actually blueprint will force 3, but let's assume validation checks options first
      targetCompany: 'Google',
      targetRole: 'Frontend Engineer',
      candidateExperienceLevel: 'Mid',
      interviewType: 'MCQ'
    };

    await expect(generateInterview('test-user', 'resume-123', settings)).rejects.toThrow(/MCQ must have exactly 4 options/);
  });
});
