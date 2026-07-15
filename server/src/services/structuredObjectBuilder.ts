import { ResumeSections, ResumeEntities, StructuredResume } from '../../../src/types/resume';

export const buildStructuredResume = (
  normalizedText: string,
  sections: ResumeSections,
  entities: ResumeEntities
): StructuredResume => {
  
  // 1. Candidate Name Extraction
  // We assume the first non-empty line of 'unclassified' is the name.
  let name = '';
  if (sections.unclassified?.text) {
    const lines = sections.unclassified.text.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      // Usually names are 2-3 words, no weird symbols, less than 40 chars
      if (trimmed.length > 2 && trimmed.length < 40 && !trimmed.includes('@') && !trimmed.includes('http')) {
        name = trimmed;
        break;
      }
    }
  }

  // 2. Helper to split block text into chunks
  const extractChunks = (text: string | undefined): string[] => {
    if (!text) return [];
    // Primary split by double newline (paragraphs/job blocks)
    let chunks = text.split(/\n{2,}/);
    
    // If there is only one big chunk, maybe it's a bulleted list
    if (chunks.length === 1 && text.includes('•')) {
      chunks = text.split(/^[ \t]*•/m).filter(c => c.trim().length > 0);
    }
    
    return chunks.map(c => c.trim()).filter(c => c.length > 0);
  };

  // 3. Helper to extract inline lists (skills, languages)
  const extractInlineList = (text: string | undefined): string[] => {
    if (!text) return [];
    
    // Try splitting by common delimiters: comma, pipe, bullet, or newlines
    // First, check if it's mostly bullet points
    if (text.includes('•')) {
      const bulletItems = text.split(/^[ \t]*•/m).map(c => c.trim()).filter(c => c.length > 0);
      if (bulletItems.length > 1) return bulletItems;
    }

    // Otherwise split by comma, pipe, or newline
    const items = text.split(/[,|\n]/);
    return items.map(c => c.trim()).filter(c => c.length > 0);
  };

  return {
    candidate: {
      name,
      email: entities.emails?.[0] || '',
      phone: entities.phones?.[0] || '',
      github: entities.github?.[0] || '',
      linkedin: entities.linkedin?.[0] || '',
      portfolio: entities.portfolio?.[0] || ''
    },
    skills: extractInlineList(sections.skills?.text),
    languages: extractInlineList(sections.languages?.text),
    
    experience: extractChunks(sections.experience?.text),
    education: extractChunks(sections.education?.text),
    projects: extractChunks(sections.projects?.text),
    certifications: extractChunks(sections.certifications?.text)
  };
};
