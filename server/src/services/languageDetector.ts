export const detectLanguage = (text: string) => {
  // A simple heuristic for English resumes
  // We check for common English resume keywords
  const englishKeywords = ['experience', 'education', 'skills', 'project', 'summary', 'university', 'college', 'school', 'worked', 'developed'];
  const lowerText = text.toLowerCase();
  
  let matchCount = 0;
  for (const keyword of englishKeywords) {
    if (lowerText.includes(keyword)) {
      matchCount++;
    }
  }

  // If we match a good number of keywords, it's very likely English
  if (matchCount >= 3) {
    return { primary: 'en', confidence: 0.95 };
  } else if (matchCount > 0) {
    return { primary: 'en', confidence: 0.60 };
  } else {
    // Default fallback
    return { primary: 'unknown', confidence: 0.0 };
  }
};
