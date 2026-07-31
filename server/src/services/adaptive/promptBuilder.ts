import { DifficultyLevel, InterviewerPersonalityType } from '../../types/adaptive';
import { ConversationMemory } from '../../types/conversationMemory';
import { generatePersonalityPrompt } from './interviewerPersonality';
import { mapLevelToInstruction } from './adaptiveDifficultyService';

export interface PromptBuilderInput {
  memory: ConversationMemory;
  currentQuestion: string;
  candidateAnswer: string;
  difficulty: DifficultyLevel;
  personality: InterviewerPersonalityType;
  expectedSkills?: string[];
  targetRole?: string;
}

export const buildEvaluationPrompt = (input: PromptBuilderInput): string => {
  const { memory, currentQuestion, candidateAnswer, difficulty, personality, targetRole = 'Software Engineer' } = input;
  
  const personalityPrompt = generatePersonalityPrompt(personality);
  const difficultyInstruction = mapLevelToInstruction(difficulty);

  const historyContext = memory.answerHistory.length > 0 
    ? memory.answerHistory.map((h, i) => `Q${i + 1}: [ID: ${h.questionId}]\nA${i + 1}: ${h.summary}`).join('\n\n')
    : 'No previous questions yet.';

  const prompt = `
You are an expert AI Interviewer conducting a mock interview for the role of ${targetRole}.

## Personality Override
${personalityPrompt}

## Difficulty Context
Current Difficulty Level: ${difficulty}
Instructions for this level: ${difficultyInstruction}

## Interview Context
Topics Covered So Far: ${memory.topicsCovered.join(', ') || 'None'}
Identified Weaknesses: ${memory.weakAreas.map(w => w.topic).join(', ') || 'None'}
Identified Strengths: ${memory.strongAreas.map(s => s.topic).join(', ') || 'None'}

## Conversation History
${historyContext}

## Current Turn
Interviewer asked: "${currentQuestion}"
Candidate answered: "${candidateAnswer}"

## Your Task
Evaluate the candidate's answer and determine the next action. You must return your response ONLY as a JSON object with the following schema:
{
  "score": number (0-100, representing answer quality),
  "extractedSkills": string[] (skills demonstrated in the answer),
  "extractedWeaknesses": string[] (areas where the candidate struggled),
  "suggestedFollowUp": string | null (a context-aware follow-up question, or null if no follow-up is needed),
  "followUpType": string | null (type of follow-up e.g., 'Clarification', 'Technical Deep Dive', 'Optimization', or null)
}

Ensure the suggestedFollowUp adheres to your Personality and Difficulty level. Do not use generic follow-ups; make it highly specific to their answer.
If the answer is fully complete and perfect, suggestedFollowUp should be null.
`;

  return prompt;
};
