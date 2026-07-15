export const detectSections = (normalizedText: string): any => {
  const sections: any = {};
  
  const sectionKeywords = [
    'CAREER OBJECTIVE', 'PROFESSIONAL SUMMARY', 'SKILLS SUMMARY', 'SUMMARY', 'PROFILE', 'OBJECTIVE',
    'PROFESSIONAL EXPERIENCE', 'WORK EXPERIENCE', 'EMPLOYMENT HISTORY', 'EXPERIENCE', 'INTERNSHIP',
    'EDUCATIONAL QUALIFICATION', 'ACADEMIC BACKGROUND', 'ACADEMIC QUALIFICATION', 'EDUCATION',
    'TECHNICAL EXPERTISE', 'CORE COMPETENCIES', 'TECHNICAL SKILLS', 'PROFESSIONAL SKILLS', 'CORE SKILLS', 'SKILLS',
    'PERSONAL PROJECTS', 'ACADEMIC PROJECTS', 'OPEN SOURCE', 'PROJECTS',
    'CERTIFICATIONS', 'LICENSES',
    'ACHIEVEMENTS', 'AWARDS', 'HONORS',
    'LANGUAGES',
    'INTERESTS'
  ].sort((a, b) => b.length - a.length);

  const lines = normalizedText.split('\n');
  
  let currentSectionKey = 'unclassified';
  let currentContent: string[] = [];
  let currentConfidence = 0.5;

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
        }
      }
      currentContent = [];
    }
  };

  const normalizeKey = (header: string) => {
    const h = header.toUpperCase();
    if (h.includes('SUMMARY') || h.includes('PROFILE') || h.includes('OBJECTIVE')) return 'summary';
    if (h.includes('EXPERIENCE') || h.includes('EMPLOYMENT') || h.includes('WORK') || h.includes('INTERNSHIP')) return 'experience';
    if (h.includes('EDUCATION') || h.includes('ACADEMIC') || h.includes('QUALIFICATION')) return 'education';
    if (h.includes('SKILL') || h.includes('COMPETENC') || h.includes('EXPERTISE')) return 'skills';
    if (h.includes('PROJECT') || h.includes('OPEN SOURCE')) return 'projects';
    if (h.includes('CERTIFICATION') || h.includes('LICENSE')) return 'certifications';
    if (h.includes('ACHIEVEMENT') || h.includes('AWARD') || h.includes('HONOR')) return 'achievements';
    if (h.includes('LANGUAGE')) return 'languages';
    if (h.includes('INTEREST')) return 'interests';
    return header.toLowerCase().replace(/[^a-z0-9]/g, '_');
  };

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    let isHeader = false;
    let matchedHeader = '';
    let matchConfidence = 0;

    const upperLine = trimmedLine.toUpperCase();
    const exactMatch = sectionKeywords.find(kw => kw === upperLine || kw + ':' === upperLine);
    
    if (exactMatch) {
      isHeader = true;
      matchedHeader = exactMatch;
      matchConfidence = 0.98; // Exact match
    } else {
      const cleanedUpper = upperLine.replace(/[^A-Z ]/g, '').trim();
      const fuzzyMatch = sectionKeywords.find(kw => kw === cleanedUpper);
      if (fuzzyMatch && trimmedLine.length < 40) {
        isHeader = true;
        matchedHeader = fuzzyMatch;
        matchConfidence = 0.90; // Fuzzy match (ignoring symbols)
      } else if (trimmedLine.length < 40) {
        // Heuristic match
        const heuristicMatch = sectionKeywords.find(kw => upperLine.includes(kw));
        if (heuristicMatch) {
          isHeader = true;
          matchedHeader = heuristicMatch;
          matchConfidence = 0.80;
        }
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
