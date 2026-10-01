import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateResumeAssessment } from '../resumeAssessmentGenerationService';
import * as groqService from '../groqService';
import * as assessmentService from '../assessmentService';

// Mock dependencies
vi.mock('../groqService');
vi.mock('../assessmentService');
vi.mock('../../config/firebaseAdmin', () => ({
  db: {
    collection: vi.fn().mockReturnThis(),
    doc: vi.fn().mockReturnValue({
      id: 'mock-assessment-id',
      get: vi.fn().mockResolvedValue({
        exists: true,
        data: () => ({ userId: 'test-user-id', analysis: {} })
      })
    })
  }
}));

describe('generateResumeAssessment (Groq Migration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (assessmentService.createAssessment as any).mockResolvedValue(undefined);
    (assessmentService.saveAssessmentQuestions as any).mockResolvedValue(undefined);
    (assessmentService.updateAssessmentStatus as any).mockResolvedValue(undefined);
    (assessmentService.markAssessmentFailed as any).mockResolvedValue(undefined);
  });

  it('should succeed with valid JSON response, stripping answers from frontend view', async () => {
    const validJson = JSON.stringify({
      questions: [
        {
          question: "Test Q",
          options: [
            { id: "A", text: "1" },
            { id: "B", text: "2" },
            { id: "C", text: "3" },
            { id: "D", text: "4" }
          ],
          correctOptionId: "B",
          explanation: "Because",
          skill: "Test",
          difficulty: "MEDIUM"
        }
      ]
    });
    
    (groqService.callGroq as any).mockResolvedValueOnce(validJson);

    const result = await generateResumeAssessment('test-user-id', 'resume-123');

    expect(result.status).toBe('READY');
    expect(result.questions).toHaveLength(1);
    
    // correct answers and explanations remain absent from frontend-safe responses
    expect((result.questions[0] as any).correctOptionId).toBeUndefined();
    expect((result.questions[0] as any).explanation).toBeUndefined();
    
    // Backend-authoritative behavior unchanged (saved with all fields)
    expect(assessmentService.saveAssessmentQuestions).toHaveBeenCalledWith(
      'mock-assessment-id',
      expect.arrayContaining([
        expect.objectContaining({ correctOptionId: 'B', explanation: 'Because' })
      ])
    );
  });

  it('should retry on invalid MCQ output rejected by Zod (e.g. 3 options), fail after 2 attempts', async () => {
    // Return invalid schema (only 3 options instead of 4)
    const invalidJson = JSON.stringify({
      questions: [
        {
          question: "Test Q",
          options: [
            { id: "A", text: "1" },
            { id: "B", text: "2" },
            { id: "C", text: "3" }
          ],
          correctOptionId: "B",
          explanation: "Because",
          difficulty: "MEDIUM"
        }
      ]
    });

    (groqService.callGroq as any).mockResolvedValue(invalidJson);

    await expect(generateResumeAssessment('test-user-id', 'resume-123')).rejects.toThrow(/Failed to generate valid assessment after 2 attempts/);
    expect(groqService.callGroq).toHaveBeenCalledTimes(2);
    expect(assessmentService.markAssessmentFailed).toHaveBeenCalledWith('mock-assessment-id');
  });

  it('should handle empty or malformed provider response', async () => {
    (groqService.callGroq as any).mockResolvedValue("This is not JSON");
    
    await expect(generateResumeAssessment('test-user-id', 'resume-123')).rejects.toThrow(/Failed to generate valid assessment after 2 attempts/);
    expect(groqService.callGroq).toHaveBeenCalledTimes(2);
    expect(assessmentService.markAssessmentFailed).toHaveBeenCalledWith('mock-assessment-id');
  });

  it('should handle provider errors (e.g. rate limit error)', async () => {
    (groqService.callGroq as any).mockRejectedValue(new Error("429 Rate Limit Exceeded"));
    
    await expect(generateResumeAssessment('test-user-id', 'resume-123')).rejects.toThrow(/Failed to generate valid assessment after 2 attempts/);
    expect(groqService.callGroq).toHaveBeenCalledTimes(2);
  });
});
