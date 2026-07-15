import { StructuredResume } from '../../../src/types/resume';

export const validateStructuredResume = (resume: StructuredResume): void => {
  // 1. Candidate Validation
  if (!resume.candidate) {
    throw new Error('Validation Error: Candidate object is missing');
  }

  // We no longer strictly enforce name since many resumes may fail to parse names without AI.
  // However, the prompt asks to "Validate candidate.name exists".
  if (!resume.candidate.name || resume.candidate.name.trim().length === 0) {
    // If name is totally missing, we will just warn or assign a default. 
    // Wait, the prompt says "Validate candidate.name exists... Throw deterministic validation errors if quality fails."
    throw new Error('Validation Error: Candidate name is missing');
  }

  if (resume.candidate.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resume.candidate.email)) {
      throw new Error(`Validation Error: Invalid email format - ${resume.candidate.email}`);
    }
  }

  // 2. Helper to validate arrays of strings
  const validateStringArray = (arr: string[], arrayName: string) => {
    if (!Array.isArray(arr)) {
      throw new Error(`Validation Error: ${arrayName} must be an array`);
    }

    const uniqueSet = new Set<string>();
    
    for (const item of arr) {
      if (!item || typeof item !== 'string' || item.trim().length === 0) {
        throw new Error(`Validation Error: ${arrayName} contains empty strings`);
      }
      
      const normalizedItem = item.toLowerCase().trim();
      if (uniqueSet.has(normalizedItem)) {
        throw new Error(`Validation Error: ${arrayName} contains duplicate entry - ${item}`);
      }
      uniqueSet.add(normalizedItem);
    }
  };

  // 3. Helper to validate arrays of objects
  const validateObjectArray = (arr: any[], arrayName: string, requiredKeys: string[]) => {
    if (!Array.isArray(arr)) {
      throw new Error(`Validation Error: ${arrayName} must be an array`);
    }
    
    for (const item of arr) {
      if (!item || typeof item !== 'object') {
        throw new Error(`Validation Error: ${arrayName} must contain objects`);
      }
      for (const key of requiredKeys) {
        if (item[key] === undefined || item[key] === null) {
          throw new Error(`Validation Error: ${arrayName} object is missing required key '${key}'`);
        }
      }
    }
  };

  // 4. Array validations
  validateStringArray(resume.languages || [], 'languages');
  validateStringArray(resume.certifications || [], 'certifications');
  
  if (!resume.skills || typeof resume.skills !== 'object') {
     throw new Error(`Validation Error: skills must be an object`);
  }
  
  validateObjectArray(resume.experience || [], 'experience', ['role', 'company', 'bullets']);
  validateObjectArray(resume.projects || [], 'projects', ['title', 'technologies', 'description']);
  validateObjectArray(resume.education || [], 'education', ['degree', 'institution']);
};
