import type { Interview } from '../types';

/**
 * Generates a human-readable slug for an interview.
 * Format: `company-role-xxxxxx` where `xxxxxx` is the first 6 characters of the Firestore ID.
 * This keeps the URL clean while allowing us to lookup the exact interview in memory.
 */
export const generateInterviewSlug = (interview: Interview): string => {
  const base = `${interview.company}-${interview.role}`
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  // Use first 6 chars of the Firestore ID
  const idFragment = interview.id.substring(0, 6);
  
  return `${base}-${idFragment}`;
};
