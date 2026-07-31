import { InterviewSection } from "../../types/interview";

export interface TemplateDistribution {
  RESUME: number;
  ROLE: number;
  COMPANY: number;
  BEHAVIORAL: number;
}

export interface InterviewTemplate {
  name: string;
  distribution: TemplateDistribution;
  priorityTopics?: string[];
  preferredDifficulty?: "EASY" | "MEDIUM" | "HARD" | "MIXED";
}

const templates: Record<string, InterviewTemplate> = {
  "campus placement": {
    name: "Campus Placement",
    distribution: { RESUME: 40, ROLE: 30, COMPANY: 20, BEHAVIORAL: 10 },
    preferredDifficulty: "EASY",
    priorityTopics: ["Data Structures", "Algorithms", "Core CS"]
  },
  "technical round": {
    name: "Technical Round",
    distribution: { RESUME: 30, ROLE: 60, COMPANY: 5, BEHAVIORAL: 5 },
    preferredDifficulty: "MIXED"
  },
  "manager round": {
    name: "Manager Round",
    distribution: { RESUME: 20, ROLE: 20, COMPANY: 30, BEHAVIORAL: 30 },
    preferredDifficulty: "MIXED"
  },
  "hr round": {
    name: "HR Round",
    distribution: { RESUME: 10, ROLE: 0, COMPANY: 40, BEHAVIORAL: 50 },
    preferredDifficulty: "EASY"
  },
  "system design": {
    name: "System Design Round",
    distribution: { RESUME: 10, ROLE: 80, COMPANY: 10, BEHAVIORAL: 0 },
    preferredDifficulty: "HARD",
    priorityTopics: ["Scalability", "Microservices", "Databases", "System Architecture"]
  }
};

export const getTemplate = (templateName: string): InterviewTemplate | null => {
  if (!templateName) return null;
  const normalized = templateName.trim().toLowerCase();
  
  if (templates[normalized]) {
    return templates[normalized];
  }

  for (const [key, template] of Object.entries(templates)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return template;
    }
  }

  // Default distribution if no specific template is matched but a standard flow is expected
  return {
    name: "Standard 40/30/20/10",
    distribution: { RESUME: 40, ROLE: 30, COMPANY: 20, BEHAVIORAL: 10 }
  };
};
