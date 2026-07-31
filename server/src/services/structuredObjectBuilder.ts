import { ResumeSections, ResumeEntities, StructuredResume, StructuredExperience, StructuredProject, StructuredEducation } from '../types/resume';
import { normalizeSkills } from './skillNormalizer';

export const buildStructuredResume = (
  normalizedText: string,
  sections: ResumeSections,
  entities: ResumeEntities
): StructuredResume => {
  
  // Helper to split text into lines
  const getLines = (text: string | undefined): string[] => {
    if (!text) return [];
    return text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  };

  // 1. Candidate Extraction State Machine
  let name = '';
  let headline = '';
  let location = '';
  
  const unclassifiedLines = getLines(sections.unclassified?.text);
  const skipKeywords = [
    ...(entities.emails || []),
    ...(entities.phones || []),
    'linkedin', 'github', 'portfolio'
  ].map(k => k.toLowerCase());

  let candidateState = 0; // 0 = looking for name, 1 = looking for headline, 2 = looking for location
  
  for (const line of unclassifiedLines) {
    const lowerLine = line.toLowerCase();
    
    // Skip if line contains any known entity (email, phone, link)
    const isEntityLine = skipKeywords.some(kw => lowerLine.includes(kw));
    if (isEntityLine) continue;

    if (candidateState === 0) {
      if (line.length < 40) {
        name = line;
        candidateState = 1;
      }
    } else if (candidateState === 1) {
      headline = line.replace(/^[-|—]+|[-|—]+$/g, '').trim();
      candidateState = 2;
    } else if (candidateState === 2) {
      location = line.replace(/^[-|—]+|[-|—]+$/g, '').trim();
      candidateState = 3;
    }
  }

  // 2. Language Extraction
  const extractLanguages = (text: string | undefined): string[] => {
    if (!text) return [];
    // Split on delimiters AND words like "and", "&".
    const raw = text.split(/[,|•/;\n&]|\b(?:and)\b|\s{2,}/i);
    const ignoreList = ['read', 'write', 'speak', 'native', 'fluent', 'beginner', 'intermediate', 'advanced', 'proficient'];
    
    return Array.from(new Set(
      raw.filter(l => l != null)
         .map(l => l.trim().replace(/^[-|—]+|[-|—]+$/g, '').trim())
         .filter(l => {
           const low = l.toLowerCase();
           if (low.length < 3) return false;
           if (low.includes('of')) return false; // filter "-- 1 of 1 --"
           if (ignoreList.includes(low)) return false;
           return true;
         })
    ));
  };

  const cleanArray = (arr: any[]): string[] => {
    return arr.filter(item => item && typeof item === 'string' && item.trim().length > 0).map(item => item.trim());
  };
  
  // 3. Experience State Machine
  const parseExperience = (lines: string[]): StructuredExperience[] => {
    const experiences: StructuredExperience[] = [];
    let currentExp: Partial<StructuredExperience> | null = null;
    
    for (const line of lines) {
      const isBullet = /^[•\-*]\s/.test(line);
      const isDate = /\b(?:19|20)\d{2}\b/.test(line);
      const hasDelimiter = /\||—|-/.test(line) && !isBullet;
      
      // If it's not a bullet, and it looks like a header (has dates, delimiters, or is short)
      if (!isBullet && (hasDelimiter || isDate || line.length < 50)) {
        if (currentExp) experiences.push(currentExp as StructuredExperience);
        
        let role = '', company = '', duration = '';
        
        if (isDate) duration = line.match(/\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|19\d{2}|20\d{2}).*?(?:19\d{2}|20\d{2}|Present))\b/i)?.[0] || '';
        
        const parts = line.split(/\||—|-/).map(p => p.trim());
        if (parts.length > 1) {
          // Heuristic: "Engineer", "Developer", "Intern" usually implies role
          if (parts[0].toLowerCase().match(/engineer|developer|intern|manager|lead|analyst/)) {
            role = parts[0];
            company = parts.slice(1).join(' ');
          } else {
            company = parts[0];
            role = parts.slice(1).join(' ');
          }
        } else {
          company = line;
        }
        
        currentExp = { role, company, duration, bullets: [] };
      } else if (currentExp) {
        currentExp.bullets!.push(line.replace(/^[•\-*]\s*/, '').trim());
      }
    }
    if (currentExp) experiences.push(currentExp as StructuredExperience);
    return experiences;
  };

  // 4. Projects State Machine
  const parseProjects = (lines: string[]): StructuredProject[] => {
    const projects: StructuredProject[] = [];
    let currentProj: Partial<StructuredProject> | null = null;
    
    for (const line of lines) {
      const isBullet = /^[•\-*]\s/.test(line);
      const lower = line.toLowerCase();
      const isToolsLine = lower.startsWith('tools used:') || lower.startsWith('technologies:');
      
      if (!isBullet && !isToolsLine && line.length < 80) {
        if (currentProj) projects.push(currentProj as StructuredProject);
        
        let title = line, techStr = '';
        const parts = line.split(/\||—|-/).map(p => p.trim());
        if (parts.length > 1) {
          title = parts[0];
          techStr = parts.slice(1).join(' ');
        }
        
        currentProj = { 
          title, 
          technologies: techStr ? cleanArray(techStr.split(/[,|]/)) : [], 
          description: [], 
          outcomes: [] 
        };
      } else if (currentProj) {
        if (isToolsLine) {
          const techStr = line.replace(/^(?:\w+\s+)+:/i, '');
          currentProj.technologies!.push(...cleanArray(techStr.split(/[,|]/)));
        } else {
          const cleaned = line.replace(/^[•\-*]\s*/, '').trim();
          if (cleaned.toLowerCase().startsWith('outcome:')) {
            currentProj.outcomes!.push(cleaned.replace(/^outcome:\s*/i, ''));
          } else {
            currentProj.description!.push(cleaned);
          }
        }
      }
    }
    if (currentProj) projects.push(currentProj as StructuredProject);
    return projects;
  };

  // 5. Education State Machine
  const parseEducation = (lines: string[]): StructuredEducation[] => {
    const educations: StructuredEducation[] = [];
    let currentEdu: Partial<StructuredEducation> | null = null;
    
    for (const line of lines) {
      // const hasDate = /\b(20\d{2})\b/.test(line);
      const hasCgpa = /cgpa|gpa/i.test(line);
      const hasDelimiter = /\||—|-/.test(line);
      
      // Assume a new degree starts if the line has a degree keyword or is the first line
      const isDegreeLine = /B\.Sc|M\.Sc|B\.Tech|M\.Tech|B\.E|M\.E|Bachelor|Master|PhD/i.test(line) || (!currentEdu && !hasCgpa);
      
      if (isDegreeLine) {
        if (currentEdu) educations.push(currentEdu as StructuredEducation);
        
        let degree = line, startYear = '', endYear = '';
        const parts = line.split(/\||—|-/).map(p => p.trim());
        
        if (parts.length > 1) {
           degree = parts[0];
           const datePart = parts.slice(1).join(' ');
           const years = datePart.match(/\b(20\d{2})\b/g);
           if (years && years.length >= 2) {
             startYear = years[0];
             endYear = years[1];
           } else if (years && years.length === 1) {
             endYear = years[0];
           }
        }
        
        currentEdu = { degree, institution: '', cgpa: '', startYear, endYear };
      } else if (currentEdu) {
        const parts = line.split(/\||—|-/).map(p => p.trim());
        
        if (hasCgpa) {
          const cgpaPart = parts.find(p => p.toLowerCase().includes('cgpa') || p.toLowerCase().includes('gpa'));
          if (cgpaPart) {
            const match = cgpaPart.match(/[\d.]+/);
            if (match) currentEdu.cgpa = match[0];
          }
          currentEdu.institution = parts.filter(p => p !== cgpaPart).join(' ');
        } else {
          currentEdu.institution = line;
        }
      }
    }
    if (currentEdu) educations.push(currentEdu as StructuredEducation);
    return educations;
  };

  return {
    candidate: {
      name,
      headline,
      location,
      email: entities.emails?.[0] || '',
      phone: entities.phones?.[0] || '',
      github: entities.github?.[0] || '',
      linkedin: entities.linkedin?.[0] || '',
      portfolio: entities.portfolio?.[0] || ''
    },
    skills: normalizeSkills(sections.skills?.text),
    languages: extractLanguages(sections.languages?.text),
    experience: parseExperience(getLines(sections.experience?.text)),
    education: parseEducation(getLines(sections.education?.text)),
    projects: parseProjects(getLines(sections.projects?.text)),
    certifications: cleanArray(getLines(sections.certifications?.text).map(l => l.replace(/^[•\-*]\s*/, '')))
  };
};
