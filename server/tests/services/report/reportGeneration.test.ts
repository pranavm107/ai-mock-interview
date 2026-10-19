import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { evaluateQuestions } from '../../../src/services/report/questionEvaluationService';
import { generateRecommendations } from '../../../src/services/report/recommendationService';
import { generateReportSummaryAndVerdict } from '../../../src/services/report/aiSummaryService';
import { generateInterviewReport } from '../../../src/services/report/reportGenerationService';
import { setSharedGroqClient } from '../../../src/services/ai/providers/groqAdapter';
import { aiGateway } from '../../../src/services/ai/aiGateway';
import { InterviewQuestion, Interview } from '../../../src/types/interview';
import { InterviewSession, SessionAnswer } from '../../../src/types/interviewSession';
import * as reportStorageService from '../../../src/services/report/reportStorageService';

// Mock logger
vi.mock('../../../src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock Firebase Admin
vi.mock('../../../src/config/firebaseAdmin', () => ({
  db: {
    collection: vi.fn(() => ({
      add: vi.fn().mockResolvedValue({ id: 'mock-usage-id' }),
    })),
  },
}));

// Mock report storage and session storage
vi.mock('../../../src/services/report/reportStorageService', () => ({
  saveReport: vi.fn().mockImplementation(async (report) => report.id),
  getReportBySessionId: vi.fn().mockResolvedValue(null),
  getReport: vi.fn().mockResolvedValue(null),
  listReportsByUser: vi.fn().mockResolvedValue([]),
  deleteReport: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../../src/services/runtime/answerStorageService', () => ({
  getAnswersBySession: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../../src/services/runtime/sessionStorageService', () => ({
  updateInterviewSession: vi.fn().mockResolvedValue(undefined),
  getInterviewSessionById: vi.fn().mockResolvedValue(null),
}));

vi.mock('../../../src/services/runtime/eventLogger', () => ({
  getSessionTimeline: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../../src/services/speech/speechStorageService', () => ({
  getSessionSpeechSummary: vi.fn().mockResolvedValue(null),
}));

vi.mock('../../../src/services/adaptive/adaptiveStorageService', () => ({
  getAdaptiveState: vi.fn().mockResolvedValue(null),
}));

vi.mock('../../../src/services/achievementRuleEngine', () => ({
  achievementRuleEngine: {
    evaluateAchievementEvent: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('Report Generation & Central AI Gateway Migration', () => {
  let mockGroqCreate: ReturnType<typeof vi.fn>;

  const mockQuestions: InterviewQuestion[] = [
    {
      id: 'q_1',
      question: 'Explain JavaScript closures.',
      expectedTopics: ['Scope', 'Lexical environment', 'Memory'],
      skillsEvaluated: ['JavaScript', 'Core Programming'],
      followUps: [],
      difficulty: 'MEDIUM',
      type: 'TECHNICAL',
      section: 'ROLE',
    },
    {
      id: 'q_2',
      question: 'How do you design a high-throughput caching tier?',
      expectedTopics: ['Redis', 'Eviction policies', 'Cache invalidation'],
      skillsEvaluated: ['System Design', 'Caching'],
      followUps: [],
      difficulty: 'HARD',
      type: 'TECHNICAL',
      section: 'ROLE',
    },
    {
      id: 'q_3',
      question: 'Tell me about a time you handled a disagreement with an engineer.',
      expectedTopics: ['Communication', 'Conflict resolution', 'Empathy'],
      skillsEvaluated: ['Behavioral', 'Collaboration'],
      followUps: [],
      difficulty: 'EASY',
      type: 'BEHAVIORAL',
      section: 'ROLE',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GROQ_API_KEY = 'gsk_test_mock_key';

    mockGroqCreate = vi.fn();
    const mockGroqInstance = {
      chat: {
        completions: {
          create: mockGroqCreate,
        },
      },
    };
    setSharedGroqClient(mockGroqInstance as any);
  });

  afterEach(() => {
    setSharedGroqClient(null);
  });

  // 1 & 2. Successful batch evaluation returning valid evaluations mapped to questions
  it('1 & 2. should evaluate all answered questions in ONE single batch gateway call and map them correctly', async () => {
    const answers: SessionAnswer[] = [
      { questionId: 'q_1', answerText: 'A closure is a function bundled with its lexical environment.', durationMs: 45000 },
      { questionId: 'q_2', answerText: 'Use Redis cluster with LRU eviction and write-through cache.', durationMs: 120000 },
      { questionId: 'q_3', answerText: 'I scheduled a 1:1, listened to their perspective, and agreed on a benchmark.', durationMs: 60000 },
    ];

    mockGroqCreate.mockResolvedValueOnce({
      choices: [{
        message: {
          content: JSON.stringify([
            {
              questionId: 'q_1',
              correctness: 90,
              completeness: 85,
              technicalDepth: 80,
              clarity: 90,
              confidence: 85,
              feedback: 'Great grasp of lexical scope.',
              goodPoints: ['Precise definition'],
              areasForImprovement: ['Mention garbage collection'],
            },
            {
              questionId: 'q_2',
              correctness: 85,
              completeness: 80,
              technicalDepth: 85,
              clarity: 80,
              confidence: 80,
              feedback: 'Good architecture.',
              goodPoints: ['Mentioned LRU'],
              areasForImprovement: ['Discuss cache stampede'],
            },
            {
              questionId: 'q_3',
              correctness: 95,
              completeness: 90,
              technicalDepth: 75,
              clarity: 95,
              confidence: 90,
              feedback: 'Very mature approach.',
              goodPoints: ['High empathy'],
              areasForImprovement: ['Follow up afterwards'],
            },
          ]),
        },
      }],
      model: 'openai/gpt-oss-120b',
      usage: { prompt_tokens: 300, completion_tokens: 250, total_tokens: 550 },
    });

    const evaluations = await evaluateQuestions(mockQuestions, answers, 'user_test_123');

    // CRITICAL REQUIREMENT: Assert exactly 1 gateway call instead of 3 sequential calls
    expect(mockGroqCreate).toHaveBeenCalledTimes(1);

    expect(evaluations).toHaveLength(3);
    expect(evaluations[0].questionId).toBe('q_1');
    expect(evaluations[0].correctness).toBe(90);
    expect(evaluations[1].questionId).toBe('q_2');
    expect(evaluations[1].technicalDepth).toBe(85);
    expect(evaluations[2].questionId).toBe('q_3');
    expect(evaluations[2].clarity).toBe(95);
  });

  // 3. Empty or partially answered interview sessions
  it('3. should handle skipped or empty answers deterministically without calling AI for them', async () => {
    const answers: SessionAnswer[] = [
      { questionId: 'q_1', answerText: 'Closures retain access to outer variables.', durationMs: 30000 },
      { questionId: 'q_2', answerText: '', durationMs: 0 }, // skipped
      // q_3 missing completely from answers
    ];

    mockGroqCreate.mockResolvedValueOnce({
      choices: [{
        message: {
          content: JSON.stringify([
            {
              questionId: 'q_1',
              correctness: 80,
              completeness: 75,
              technicalDepth: 70,
              clarity: 80,
              confidence: 80,
              feedback: 'Solid summary.',
              goodPoints: ['Clear explanation'],
              areasForImprovement: ['Expand on use cases'],
            },
          ]),
        },
      }],
      model: 'openai/gpt-oss-120b',
      usage: { prompt_tokens: 100, completion_tokens: 80, total_tokens: 180 },
    });

    const evaluations = await evaluateQuestions(mockQuestions, answers, 'user_partial');

    // Only 1 answered question was sent to AI in 1 call
    expect(mockGroqCreate).toHaveBeenCalledTimes(1);
    expect(evaluations).toHaveLength(3);

    // Answered question
    expect(evaluations[0].questionId).toBe('q_1');
    expect(evaluations[0].correctness).toBe(80);

    // Skipped questions get 0 scores
    expect(evaluations[1].questionId).toBe('q_2');
    expect(evaluations[1].correctness).toBe(0);
    expect(evaluations[1].feedback).toContain('skipped');

    expect(evaluations[2].questionId).toBe('q_3');
    expect(evaluations[2].correctness).toBe(0);
    expect(evaluations[2].feedback).toContain('skipped');
  });

  it('3b. should make 0 AI calls if all questions were skipped', async () => {
    const answers: SessionAnswer[] = [
      { questionId: 'q_1', answerText: '', durationMs: 0 },
      { questionId: 'q_2', answerText: '', durationMs: 0 },
      { questionId: 'q_3', answerText: '', durationMs: 0 },
    ];

    const evaluations = await evaluateQuestions(mockQuestions, answers, 'user_skipped_all');

    expect(mockGroqCreate).not.toHaveBeenCalled();
    expect(evaluations).toHaveLength(3);
    expect(evaluations.every(e => e.correctness === 0)).toBe(true);
  });

  // 4. Missing, duplicate, or unexpected question identifiers
  it('4. should handle mismatched or missing question IDs from model by falling back to index order', async () => {
    const answers: SessionAnswer[] = [
      { questionId: 'q_1', answerText: 'Closures are functions.', durationMs: 20000 },
      { questionId: 'q_2', answerText: 'Redis with LRU cache.', durationMs: 30000 },
    ];

    // Model returned wrong IDs (e.g. "unknown_id_1", "unknown_id_2")
    mockGroqCreate.mockResolvedValueOnce({
      choices: [{
        message: {
          content: JSON.stringify([
            { questionId: 'unknown_id_1', correctness: 77, completeness: 77, feedback: 'OK' },
            { questionId: 'unknown_id_2', correctness: 88, completeness: 88, feedback: 'Good' },
          ]),
        },
      }],
      model: 'openai/gpt-oss-120b',
      usage: null,
    });

    const evaluations = await evaluateQuestions([mockQuestions[0], mockQuestions[1]], answers, 'user_mismatch');

    expect(evaluations).toHaveLength(2);
    expect(evaluations[0].questionId).toBe('q_1');
    expect(evaluations[0].correctness).toBe(77);
    expect(evaluations[1].questionId).toBe('q_2');
    expect(evaluations[1].correctness).toBe(88);
  });

  // 5. Malformed JSON and schema-invalid batch responses
  it('5 & 8. should recover with deterministic fallback if model returns invalid JSON after retries', async () => {
    const answers: SessionAnswer[] = [
      { questionId: 'q_1', answerText: 'Answer text', durationMs: 15000 },
    ];

    // Provider repeatedly returns malformed non-JSON
    mockGroqCreate.mockResolvedValue({
      choices: [{ message: { content: 'Not JSON at all' } }],
      model: 'openai/gpt-oss-120b',
      usage: null,
    });

    const evaluations = await evaluateQuestions([mockQuestions[0]], answers, 'user_err');

    expect(evaluations).toHaveLength(1);
    expect(evaluations[0].questionId).toBe('q_1');
    expect(evaluations[0].correctness).toBe(50);
    expect(evaluations[0].feedback).toBe('AI evaluation failed for this question.');
  });

  // 6. Out-of-range or invalid scores
  it('6. should clamp out-of-range scores and prevent NaN values from corrupting reports', async () => {
    const answers: SessionAnswer[] = [
      { questionId: 'q_1', answerText: 'Answer with out of range scores', durationMs: 15000 },
    ];

    mockGroqCreate.mockResolvedValueOnce({
      choices: [{
        message: {
          content: JSON.stringify([
            {
              questionId: 'q_1',
              correctness: 9999, // out of range
              completeness: -50, // out of range
              technicalDepth: 'not_a_number', // NaN
              clarity: 85,
              confidence: null,
              feedback: 'Checked',
            },
          ]),
        },
      }],
      model: 'openai/gpt-oss-120b',
      usage: null,
    });

    const evaluations = await evaluateQuestions([mockQuestions[0]], answers, 'user_clamp');

    expect(evaluations[0].correctness).toBe(100); // clamped to 100
    expect(evaluations[0].completeness).toBe(0); // clamped to 0
    expect(evaluations[0].technicalDepth).toBe(50); // fallback default
    expect(evaluations[0].clarity).toBe(85);
    expect(evaluations[0].confidence).toBe(50); // fallback default
  });

  // 9. Recommendation generation through the gateway
  it('9. should generate recommendations via gateway and apply proper schema validation', async () => {
    mockGroqCreate.mockResolvedValueOnce({
      choices: [{
        message: {
          content: JSON.stringify({
            skillsAnalysis: [
              { skillName: 'React', proficiencyLevel: 'Advanced', evidence: 'Demonstrated hooks mastery' },
            ],
            recommendations: [
              { category: 'Technical', priority: 'High', suggestion: 'Deepen knowledge in system design' },
            ],
            improvementPlan: {
              shortTerm: ['Read Designing Data-Intensive Applications'],
              longTerm: ['Build a distributed system prototype'],
              recommendedPracticeTopics: ['Cache invalidation'],
            },
          }),
        },
      }],
      model: 'openai/gpt-oss-120b',
      usage: { prompt_tokens: 150, completion_tokens: 100, total_tokens: 250 },
    });

    const result = await generateRecommendations(
      ['Strong React skills'],
      ['Needs distributed systems practice'],
      'Senior Frontend Engineer',
      'Senior',
      'user_rec'
    );

    expect(result.skillsAnalysis).toHaveLength(1);
    expect(result.skillsAnalysis[0].skillName).toBe('React');
    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0].priority).toBe('High');
    expect(result.improvementPlan.shortTerm).toHaveLength(1);
  });

  it('9b. should return deterministic fallback recommendations if provider fails', async () => {
    mockGroqCreate.mockRejectedValueOnce(new Error('500 Server Error'));

    const result = await generateRecommendations(
      ['Good problem solving'],
      ['Needs testing practice'],
      'Senior Engineer',
      'Senior',
      'user_fail'
    );

    expect(result.recommendations[0].suggestion).toContain('Continue practicing your interview skills.');
    expect(result.improvementPlan.shortTerm[0]).toContain('Review the questions');
  });

  // 10 & 11. Summary generation and deterministic verdict fallback
  it('10 & 11. should generate summary and protect against invalid verdict with deterministic fallback', async () => {
    // Return invalid verdict string from model
    mockGroqCreate.mockResolvedValueOnce({
      choices: [{
        message: {
          content: JSON.stringify({
            summary: 'You showed solid technical competence throughout.',
            hiringRecommendation: {
              verdict: 'UNKNOWN_VERDICT', // invalid
              rating: 10, // out of range
              reasons: ['Strong problem solving'],
            },
          }),
        },
      }],
      model: 'openai/gpt-oss-120b',
      usage: { prompt_tokens: 120, completion_tokens: 80, total_tokens: 200 },
    });

    const result = await generateReportSummaryAndVerdict(
      85, // overallScore >= 80 -> deterministic 'Recommended'
      85,
      80,
      80,
      85,
      ['Good communication'],
      ['Minor edge cases missed'],
      'Staff Engineer',
      'Senior',
      'user_summary'
    );

    expect(result.summary).toBe('You showed solid technical competence throughout.');
    // Invalid verdict was safely replaced by deterministic 'Recommended'
    expect(result.hiringRecommendation.verdict).toBe('Recommended');
    expect(result.hiringRecommendation.rating).toBe(4); // clamped 85/20 = 4
  });

  // 12 & 16. Full report aggregation and operation count reduction assertion
  it('12 & 16. should generate and assemble a complete report in 3 gateway calls total (batch eval + recs + summary) instead of N+2', async () => {
    const mockSession: InterviewSession = {
      id: 'session_full_report_123',
      userId: 'user_live_test',
      interviewId: 'interview_abc',
      state: 'COMPLETED',
      startedAt: '2026-10-19T00:00:00Z',
      endedAt: '2026-10-19T00:30:00Z',
      currentQuestionIndex: 2,
      progress: {
        totalQuestions: 3,
        answeredCount: 3,
        skippedCount: 0,
        currentStep: 3,
      },
      metrics: {
        totalDurationMs: 180000,
        averageAnswerDurationMs: 60000,
        questionsAnswered: 3,
        questionsSkipped: 0,
      },
      answers: [],
    };

    const mockInterview: Interview = {
      id: 'interview_abc',
      userId: 'user_live_test',
      role: 'Fullstack Engineer',
      industry: 'Software',
      difficulty: 'HARD',
      status: 'active',
      createdAt: '2026-10-19T00:00:00Z',
      questions: mockQuestions,
      settings: {
        candidateExperienceLevel: 'Senior',
        interviewType: 'TECHNICAL',
        questionCount: 3,
        atsScore: 85,
      },
    };

    // Mock answers stored in database
    const { getAnswersBySession } = await import('../../../src/services/runtime/answerStorageService');
    (getAnswersBySession as any).mockResolvedValueOnce([
      { questionId: 'q_1', answerText: 'JS closures answer', durationMs: 60000 },
      { questionId: 'q_2', answerText: 'Redis caching tier answer', durationMs: 90000 },
      { questionId: 'q_3', answerText: 'Disagreement resolution answer', durationMs: 70000 },
    ]);

    // 1. Batch question evaluation response
    mockGroqCreate.mockResolvedValueOnce({
      choices: [{
        message: {
          content: JSON.stringify([
            { questionId: 'q_1', correctness: 85, completeness: 80, technicalDepth: 80, clarity: 85, confidence: 80, feedback: 'Good', goodPoints: ['Clarity'], areasForImprovement: ['Depth'] },
            { questionId: 'q_2', correctness: 90, completeness: 85, technicalDepth: 90, clarity: 80, confidence: 85, feedback: 'Strong', goodPoints: ['Architecture'], areasForImprovement: ['Costs'] },
            { questionId: 'q_3', correctness: 80, completeness: 80, technicalDepth: 75, clarity: 90, confidence: 85, feedback: 'Mature', goodPoints: ['Empathy'], areasForImprovement: ['Speed'] },
          ]),
        },
      }],
      model: 'openai/gpt-oss-120b',
      usage: { prompt_tokens: 250, completion_tokens: 200, total_tokens: 450 },
    });

    // 2. Recommendations response
    mockGroqCreate.mockResolvedValueOnce({
      choices: [{
        message: {
          content: JSON.stringify({
            skillsAnalysis: [{ skillName: 'System Design', proficiencyLevel: 'Advanced', evidence: 'Caching design' }],
            recommendations: [{ category: 'Technical', priority: 'High', suggestion: 'Deepen DB indexing knowledge' }],
            improvementPlan: { shortTerm: ['Read indexes doc'], longTerm: ['Prototype'], recommendedPracticeTopics: ['Databases'] },
          }),
        },
      }],
      model: 'openai/gpt-oss-120b',
      usage: { prompt_tokens: 150, completion_tokens: 100, total_tokens: 250 },
    });

    // 3. Summary response
    mockGroqCreate.mockResolvedValueOnce({
      choices: [{
        message: {
          content: JSON.stringify({
            summary: 'The candidate demonstrated strong senior engineering capabilities.',
            hiringRecommendation: { verdict: 'Recommended', rating: 4, reasons: ['Strong architecture skills'] },
          }),
        },
      }],
      model: 'openai/gpt-oss-120b',
      usage: { prompt_tokens: 120, completion_tokens: 60, total_tokens: 180 },
    });

    const report = await generateInterviewReport(mockSession, mockInterview);

    // PROVE REDUCTION: Exactly 3 gateway operations for the entire report (1 batch eval + 1 recs + 1 summary)
    // Previously, 3 questions = 3 eval calls + 1 recs + 1 summary = 5 separate calls
    expect(mockGroqCreate).toHaveBeenCalledTimes(3);

    // Verify persisted report structure
    expect(report.sessionId).toBe(mockSession.id);
    expect(report.userId).toBe(mockSession.userId);
    expect(report.overallEvaluation.overallScore).toBeGreaterThan(0);
    expect(report.questionEvaluations).toHaveLength(3);
    expect(report.hiringRecommendation?.verdict).toBe('Recommended');
    expect(report.atsReadiness).toBeDefined();
    expect(report.atsReadiness?.resumeScore).toBe(85);

    // Verify saveReport called
    expect(reportStorageService.saveReport).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: mockSession.id,
        userId: mockSession.userId,
      })
    );
  });

  // 13. Report generation with provider failures
  it('13. should complete report generation safely with fallbacks even if provider fails on all tasks', async () => {
    const mockSession: InterviewSession = {
      id: 'session_fail_safe',
      userId: 'user_fallback',
      interviewId: 'interview_abc',
      state: 'COMPLETED',
      startedAt: '2026-10-19T00:00:00Z',
      endedAt: '2026-10-19T00:20:00Z',
      currentQuestionIndex: 1,
      progress: { totalQuestions: 1, answeredCount: 1, skippedCount: 0, currentStep: 1 },
      metrics: { totalDurationMs: 60000, averageAnswerDurationMs: 60000, questionsAnswered: 1, questionsSkipped: 0 },
      answers: [],
    };

    const mockInterview: Interview = {
      id: 'interview_abc',
      userId: 'user_fallback',
      role: 'Backend Engineer',
      industry: 'Software',
      difficulty: 'MEDIUM',
      status: 'active',
      createdAt: '2026-10-19T00:00:00Z',
      questions: [mockQuestions[0]],
      settings: {
        candidateExperienceLevel: 'Mid',
        interviewType: 'TECHNICAL',
        questionCount: 1,
      },
    };

    const { getAnswersBySession } = await import('../../../src/services/runtime/answerStorageService');
    (getAnswersBySession as any).mockResolvedValueOnce([
      { questionId: 'q_1', answerText: 'Some answer', durationMs: 40000 },
    ]);

    // Provider rejects all calls (e.g. rate limit / network error)
    const providerErr: any = new Error('500 Server Error');
    providerErr.status = 500;
    mockGroqCreate.mockRejectedValue(providerErr);

    const report = await generateInterviewReport(mockSession, mockInterview);

    // Report is generated and saved using fallbacks without throwing out
    expect(report).toBeDefined();
    expect(report.questionEvaluations[0].correctness).toBe(50);
    expect(Array.isArray(report.recommendations)).toBe(true);
    expect(report.hiringRecommendation?.reasons[0]).toContain('Fallback verdict');
    expect(reportStorageService.saveReport).toHaveBeenCalled();
  });
});
