export const cleanText = (rawText: string) => {
  if (!rawText) return { text: '', stats: getEmptyStats() };

  let text = rawText;
  const originalCharacters = text.length;

  // 1. Remove invisible unicode (Zero width spaces, NBSP, etc.)
  text = text.replace(/[\u200B-\u200D\uFEFF]/g, '');
  text = text.replace(/\xA0/g, ' '); // NBSP to space

  // 2. Remove tabs
  text = text.replace(/\t/g, ' ');

  // 3. Normalize quotation marks
  text = text.replace(/[“”]/g, '"');
  text = text.replace(/[‘’]/g, "'");

  // 4. Normalize dashes (em dash, en dash)
  text = text.replace(/[—–]/g, '-');

  // 5. Normalize bullets (only at start of lines)
  const preBulletLength = text.length;
  text = text.replace(/^[ \t]*[●○►▪■*>\-•][ \t]+/gm, '• ');
  const normalizedBullets = Math.abs(preBulletLength - text.length); // rough estimate

  // 6. Normalize spacing around punctuation
  text = text.replace(/\s+,/g, ',');
  text = text.replace(/\s+\./g, '.');

  // 7. Remove page numbers (e.g. 'Page 1', '1 of 2', '2/4')
  let removedPageNumbers = 0;
  text = text.replace(/^[ \t]*Page \d+[ \t]*$/gmi, () => { removedPageNumbers++; return ''; });
  text = text.replace(/^[ \t]*\d+ of \d+[ \t]*$/gmi, () => { removedPageNumbers++; return ''; });
  text = text.replace(/^[ \t]*\d+\/\d+[ \t]*$/gmi, () => { removedPageNumbers++; return ''; });

  // 8. Remove duplicate short lines (like headers/names)
  const lines = text.split('\n');
  const seenLines = new Set<string>();
  const deduplicatedLines: string[] = [];
  let removedPageHeaders = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 0 && trimmed.length < 50) {
      if (seenLines.has(trimmed.toLowerCase())) {
        removedPageHeaders++;
        continue;
      }
      seenLines.add(trimmed.toLowerCase());
    }
    deduplicatedLines.push(line);
  }
  text = deduplicatedLines.join('\n');

  // 9. Remove excessive whitespace (spaces only, preserving newlines)
  text = text.replace(/[ \t]{2,}/g, ' ');

  // 10. Remove repeated blank lines (reduce multiple newlines to max 2)
  const preBlankLength = text.length;
  text = text.replace(/\n{3,}/g, '\n\n');
  const removedBlankLines = (preBlankLength - text.length) / 2; // rough estimate

  text = text.trim();

  const normalizedCharacters = text.length;
  const compressionRatio = originalCharacters > 0 
    ? parseFloat(((1 - normalizedCharacters / originalCharacters) * 100).toFixed(1)) 
    : 0;

  return {
    text,
    stats: {
      originalCharacters,
      normalizedCharacters,
      compressionRatio,
      removedBlankLines: Math.round(removedBlankLines),
      removedPageHeaders,
      removedPageNumbers,
      normalizedBullets: normalizedBullets > 0 ? 1 : 0, // boolean-ish or count if we tracked it better
      normalizedWhitespace: true
    }
  };
};

const getEmptyStats = () => ({
  originalCharacters: 0,
  normalizedCharacters: 0,
  compressionRatio: 0,
  removedBlankLines: 0,
  removedPageHeaders: 0,
  removedPageNumbers: 0,
  normalizedBullets: 0,
  normalizedWhitespace: false
});
