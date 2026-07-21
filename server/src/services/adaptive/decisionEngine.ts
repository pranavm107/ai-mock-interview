import { DecisionContext, DecisionResult, DecisionType, DecisionConfidence } from '../../types/decision';

export const evaluateNextDecision = (context: DecisionContext): DecisionResult => {
  const { 
    memory, 
    answerScore, 
    remainingQuestions, 
    remainingTimeMs,
    currentSection,
    isFollowUpRequestedByEngine,
    followUpCount
  } = context;

  const evidence: any[] = [];
  
  // Rule 0: Absolute limits
  if (remainingQuestions <= 0 || (remainingTimeMs !== undefined && remainingTimeMs <= 0)) {
    return {
      decision: 'FINISH_INTERVIEW',
      decisionConfidence: 'ABSOLUTE',
      reason: 'No remaining questions or time expired.',
      evidence: [
        { metric: 'Remaining Questions', value: remainingQuestions },
        { metric: 'Remaining Time (ms)', value: remainingTimeMs || 0 }
      ]
    };
  }

  // Rule 1: Follow-up Engine Override
  if (isFollowUpRequestedByEngine) {
    // Limits are assumed to be validated by the Follow-Up Engine.
    return {
      decision: 'FOLLOW_UP',
      decisionConfidence: 'HIGH',
      reason: 'Follow-up engine detected incomplete answer or interesting point.',
      evidence: [{ metric: 'Answer Score', value: answerScore }]
    };
  }

  // Rule 2: Difficulty Adjustments (Consistently High/Low)
  const recentScores = memory.confidenceHistory.slice(-3).map(c => c.score);
  if (recentScores.length >= 2) {
    const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    evidence.push({ metric: 'Recent Average Score', value: avgScore });

    if (avgScore >= 90 && context.currentDifficulty !== 'Expert') {
      return {
        decision: 'INCREASE_DIFFICULTY',
        decisionConfidence: 'HIGH',
        reason: 'Candidate consistently scores very high. Increasing difficulty.',
        evidence,
        alternativeDecision: 'NEXT_QUESTION'
      };
    }
    
    if (avgScore <= 40 && context.currentDifficulty !== 'Beginner') {
      return {
        decision: 'DECREASE_DIFFICULTY',
        decisionConfidence: 'HIGH',
        reason: 'Candidate is struggling. Decreasing difficulty to maintain morale.',
        evidence,
        alternativeDecision: 'CHANGE_TOPIC'
      };
    }
  }

  // Rule 3: Topic & Section Transitions
  // Depending on what currentSection is, we might transition
  // e.g. "System Design" -> ASK_SYSTEM_DESIGN
  if (currentSection === 'System Design' && !memory.topicsCovered.includes('System Design')) {
    return {
      decision: 'ASK_SYSTEM_DESIGN',
      decisionConfidence: 'MEDIUM',
      reason: 'Transitioning to System Design phase.',
      evidence: [{ metric: 'Current Section', value: currentSection }]
    };
  }
  if (currentSection === 'Behavioral' && !memory.topicsCovered.includes('Behavioral')) {
    return {
      decision: 'ASK_BEHAVIORAL',
      decisionConfidence: 'MEDIUM',
      reason: 'Transitioning to Behavioral phase.',
      evidence: [{ metric: 'Current Section', value: currentSection }]
    };
  }
  if (currentSection === 'HR' && !memory.topicsCovered.includes('HR')) {
    return {
      decision: 'ASK_HR',
      decisionConfidence: 'MEDIUM',
      reason: 'Transitioning to HR/Culture Fit phase.',
      evidence: [{ metric: 'Current Section', value: currentSection }]
    };
  }

  // Rule 4: Weak Topic Recovery
  // If there's a weak topic we haven't revisited, and we're just rolling a NEXT_QUESTION
  // we might want to revisit it if they are doing well now.
  if (memory.weakAreas.length > 0 && answerScore >= 75) {
    // Find a weak area that hasn't been recently mentioned
    const area = memory.weakAreas[0]; // just picking the first for now
    // Simplistic check to avoid looping
    if (!memory.topicsCovered.includes(`Revisited_${area.topic}`)) {
      return {
        decision: 'REVISIT_WEAK_TOPIC',
        decisionConfidence: 'MEDIUM',
        reason: `Candidate is recovering confidence. Good time to revisit weak topic: ${area.topic}`,
        evidence: [
          { metric: 'Current Score', value: answerScore },
          { metric: 'Weak Topic', value: area.topic }
        ],
        alternativeDecision: 'NEXT_QUESTION'
      };
    }
  }

  // Rule 5: Project Deep Dives
  if (memory.projectsMentioned.length > 0) {
    const unExplored = memory.projectsMentioned.find(p => p.mentionCount === 1 && !memory.topicsCovered.includes(`DeepDive_${p.name}`));
    if (unExplored && answerScore >= 80) {
      return {
        decision: 'ASK_PROJECT_DEEP_DIVE',
        decisionConfidence: 'MEDIUM',
        reason: `Candidate mentioned project ${unExplored.name}. Doing a deep dive.`,
        evidence: [{ metric: 'Project Mention Count', value: unExplored.mentionCount }],
        alternativeDecision: 'NEXT_QUESTION'
      };
    }
  }

  // Rule 6: Exhaustion / Topic Change
  // If they have been asked 3 questions on the exact same topic without a section change, switch.
  // We'll approximate this using follow up count or question history if we had topic tagging per question.
  if (followUpCount > 2) {
    return {
      decision: 'CHANGE_TOPIC',
      decisionConfidence: 'HIGH',
      reason: 'Topic exhausted through follow-ups. Moving to a new topic.',
      evidence: [{ metric: 'Follow-up Count', value: followUpCount }]
    };
  }

  return {
    decision: 'NEXT_QUESTION',
    decisionConfidence: 'LOW', // Default action has low confidence because it's just the fallback
    reason: 'Proceeding with standard blueprint progression.',
    evidence: []
  };
};
