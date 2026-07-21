import { 
  initializeMemory, 
  mergeMemory, 
  getConversationSummary,
  getRecentContext,
  getProjectHistory,
  getSkillHistory,
  resetMemory
} from '../conversationMemory';
import { MemoryUpdate } from '../../../types/conversationMemory';
import crypto from 'crypto';

// A mock to bypass actual gemini calls during this unit test
const mockExtractEntities = async (question: string, answer: string): Promise<MemoryUpdate> => {
  if (answer.includes('React and FastAPI')) {
    return {
      projects: [{ name: 'AI Resume Parser', mentionCount: 1, lastMentioned: new Date().toISOString(), technologiesUsed: ['React', 'FastAPI'] }],
      skills: [
        { name: 'React', category: 'Library', mentionCount: 1, lastMentioned: new Date().toISOString() },
        { name: 'FastAPI', category: 'Framework', mentionCount: 1, lastMentioned: new Date().toISOString() },
        { name: 'Frontend', category: 'Concept', mentionCount: 1, lastMentioned: new Date().toISOString() }
      ],
      achievements: [],
      weakTopics: [],
      strongTopics: []
    };
  }
  if (answer.includes('FastAPI later')) {
    return {
      projects: [],
      skills: [
        { name: 'FastAPI', category: 'Framework', mentionCount: 1, lastMentioned: new Date().toISOString() }
      ]
    };
  }
  if (answer.includes('AI Resume Parser again')) {
    return {
      projects: [{ name: 'AI Resume Parser', mentionCount: 1, lastMentioned: new Date().toISOString() }]
    };
  }
  return {};
};

const runTests = async () => {
  console.log('--- Starting Memory Engine Tests ---');
  const sessionId = crypto.randomUUID();

  // Test Initialization
  let memory = await initializeMemory(sessionId, ['System Design', 'React']);
  console.log('1. Memory Initialized:', !!memory && memory.sessionId === sessionId);

  // Test Extraction and Merging (First pass)
  let extracted = await mockExtractEntities('What did you build?', 'I built an AI Resume Parser using React and FastAPI.');
  let snapshot = await mergeMemory(sessionId, extracted, 'Q1');
  console.log('2. First Merge Snapshot Created:', !!snapshot);

  let projects = await getProjectHistory(sessionId);
  console.log('   - Project count:', projects.length, projects[0]?.name === 'AI Resume Parser' ? '(Correct)' : '(Incorrect)');
  let skills = await getSkillHistory(sessionId);
  console.log('   - Skills count:', skills.length, skills.find(s => s.name === 'React') ? '(React found)' : '(React missing)');

  // Test Deduplication (Second pass)
  extracted = await mockExtractEntities('What about backend?', 'I used FastAPI later.');
  await mergeMemory(sessionId, extracted, 'Q2');
  
  skills = await getSkillHistory(sessionId);
  const fastapiSkill = skills.find(s => s.name === 'FastAPI');
  console.log('3. Deduplication (Skill):', fastapiSkill?.mentionCount === 2 ? '(Correct - mentioned twice)' : '(Incorrect count)');

  // Test Deduplication (Third pass)
  extracted = await mockExtractEntities('What was your biggest project?', 'The AI Resume Parser again.');
  await mergeMemory(sessionId, extracted, 'Q3');

  projects = await getProjectHistory(sessionId);
  const aiProject = projects.find(p => p.name === 'AI Resume Parser');
  console.log('4. Deduplication (Project):', aiProject?.mentionCount === 2 ? '(Correct - mentioned twice)' : '(Incorrect count)');

  // Test Summary & Context
  const summary = await getConversationSummary(sessionId);
  console.log('5. Summary Generated:', summary.includes('1 projects') ? '(Correct)' : summary);

  const context = await getRecentContext(sessionId);
  console.log('6. Recent Context working:', context !== undefined);

  // Test Reset
  await resetMemory(sessionId);
  projects = await getProjectHistory(sessionId);
  console.log('7. Reset working:', projects.length === 0 ? '(Correct)' : '(Failed to reset)');

  console.log('--- Tests Completed ---');
};

runTests().catch(console.error);
