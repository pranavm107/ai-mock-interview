export interface RoleProfile {
  role: string;
  prioritySkills: string[];
  optionalSkills: string[];
  expectedProjects: string[];
  commonTopics: string[];
  codingWeight: number;
  systemDesignWeight: number;
  behaviorWeight: number;
}

const roleProfiles: Record<string, RoleProfile> = {
  "software engineer": {
    role: "Software Engineer",
    prioritySkills: ["Java", "Python", "C++", "JavaScript", "SQL"],
    optionalSkills: ["Docker", "AWS", "CI/CD"],
    expectedProjects: ["Web Application", "REST API", "Database Design"],
    commonTopics: ["OOP", "Data Structures", "Algorithms", "API Design", "Concurrency", "Testing"],
    codingWeight: 50,
    systemDesignWeight: 30,
    behaviorWeight: 20
  },
  "backend engineer": {
    role: "Backend Engineer",
    prioritySkills: ["Node.js", "Python", "Java", "Go", "SQL", "MongoDB", "Redis"],
    optionalSkills: ["Kafka", "GraphQL", "Kubernetes"],
    expectedProjects: ["Microservices", "Scalable API", "Data Pipeline"],
    commonTopics: ["System Design", "Microservices", "REST/GraphQL", "SQL/NoSQL", "Caching", "Message Queues"],
    codingWeight: 40,
    systemDesignWeight: 40,
    behaviorWeight: 20
  },
  "frontend engineer": {
    role: "Frontend Engineer",
    prioritySkills: ["React", "Vue", "Angular", "JavaScript", "TypeScript", "HTML", "CSS"],
    optionalSkills: ["Redux", "Webpack", "Next.js"],
    expectedProjects: ["SPA", "Responsive UI", "Component Library"],
    commonTopics: ["React/Vue/Angular", "Performance", "Accessibility", "State Management", "Rendering", "CSS Architecture"],
    codingWeight: 45,
    systemDesignWeight: 25,
    behaviorWeight: 30
  },
  "machine learning engineer": {
    role: "Machine Learning Engineer",
    prioritySkills: ["Python", "TensorFlow", "PyTorch", "Scikit-Learn", "SQL"],
    optionalSkills: ["MLFlow", "Spark", "AWS Sagemaker"],
    expectedProjects: ["Predictive Model", "NLP Pipeline", "Computer Vision"],
    commonTopics: ["Regression", "Classification", "Transformers", "Model Evaluation", "MLOps/Deployment"],
    codingWeight: 30,
    systemDesignWeight: 40,
    behaviorWeight: 30
  },
  "data scientist": {
    role: "Data Scientist",
    prioritySkills: ["Python", "R", "SQL", "Pandas", "Statistics"],
    optionalSkills: ["Tableau", "PowerBI", "Hadoop"],
    expectedProjects: ["Data Analysis", "A/B Testing", "Dashboard"],
    commonTopics: ["Statistics", "Data Wrangling", "Machine Learning", "A/B Testing", "Data Visualization"],
    codingWeight: 30,
    systemDesignWeight: 20,
    behaviorWeight: 50
  },
  "devops engineer": {
    role: "DevOps Engineer",
    prioritySkills: ["Linux", "Docker", "Kubernetes", "CI/CD", "Terraform", "AWS"],
    optionalSkills: ["Ansible", "Prometheus", "Bash"],
    expectedProjects: ["Infrastructure as Code", "CI/CD Pipeline", "Monitoring Setup"],
    commonTopics: ["Infrastructure", "Deployment", "Networking", "Security", "Monitoring"],
    codingWeight: 20,
    systemDesignWeight: 50,
    behaviorWeight: 30
  }
};

export const getRoleProfile = (roleName: string): RoleProfile | null => {
  if (!roleName) return null;
  const normalizedRole = roleName.trim().toLowerCase();

  if (roleProfiles[normalizedRole]) {
    return roleProfiles[normalizedRole];
  }

  for (const [key, profile] of Object.entries(roleProfiles)) {
    if (normalizedRole.includes(key) || key.includes(normalizedRole)) {
      return profile;
    }
  }

  return null;
};
