import { getGeminiModel, generateText } from '../ai/geminiClient';
import { 
  FollowUpContext, 
  FollowUpEvaluation, 
  FollowUpQuestion,
  FollowUpCategory
} from '../../types/followUp';
import { generatePersonalityPrompt } from './interviewerPersonality';
import { mapLevelToInstruction } from './adaptiveDifficultyService';

const getMaxFollowUps = (difficulty: string): number => {
  switch (difficulty) {
    case 'Beginner': return 0;
    case 'Easy': return 1;
    case 'Medium': return 2;
    case 'Advanced': return 3;
    case 'Senior': return 4;
    case 'Expert': return 4;
    default: return 2;
  }
};

const getRecentFollowUpCount = (context: FollowUpContext): number => {
  // Simple heuristic: count follow-ups since the last main question
  const followUpQueue = context.memory.followUpHistory || [];
  // For robustness without knowing the exact boundary, we count follow-ups in the last few minutes, 
  // or we can count how many follow-ups have the same "originalQuestionId" if we store that.
  // We'll just count how many follow-ups were generated in the last 2 minutes as a proxy, 
  // or rely on adaptiveInterviewService to not call this if limit reached.
  // Actually, adaptiveInterviewService manages the questions. But we can check here.
  const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  return followUpQueue.filter(f => f.createdAt > twoMinsAgo).length;
};

const buildPrompt = (context: FollowUpContext): string => {
  const { memory, currentQuestion, candidateAnswer, currentDifficulty, currentPersonality, targetRole = 'Software Engineer' } = context;
  
  const personalityPrompt = generatePersonalityPrompt(currentPersonality);
  const difficultyInstruction = mapLevelToInstruction(currentDifficulty);
  const summary = memory.answerHistory.length > 0 
    ? memory.answerHistory.map((h, i) => `Q${i+1}: ${h.summary}`).join('\n')
    : 'None';
  const previousFollowUps = memory.followUpHistory.map(f => f.questionText).join('\n') || 'None';

  return `
You are an expert AI Interviewer for a ${targetRole} position.

## Personality Override
${personalityPrompt}

## Difficulty Context
Level: ${currentDifficulty}
Instructions: ${difficultyInstruction}

## Interview Context
Topics Covered: ${memory.topicsCovered.join(', ') || 'None'}
Identified Weaknesses: ${memory.weakAreas.map(w => w.topic).join(', ') || 'None'}
Identified Strengths: ${memory.strongAreas.map(s => s.topic).join(', ') || 'None'}
Conversation Summary:
${summary}

Previous Follow-ups asked in this session (DO NOT REPEAT THESE):
${previousFollowUps}

## Current Turn
Question: "${currentQuestion}"
Candidate Answer: "${candidateAnswer}"

## Your Task
1. Score the answer (0-100).
2. Determine if a follow-up is necessary.
3. If necessary, generate an intelligent, context-aware follow-up that drills into incomplete explanations, technical nuances, or inconsistencies.
4. Return ONLY a valid JSON object. Do not include markdown blocks like \`\`\`json.

## Expected JSON Schema
{
  "shouldGenerate": boolean,
  "category": "Clarification" | "Technical Deep Dive" | "Architecture" | "Optimization" | "Tradeoffs" | "Debugging" | "Security" | "Scalability" | "Behavioral" | "Leadership" | "Conflict Resolution" | "Decision Making" | "Communication" | "Coding" | "System Design" | "Resume Validation" | "Project Exploration",
  "reason": string,
  "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "question": string | null,
  "estimatedDifficulty": "${currentDifficulty}",
  "score": number
}

If the answer fully satisfies the question and requires no follow-up, set "shouldGenerate": false and "question": null.
`;
};

const validateDuplicate = (question: string, memory: FollowUpContext['memory']): boolean => {
  if (!question) return false;
  const history = memory.followUpHistory || [];
  const normalizedNew = question.toLowerCase().trim();
  // Simple substring check for duplication
  for (const item of history) {
    const normalizedOld = item.questionText.toLowerCase().trim();
    if (normalizedOld === normalizedNew || normalizedOld.includes(normalizedNew) || normalizedNew.includes(normalizedOld)) {
      return true;
    }
  }
  return false;
};

const generateFallback = (answer: string): FollowUpQuestion => {
  const lowerAns = answer.toLowerCase();
  let question = 'Can you elaborate on your thought process?';
  let category: FollowUpCategory = 'Clarification';

  if (lowerAns.includes('react')) { question = 'Why did you choose React over other frontend libraries?'; category = 'Technical Deep Dive'; }
  else if (lowerAns.includes('node')) { question = 'How does the Node.js event loop handle asynchronous tasks?'; category = 'Architecture'; }
  else if (lowerAns.includes('docker') || lowerAns.includes('container')) { question = 'What are the main benefits you saw from containerization?'; category = 'Architecture'; }
  else if (lowerAns.includes('kubernetes') || lowerAns.includes('k8s')) { question = 'What scaling strategy did you configure in Kubernetes?'; category = 'Scalability'; }
  else if (lowerAns.includes('auth') || lowerAns.includes('jwt')) { question = 'How did you handle token expiration and secure storage?'; category = 'Security'; }
  else if (lowerAns.includes('database') || lowerAns.includes('sql') || lowerAns.includes('mongo')) { question = 'Why did you select that specific database technology?'; category = 'Architecture'; }
  else if (lowerAns.includes('ai') || lowerAns.includes('model') || lowerAns.includes('machine learning')) { question = 'How did you approach model selection and evaluation?'; category = 'Technical Deep Dive'; }

  return {
    shouldGenerate: true,
    category,
    reason: 'Fallback generated due to validation or generation failure.',
    priority: 'MEDIUM',
    question,
    estimatedDifficulty: 'Medium',
    score: 50
  };
};

export const evaluateAnswerAndGenerateFollowUp = async (context: FollowUpContext): Promise<FollowUpEvaluation> => {
  const startTime = Date.now();
  
  // 1. Check max limits
  const maxFollowUps = getMaxFollowUps(context.currentDifficulty);
  const currentCount = getRecentFollowUpCount(context);
  
  if (currentCount >= maxFollowUps) {
    return {
      followUp: { shouldGenerate: false, category: null, reason: 'Max limit reached', priority: null, question: null, estimatedDifficulty: null, score: 50 },
      generationTimeMs: Date.now() - startTime,
      isFallback: false,
      validationFailures: 0
    };
  }

  const prompt = buildPrompt(context);
  let validationFailures = 0;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      let text = await generateText(prompt);
      text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      
      const parsed = JSON.parse(text) as FollowUpQuestion;
      
      // Basic validation
      if (typeof parsed.score !== 'number') throw new Error('Missing or invalid score');
      
      if (parsed.shouldGenerate && parsed.question) {
        if (validateDuplicate(parsed.question, context.memory)) {
          throw new Error('Duplicate follow-up detected');
        }
      }

      return {
        followUp: parsed,
        generationTimeMs: Date.now() - startTime,
        isFallback: false,
        validationFailures
      };
    } catch (err) {
      console.warn(`Follow-up generation attempt ${attempt} failed:`, err);
      validationFailures++;
    }
  }

  // Fallback if failed twice
  const fallback = generateFallback(context.candidateAnswer);
  // Ensure fallback isn't a duplicate either
  if (validateDuplicate(fallback.question!, context.memory)) {
    fallback.shouldGenerate = false;
    fallback.question = null;
    fallback.reason = 'Fallback was a duplicate.';
  }

  return {
    followUp: fallback,
    generationTimeMs: Date.now() - startTime,
    isFallback: true,
    validationFailures
  };
};
