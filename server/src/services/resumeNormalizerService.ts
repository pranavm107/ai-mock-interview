import { cleanText } from './textCleaner';
import { extractEntities } from './entityExtractor';
import { detectSections } from './sectionDetector';
import { normalizeSkills } from './skillNormalizer';
import { detectLanguage } from './languageDetector';
import { buildStructuredResume } from './structuredObjectBuilder';

export const normalizeResumeText = (rawText: string) => {
  const { text: normalizedText, stats: normalizationStats } = cleanText(rawText);
  
  const entities = extractEntities(normalizedText);
  const sections = detectSections(normalizedText);
  
  if (sections.skills && sections.skills.text) {
    sections.skills.text = normalizeSkills(sections.skills.text);
  }

  const language = detectLanguage(normalizedText);
  
  const structuredResume = buildStructuredResume(normalizedText, sections, entities);

  return {
    normalizedText,
    normalizationStats,
    entities,
    sections,
    language,
    structuredResume
  };
};
