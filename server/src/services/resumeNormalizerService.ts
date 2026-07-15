import { cleanText } from './textCleaner';
import { extractEntities } from './entityExtractor';
import { detectSections } from './sectionDetector';
import { normalizeSkills } from './skillNormalizer';
import { detectLanguage } from './languageDetector';
import { buildStructuredResume } from './structuredObjectBuilder';

export const normalizeResumeText = (rawText: string) => {
  const startClean = performance.now();
  const { text: normalizedText, stats: normalizationStats } = cleanText(rawText);
  const normalizeMs = performance.now() - startClean;
  
  const startEntities = performance.now();
  const entities = extractEntities(normalizedText);
  const entityExtractionMs = performance.now() - startEntities;

  const startSections = performance.now();
  const sections = detectSections(normalizedText);
  const sectionDetectionMs = performance.now() - startSections;
  
  // Note: Skills are normalized inside buildStructuredResume.

  const language = detectLanguage(normalizedText);
  
  const startStructure = performance.now();
  const structuredResume = buildStructuredResume(normalizedText, sections, entities);
  const structureMs = performance.now() - startStructure;

  return {
    normalizedText,
    normalizationStats,
    entities,
    sections,
    language,
    structuredResume,
    timings: {
      normalizeMs,
      entityExtractionMs,
      sectionDetectionMs,
      structureMs
    }
  };
};
