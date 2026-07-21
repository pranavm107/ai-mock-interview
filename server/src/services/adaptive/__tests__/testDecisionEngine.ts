import { evaluateNextDecision } from '../decisionEngine';
import { DecisionContext } from '../../../types/decision';
import { ConversationMemory } from '../../../types/conversationMemory';
import crypto from 'crypto';

const createMockMemory = (): ConversationMemory => ({
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
  followUpHistory: [],
  topicsCovered: [],
  topicsRemaining: ['React', 'System Design', 'Behavioral'],
  aiNotes: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

const runTests = () => {
  console.log('--- Starting Decision Engine Tests ---');
  let memory = createMockMemory();
  
  // Test 1: Absolute limits (FINISH_INTERVIEW)
  let context: DecisionContext = {
    memory,
    currentQuestion: 'Q1',
    currentSection: 'Technical',
    currentDifficulty: 'Medium',
    currentPersonality: 'Friendly',
    answerScore: 80,
    remainingQuestions: 0,
    durationMs: 40 * 60 * 1000,
    remainingTimeMs: 0,
    followUpCount: 0,
    isFollowUpRequestedByEngine: false
  };
  
  let result = evaluateNextDecision(context);
  console.log('1. Absolute Limits (0 questions left):', result.decision === 'FINISH_INTERVIEW' ? '(Correct)' : result.decision);

  // Test 2: Follow-up Override
  context.remainingQuestions = 5;
  context.remainingTimeMs = 5 * 60 * 1000;
  context.isFollowUpRequestedByEngine = true;
  
  result = evaluateNextDecision(context);
  console.log('2. Follow-Up Requested:', result.decision === 'FOLLOW_UP' ? '(Correct)' : result.decision);

  // Test 3: Increase Difficulty (consistently high score)
  context.isFollowUpRequestedByEngine = false;
  context.memory.confidenceHistory = [
    { score: 95, timestamp: '1' },
    { score: 92, timestamp: '2' }
  ];
  result = evaluateNextDecision(context);
  console.log('3. Increase Difficulty (Score > 90):', result.decision === 'INCREASE_DIFFICULTY' ? '(Correct)' : result.decision);

  // Test 4: Section Transition
  context.memory.confidenceHistory = [
    { score: 70, timestamp: '1' },
    { score: 75, timestamp: '2' }
  ];
  context.currentSection = 'System Design'; // Simulated output from Flow Engine
  result = evaluateNextDecision(context);
  console.log('4. Transition to System Design:', result.decision === 'ASK_SYSTEM_DESIGN' ? '(Correct)' : result.decision);

  // Test 5: Exhaustion
  context.currentSection = 'Technical';
  context.memory.topicsCovered = ['Technical'];
  context.followUpCount = 3;
  result = evaluateNextDecision(context);
  console.log('5. Topic Exhaustion (>2 followups):', result.decision === 'CHANGE_TOPIC' ? '(Correct)' : result.decision);

  console.log('--- Tests Completed ---');
};

runTests();
