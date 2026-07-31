import { executeLiveEvaluation } from '../liveEvaluationEngine';
import { ConversationMemory } from '../../../types/conversationMemory';
import { InterviewProgress as DecisionProgress } from '../../../types/decision';
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
  currentConfidence: 80,
  confidenceHistory: [{ score: 80, timestamp: new Date().toISOString() }],
  questionHistory: ['q1'],
  answerHistory: [],
  followUpHistory: [],
  topicsCovered: ['React'],
  topicsRemaining: ['Node.js'],
  aiNotes: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

const runTests = async () => {
  console.log('--- Starting Live Evaluation Engine Tests ---');
  
  const memory = createMockMemory();
  const progress: DecisionProgress = {
    currentSection: 'Technical',
    estimatedTimeRemainingMs: 30 * 60 * 1000,
    topicsCovered: ['React'],
    topicsRemaining: ['Node.js'],
    isNearingEnd: false
  };

  const start = Date.now();
  
  const result = await executeLiveEvaluation({
    sessionId: 'test-session',
    questionId: 'q2',
    questionText: 'How does React handle state?',
    answerText: 'React uses useState and re-renders components when state changes.',
    baseScore: 85,
    extractedSkills: ['React', 'State Management'],
    extractedWeaknesses: [],
    memory,
    difficulty: 'Medium',
    decision: 'NEXT_QUESTION',
    interviewProgress: progress
  });

  const duration = Date.now() - start;

  console.log(`Evaluation ran in ${duration}ms (Expected <150ms)`);
  console.log('Overall Score:', result.overallScore);
  console.log('Skill Matrix:', result.skillMatrix.map(s => `${s.name}: ${s.score}`));
  console.log('Performance Trend:', result.performanceTrend);
  console.log('Strengths Added:', result.strengths.length);
  
  if (duration < 150) {
    console.log('Performance Constraint Met: YES');
  } else {
    console.log('Performance Constraint Met: NO');
  }

  console.log('--- Tests Completed ---');
};

runTests();
