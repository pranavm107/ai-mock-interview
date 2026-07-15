export const detectSections = (normalizedText: string): any => {
  const sections: any = {};
  
  const sectionKeywords = [
    'SUMMARY', 'PROFILE', 'OBJECTIVE',
    'EXPERIENCE', 'WORK EXPERIENCE', 'PROFESSIONAL EXPERIENCE', 'EMPLOYMENT HISTORY',
    'EDUCATION', 'ACADEMIC BACKGROUND',
    'SKILLS', 'TECHNICAL SKILLS', 'CORE COMPETENCIES',
    'PROJECTS', 'PERSONAL PROJECTS', 'OPEN SOURCE',
    'CERTIFICATIONS', 'LICENSES',
    'ACHIEVEMENTS', 'AWARDS', 'HONORS',
    'LANGUAGES'
  ];

  const lines = normalizedText.split('\n');
  
  let currentSectionKey = 'unclassified';
  let currentContent: string[] = [];
  let currentConfidence = 0.5; // Default for unclassified

  const saveCurrentSection = () => {
    if (currentContent.length > 0) {
      const joined = currentContent.join('\n').trim();
      if (joined) {
        if (!sections[currentSectionKey]) {
          sections[currentSectionKey] = {
            text: joined,
            confidence: currentConfidence
          };
        } else {
          sections[currentSectionKey].text += '\n\n' + joined;
          // Keep highest confidence if appending
        }
      }
      currentContent = [];
    }
  };

  const normalizeKey = (header: string) => {
    const h = header.toUpperCase();
    if (h.includes('SUMMARY') || h.includes('PROFILE') || h.includes('OBJECTIVE')) return 'summary';
    if (h.includes('EXPERIENCE') || h.includes('EMPLOYMENT') || h.includes('WORK')) return 'experience';
    if (h.includes('EDUCATION') || h.includes('ACADEMIC')) return 'education';
    if (h.includes('SKILL') || h.includes('COMPETENC')) return 'skills';
    if (h.includes('PROJECT') || h.includes('OPEN SOURCE')) return 'projects';
    if (h.includes('CERTIFICATION') || h.includes('LICENSE')) return 'certifications';
    if (h.includes('ACHIEVEMENT') || h.includes('AWARD') || h.includes('HONOR')) return 'achievements';
    if (h.includes('LANGUAGE')) return 'languages';
    return header.toLowerCase().replace(/[^a-z0-9]/g, '_');
  };

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    let isHeader = false;
    let matchedHeader = '';
    let matchConfidence = 0;

    const upperLine = trimmedLine.toUpperCase();
    
    // Direct match against known headers (allowing optional trailing colon)
    const exactMatch = sectionKeywords.find(kw => kw === upperLine || kw + ':' === upperLine);
    
    if (exactMatch) {
      isHeader = true;
      matchedHeader = exactMatch;
      matchConfidence = 0.98; // Very high confidence for exact match
    } else {
      // Check if it's a known header with some minor noise (e.g., "--- EXPERIENCE ---")
      const cleanedUpper = upperLine.replace(/[^A-Z ]/g, '').trim();
      const cleanMatch = sectionKeywords.find(kw => kw === cleanedUpper);
      if (cleanMatch && trimmedLine.length < 40) {
        isHeader = true;
        matchedHeader = cleanMatch;
        matchConfidence = 0.85; // Lower confidence for fuzzy match
      }
    }

    if (isHeader) {
      saveCurrentSection();
      currentSectionKey = normalizeKey(matchedHeader);
      currentConfidence = matchConfidence;
    } else {
      currentContent.push(line);
    }
  }

  saveCurrentSection();

  return sections;
};
