export interface CompanyProfile {
  company: string;
  technicalWeight: number;
  behaviorWeight: number;
  systemDesignWeight: number;
  codingWeight: number;
  communicationWeight: number;
  preferredDifficulty: "EASY" | "MEDIUM" | "HARD" | "MIXED";
  interviewStages: string[];
  commonTopics: string[];
  interviewStyle: string;
}

const companyProfiles: Record<string, CompanyProfile> = {
  amazon: {
    company: "Amazon",
    technicalWeight: 30,
    behaviorWeight: 40,
    systemDesignWeight: 20,
    codingWeight: 10,
    communicationWeight: 30,
    preferredDifficulty: "HARD",
    interviewStages: ["Online Assessment", "Phone Screen", "Loop (4-5 rounds)"],
    commonTopics: ["Leadership Principles", "Scalability", "System Design"],
    interviewStyle: "Behavioral-heavy, STAR method required, deep dives into past experience."
  },
  google: {
    company: "Google",
    technicalWeight: 50,
    behaviorWeight: 10,
    systemDesignWeight: 20,
    codingWeight: 20,
    communicationWeight: 20,
    preferredDifficulty: "HARD",
    interviewStages: ["Phone Screen", "Onsite (4-5 technical rounds)"],
    commonTopics: ["Data Structures", "Algorithms", "Graph Theory", "Dynamic Programming"],
    interviewStyle: "Algorithm-heavy, whiteboard coding, highly analytical."
  },
  microsoft: {
    company: "Microsoft",
    technicalWeight: 40,
    behaviorWeight: 20,
    systemDesignWeight: 30,
    codingWeight: 10,
    communicationWeight: 20,
    preferredDifficulty: "MEDIUM",
    interviewStages: ["Phone Screen", "Onsite (4 rounds)"],
    commonTopics: ["System Design", "Object Oriented Design", "Debugging"],
    interviewStyle: "Practical problem solving, design-heavy."
  },
  meta: {
    company: "Meta",
    technicalWeight: 50,
    behaviorWeight: 20,
    systemDesignWeight: 20,
    codingWeight: 10,
    communicationWeight: 10,
    preferredDifficulty: "HARD",
    interviewStages: ["Ninja (Coding)", "Pirate (System Design)", "Jedi (Behavioral)"],
    commonTopics: ["Product Design", "Scalability", "Algorithms"],
    interviewStyle: "Fast-paced coding, bug-free execution expected."
  },
  infosys: {
    company: "Infosys",
    technicalWeight: 60,
    behaviorWeight: 30,
    systemDesignWeight: 0,
    codingWeight: 10,
    communicationWeight: 30,
    preferredDifficulty: "EASY",
    interviewStages: ["Aptitude", "Technical HR", "General HR"],
    commonTopics: ["Java", "SQL", "OOP", "DBMS", "Software Engineering Life Cycle"],
    interviewStyle: "Standardized questions, focus on fundamental concepts."
  },
  tcs: {
    company: "TCS",
    technicalWeight: 50,
    behaviorWeight: 40,
    systemDesignWeight: 0,
    codingWeight: 10,
    communicationWeight: 30,
    preferredDifficulty: "EASY",
    interviewStages: ["NQT", "Technical", "Managerial", "HR"],
    commonTopics: ["Aptitude", "DBMS", "Computer Networks", "OOP", "Basic Programming"],
    interviewStyle: "Broad coverage of fundamentals, less deep coding."
  }
};

export const getCompanyProfile = (companyName: string): CompanyProfile | null => {
  if (!companyName) return null;
  const normalizedName = companyName.trim().toLowerCase();
  
  if (companyProfiles[normalizedName]) {
    return companyProfiles[normalizedName];
  }

  for (const [key, profile] of Object.entries(companyProfiles)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return profile;
    }
  }

  return null;
};
