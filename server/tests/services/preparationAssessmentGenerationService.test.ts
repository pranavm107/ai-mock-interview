import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generatePreparationAssessment } from '../../src/services/preparationAssessmentGenerationService';
import { callGroq } from '../../src/services/groqService';
import * as assessmentService from '../../src/services/assessmentService';

vi.mock('../../src/services/groqService');
vi.mock('../../src/services/assessmentService');
vi.mock('../../src/config/firebaseAdmin', () => ({
  db: {
    collection: vi.fn().mockReturnValue({
      doc: vi.fn().mockReturnValue({
        id: 'mock-doc-id'
      })
    })
  }
}));

describe('preparationAssessmentGenerationService - generatePreparationAssessment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(assessmentService.createAssessment).mockResolvedValue(undefined);
    vi.mocked(assessmentService.saveAssessmentQuestions).mockResolvedValue(undefined);
    vi.mocked(assessmentService.updateAssessmentStatus).mockResolvedValue(undefined);
    vi.mocked(assessmentService.markAssessmentFailed).mockResolvedValue(undefined);
  });

  it('generates a valid assessment successfully', async () => {
    const mockGroqResponse = {
      questions: [
        {
          question: "What is 2+2?",
          options: [
            { id: "A", text: "3" },
            { id: "B", text: "4" },
            { id: "C", text: "5" },
            { id: "D", text: "6" }
          ],
          correctOptionId: "B",
          explanation: "Math",
          difficulty: "EASY"
        }
      ]
    };

    vi.mocked(callGroq).mockResolvedValue(JSON.stringify(mockGroqResponse));

    const result = await generatePreparationAssessment('user-1', 'aptitude', 'Math', 'EASY', 1, 'PRACTICE');

    expect(result.id).toBe('mock-doc-id');
    expect(result.status).toBe('READY');
    expect(result.questions).toHaveLength(1);
    
    // Check that answers are stripped in the response payload
    const q1 = result.questions[0] as any;
    expect(q1.correctOptionId).toBeUndefined();
    expect(q1.explanation).toBeUndefined();

    expect(assessmentService.createAssessment).toHaveBeenCalled();
    expect(assessmentService.saveAssessmentQuestions).toHaveBeenCalled();
    expect(assessmentService.updateAssessmentStatus).toHaveBeenCalledWith('mock-doc-id', 'READY');
  });

  it('retries and fails if schema is consistently invalid', async () => {
    vi.mocked(callGroq).mockResolvedValue('{ "invalid": "json" }');

    await expect(generatePreparationAssessment('user-1', 'technical-mcqs', 'React', 'MEDIUM', 1, 'TIMED'))
      .rejects.toThrow('Assessment generation failed');

    expect(callGroq).toHaveBeenCalledTimes(2);
    expect(assessmentService.markAssessmentFailed).toHaveBeenCalledWith('mock-doc-id');
  });

  it('rejects correctOptionId that does not match any option', async () => {
    const mockGroqResponse = {
      questions: [
        {
          question: "What is 2+2?",
          options: [
            { id: "A", text: "3" },
            { id: "B", text: "4" },
            { id: "C", text: "5" },
            { id: "D", text: "6" }
          ],
          correctOptionId: "Z", // Invalid
          explanation: "Math",
          difficulty: "EASY"
        }
      ]
    };

    vi.mocked(callGroq).mockResolvedValue(JSON.stringify(mockGroqResponse));

    await expect(generatePreparationAssessment('user-1', 'aptitude', 'Math', 'EASY', 1, 'PRACTICE'))
      .rejects.toThrow('Assessment generation failed');
      
    expect(assessmentService.markAssessmentFailed).toHaveBeenCalled();
  });
});
