import 'dotenv/config';
import { evaluateAnswerAndGenerateFollowUp } from '../followUpEngine';
import { FollowUpContext } from '../../../types/followUp';
import { ConversationMemory } from '../../../types/conversationMemory';
import crypto from 'crypto';

const createMockMemory = (history: any[] = []): ConversationMemory => ({
  id: crypto.randomUUID(),
  sessionId: 'test-session',
  projectsMentioned: [],
  skillsMentioned: [],
  achievements: [],
  leadershipExamples: [],
  conflictResolutionExamples: [],
  failuresDiscussed: [],
  successStories: [],
  weakAreas: [],
  strongAreas: [],
  currentDifficulty: 'Medium',
  currentConfidence: 50,
  confidenceHistory: [],
  questionHistory: [],
  answerHistory: [],
  followUpHistory: history,
  topicsCovered: ['React'],
  topicsRemaining: [],
  aiNotes: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

const runTests = async () => {
  console.log('--- Starting Follow Up Engine Tests ---');

  // Test 1: Generate valid follow-up
  let context: FollowUpContext = {
    memory: createMockMemory(),
    currentDifficulty: 'Medium',
    currentPersonality: 'Friendly',
    currentQuestion: 'Tell me about a time you optimized a system.',
    candidateAnswer: 'I implemented caching using Redis.',
    targetRole: 'Backend Engineer'
  };

  let result = await evaluateAnswerAndGenerateFollowUp(context);
  console.log('1. Follow-up Generated:', result.followUp.shouldGenerate);
  console.log('   - Question:', result.followUp.question);
  console.log('   - Score:', result.followUp.score);

  // Test 2: Max limits (Easy allows 1, Medium allows 2)
  context.currentDifficulty = 'Easy';
  context.memory = createMockMemory([
    {
      id: 'f1',
      questionText: 'Why Redis?',
      topic: 'Caching',
      type: 'Clarification',
      createdAt: new Date().toISOString()
    }
  ]);

  result = await evaluateAnswerAndGenerateFollowUp(context);
  console.log('2. Max limit enforced (Easy=1):', !result.followUp.shouldGenerate && result.followUp.reason === 'Max limit reached' ? '(Correct)' : '(Incorrect)');

  // Test 3: Fallback & Deduplication
  // We feed it an answer that triggers the fallback rule for 'React'
  context.currentDifficulty = 'Medium';
  context.candidateAnswer = 'I used React for the frontend.';
  // Let's pretend it already asked the exact fallback question to trigger duplication
  context.memory = createMockMemory([
    {
      id: 'f2',
      questionText: 'Why did you choose React over other frontend libraries?',
      topic: 'React',
      type: 'Technical Deep Dive',
      createdAt: new Date().toISOString()
    }
  ]);

  result = await evaluateAnswerAndGenerateFollowUp(context);
  // It should try to generate a new one via Gemini, but if we force a fallback it would block it.
  // We can't easily force a fallback without breaking Gemini, but we can see if Gemini avoids duplicating it.
  console.log('3. Duplicate prevention:', result.followUp.question !== 'Why did you choose React over other frontend libraries?' ? '(Correct)' : '(Duplicated!)');

  console.log('--- Tests Completed ---');
};

runTests().catch(console.error);
