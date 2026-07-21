import { getConversationMemory, saveConversationMemory, saveMemorySnapshot } from './adaptiveStorageService';
import { 
  ConversationMemory, 
  MemoryUpdate, 
  MemorySnapshot,
  CandidateProject,
  CandidateSkill
} from '../../types/conversationMemory';
import { getGeminiModel } from '../ai/geminiClient';
import crypto from 'crypto';

export const initializeMemory = async (sessionId: string, initialTopics: string[] = [], profile?: { targetRole?: string, level?: string }): Promise<ConversationMemory> => {
  const memory: ConversationMemory = {
    id: crypto.randomUUID(),
    sessionId,
    ...(profile ? { candidateProfile: profile } : {}),
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
    topicsRemaining: initialTopics,
    aiNotes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await saveConversationMemory(sessionId, memory);
  return memory;
};

export const getMemory = async (sessionId: string): Promise<ConversationMemory | null> => {
  return await getConversationMemory(sessionId);
};

export const resetMemory = async (sessionId: string): Promise<ConversationMemory> => {
  return await initializeMemory(sessionId);
};

export const extractEntities = async (question: string, answerText: string): Promise<MemoryUpdate> => {
  const model = getGeminiModel();
  const prompt = `
Extract structured entities from the candidate's answer to the following question.
Question: "${question}"
Answer: "${answerText}"

Return a valid JSON object matching this structure:
{
  "projects": [{ "name": "Project Name", "description": "Short desc", "technologiesUsed": ["Tech1", "Tech2"] }],
  "skills": [{ "name": "Skill Name", "category": "Language|Framework|Library|Database|Cloud|Concept|SoftSkill|Other" }],
  "achievements": [{ "description": "Short desc", "context": "Where/When" }],
  "weakTopics": [{ "topic": "Topic name", "reason": "Why they struggled" }],
  "strongTopics": [{ "topic": "Topic name", "reason": "Why they excelled" }]
}

If no entities of a specific type are found, return an empty array for that field. Do not include markdown formatting, just the raw JSON.
`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(text);
    return parsed as MemoryUpdate;
  } catch (error) {
    console.error('Extraction failed, returning empty update', error);
    return {};
  }
};

const mergeProjects = (existing: CandidateProject[], newProjects: any[], timestamp: string) => {
  const changes: string[] = [];
  newProjects.forEach(np => {
    if (!np.name) return;
    const existingIndex = existing.findIndex(p => p.name.toLowerCase() === np.name.toLowerCase());
    if (existingIndex > -1) {
      existing[existingIndex].mentionCount += 1;
      existing[existingIndex].lastMentioned = timestamp;
      if (np.technologiesUsed) {
        existing[existingIndex].technologiesUsed = Array.from(new Set([...(existing[existingIndex].technologiesUsed || []), ...np.technologiesUsed]));
      }
      changes.push(`Updated project: ${np.name} (Mentioned ${existing[existingIndex].mentionCount} times)`);
    } else {
      const newProject: any = {
        name: np.name,
        technologiesUsed: np.technologiesUsed || [],
        mentionCount: 1,
        lastMentioned: timestamp
      };
      if (np.description) newProject.description = np.description;
      existing.push(newProject);
      changes.push(`Added new project: ${np.name}`);
    }
  });
  return changes;
};

const mergeSkills = (existing: CandidateSkill[], newSkills: any[], timestamp: string) => {
  const changes: string[] = [];
  newSkills.forEach(ns => {
    if (!ns.name) return;
    const existingIndex = existing.findIndex(s => s.name.toLowerCase() === ns.name.toLowerCase());
    if (existingIndex > -1) {
      existing[existingIndex].mentionCount += 1;
      existing[existingIndex].lastMentioned = timestamp;
      changes.push(`Updated skill: ${ns.name} (Mentioned ${existing[existingIndex].mentionCount} times)`);
    } else {
      existing.push({
        name: ns.name,
        category: ns.category || 'Other',
        mentionCount: 1,
        lastMentioned: timestamp
      });
      changes.push(`Added new skill: ${ns.name}`);
    }
  });
  return changes;
};

export const mergeMemory = async (sessionId: string, update: MemoryUpdate, questionId: string): Promise<MemorySnapshot> => {
  let memory = await getMemory(sessionId);
  if (!memory) {
    memory = await initializeMemory(sessionId);
  }

  const timestamp = new Date().toISOString();
  let allChanges: string[] = [];

  if (update.projects) {
    allChanges = allChanges.concat(mergeProjects(memory.projectsMentioned, update.projects, timestamp));
  }
  if (update.skills) {
    allChanges = allChanges.concat(mergeSkills(memory.skillsMentioned, update.skills, timestamp));
  }

  if (update.weakTopics) {
    update.weakTopics.forEach(wt => {
      const existing = memory!.weakAreas.find(w => w.topic.toLowerCase() === wt.topic.toLowerCase());
      if (!existing) {
        memory!.weakAreas.push({ topic: wt.topic, reason: wt.reason || '', identifiedAt: timestamp });
        allChanges.push(`Identified weak topic: ${wt.topic}`);
      }
    });
  }

  if (update.strongTopics) {
    update.strongTopics.forEach(st => {
      const existing = memory!.strongAreas.find(s => s.topic.toLowerCase() === st.topic.toLowerCase());
      if (!existing) {
        memory!.strongAreas.push({ topic: st.topic, reason: st.reason || '', identifiedAt: timestamp });
        allChanges.push(`Identified strong topic: ${st.topic}`);
      }
    });
  }

  if (update.summary) {
    memory.answerHistory.push(update.summary);
  }

  if (update.confidence) {
    memory.currentConfidence = update.confidence.score;
    memory.confidenceHistory.push(update.confidence);
  }

  await saveConversationMemory(sessionId, memory);

  const snapshot: MemorySnapshot = {
    id: crypto.randomUUID(),
    sessionId,
    timestamp,
    triggerQuestionId: questionId,
    changes: allChanges
  };

  await saveMemorySnapshot(sessionId, snapshot);
  return snapshot;
};

export const updateMemory = async (sessionId: string, questionId: string, questionText: string, answerText: string, confidenceScore: number): Promise<MemorySnapshot> => {
  const extracted = await extractEntities(questionText, answerText);
  
  const updatePayload: MemoryUpdate = {
    ...extracted,
    summary: {
      questionId,
      summary: answerText.substring(0, 100) + '...', // Simple summary for now
      timestamp: new Date().toISOString()
    },
    confidence: {
      score: confidenceScore,
      timestamp: new Date().toISOString()
    }
  };

  return await mergeMemory(sessionId, updatePayload, questionId);
};

export const getConversationSummary = async (sessionId: string): Promise<string> => {
  const memory = await getMemory(sessionId);
  if (!memory) return 'No conversation yet.';
  
  return `Candidate has discussed ${memory.projectsMentioned.length} projects and demonstrated ${memory.skillsMentioned.length} skills. Strong in ${memory.strongAreas.map(s => s.topic).join(', ')}. Weak in ${memory.weakAreas.map(w => w.topic).join(', ')}. Average confidence: ${memory.currentConfidence}`;
};

export const getRecentContext = async (sessionId: string, count: number = 3): Promise<any[]> => {
  const memory = await getMemory(sessionId);
  if (!memory) return [];
  return memory.answerHistory.slice(-count);
};

export const getProjectHistory = async (sessionId: string): Promise<CandidateProject[]> => {
  const memory = await getMemory(sessionId);
  return memory?.projectsMentioned || [];
};

export const getSkillHistory = async (sessionId: string): Promise<CandidateSkill[]> => {
  const memory = await getMemory(sessionId);
  return memory?.skillsMentioned || [];
};

export const getWeakTopics = async (sessionId: string) => (await getMemory(sessionId))?.weakAreas || [];
export const getStrongTopics = async (sessionId: string) => (await getMemory(sessionId))?.strongAreas || [];

export const queueFollowUp = async (sessionId: string, questionText: string, topic: string, type: string): Promise<void> => {
  const memory = await getMemory(sessionId);
  if (!memory) return;
  memory.followUpHistory.push({
    id: crypto.randomUUID(),
    questionText,
    topic,
    type,
    createdAt: new Date().toISOString()
  });
  await saveConversationMemory(sessionId, memory);
};

export const clearFollowUpQueue = async (_sessionId: string): Promise<void> => {
  // In our model, we might just mark them as handled, but for this method, maybe we just want to clear a specific queue.
  // We'll leave it as a no-op if followUpHistory is supposed to be permanent. 
  // Let's assume there's a separate pending list if needed, or we just don't clear history.
};
