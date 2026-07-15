import { StructuredSkills } from '../../../src/types/resume';

const skillDictionary: Record<string, { name: string, category: keyof StructuredSkills }> = {
  // Languages
  'ts': { name: 'TypeScript', category: 'languages' },
  'typescript': { name: 'TypeScript', category: 'languages' },
  'js': { name: 'JavaScript', category: 'languages' },
  'javascript': { name: 'JavaScript', category: 'languages' },
  'c++': { name: 'C++', category: 'languages' },
  'cpp': { name: 'C++', category: 'languages' },
  'c#': { name: 'C#', category: 'languages' },
  'csharp': { name: 'C#', category: 'languages' },
  'golang': { name: 'Go', category: 'languages' },
  'go': { name: 'Go', category: 'languages' },
  'python': { name: 'Python', category: 'languages' },
  'java': { name: 'Java', category: 'languages' },
  'ruby': { name: 'Ruby', category: 'languages' },
  'php': { name: 'PHP', category: 'languages' },
  'rust': { name: 'Rust', category: 'languages' },
  'swift': { name: 'Swift', category: 'languages' },
  'kotlin': { name: 'Kotlin', category: 'languages' },
  'dart': { name: 'Dart', category: 'languages' },
  'html': { name: 'HTML', category: 'languages' },
  'html5': { name: 'HTML', category: 'languages' },
  'css': { name: 'CSS', category: 'languages' },
  'css3': { name: 'CSS', category: 'languages' },

  // Frameworks
  'reactjs': { name: 'React', category: 'frameworks' },
  'react.js': { name: 'React', category: 'frameworks' },
  'react js': { name: 'React', category: 'frameworks' },
  'react': { name: 'React', category: 'frameworks' },
  'vuejs': { name: 'Vue.js', category: 'frameworks' },
  'vue.js': { name: 'Vue.js', category: 'frameworks' },
  'vue': { name: 'Vue.js', category: 'frameworks' },
  'angularjs': { name: 'Angular', category: 'frameworks' },
  'angular': { name: 'Angular', category: 'frameworks' },
  'nextjs': { name: 'Next.js', category: 'frameworks' },
  'next.js': { name: 'Next.js', category: 'frameworks' },
  'nuxt': { name: 'Nuxt.js', category: 'frameworks' },
  'nuxtjs': { name: 'Nuxt.js', category: 'frameworks' },
  'nodejs': { name: 'Node.js', category: 'frameworks' },
  'node.js': { name: 'Node.js', category: 'frameworks' },
  'node js': { name: 'Node.js', category: 'frameworks' },
  'node': { name: 'Node.js', category: 'frameworks' },
  'express': { name: 'Express.js', category: 'frameworks' },
  'express.js': { name: 'Express.js', category: 'frameworks' },
  'expressjs': { name: 'Express.js', category: 'frameworks' },
  'django': { name: 'Django', category: 'frameworks' },
  'flask': { name: 'Flask', category: 'frameworks' },
  'fastapi': { name: 'FastAPI', category: 'frameworks' },
  'spring boot': { name: 'Spring Boot', category: 'frameworks' },
  'spring': { name: 'Spring Boot', category: 'frameworks' },
  'laravel': { name: 'Laravel', category: 'frameworks' },
  'ror': { name: 'Ruby on Rails', category: 'frameworks' },
  'ruby on rails': { name: 'Ruby on Rails', category: 'frameworks' },
  'rails': { name: 'Ruby on Rails', category: 'frameworks' },
  'bootstrap': { name: 'Bootstrap', category: 'frameworks' },
  'tailwind': { name: 'Tailwind CSS', category: 'frameworks' },
  'tailwindcss': { name: 'Tailwind CSS', category: 'frameworks' },
  'tensor flow': { name: 'TensorFlow', category: 'frameworks' },
  'tensorflow': { name: 'TensorFlow', category: 'frameworks' },
  'tf': { name: 'TensorFlow', category: 'frameworks' },
  'scikit learn': { name: 'Scikit-Learn', category: 'frameworks' },
  'scikitlearn': { name: 'Scikit-Learn', category: 'frameworks' },
  'sklearn': { name: 'Scikit-Learn', category: 'frameworks' },
  'pytorch': { name: 'PyTorch', category: 'frameworks' },
  'keras': { name: 'Keras', category: 'frameworks' },
  'pandas': { name: 'Pandas', category: 'frameworks' },
  'numpy': { name: 'NumPy', category: 'frameworks' },
  
  // Databases
  'postgres': { name: 'PostgreSQL', category: 'databases' },
  'postgresql': { name: 'PostgreSQL', category: 'databases' },
  'sql': { name: 'SQL', category: 'databases' },
  'mysql': { name: 'MySQL', category: 'databases' },
  'mongodb': { name: 'MongoDB', category: 'databases' },
  'mongo': { name: 'MongoDB', category: 'databases' },
  'redis': { name: 'Redis', category: 'databases' },
  'sqlite': { name: 'SQLite', category: 'databases' },
  'mariadb': { name: 'MariaDB', category: 'databases' },
  'cassandra': { name: 'Cassandra', category: 'databases' },
  'elasticsearch': { name: 'Elasticsearch', category: 'databases' },
  'dynamodb': { name: 'DynamoDB', category: 'databases' },
  'firebase': { name: 'Firebase', category: 'databases' },
  'firestore': { name: 'Firestore', category: 'databases' },
  'supabase': { name: 'Supabase', category: 'databases' },

  // Cloud
  'aws': { name: 'AWS', category: 'cloud' },
  'amazon web services': { name: 'AWS', category: 'cloud' },
  'gcp': { name: 'GCP', category: 'cloud' },
  'google cloud': { name: 'GCP', category: 'cloud' },
  'google cloud platform': { name: 'GCP', category: 'cloud' },
  'azure': { name: 'Azure', category: 'cloud' },
  'microsoft azure': { name: 'Azure', category: 'cloud' },
  'k8s': { name: 'Kubernetes', category: 'cloud' },
  'kubernetes': { name: 'Kubernetes', category: 'cloud' },
  'docker': { name: 'Docker', category: 'cloud' },

  // Tools
  'git': { name: 'Git', category: 'tools' },
  'github': { name: 'GitHub', category: 'tools' },
  'gitlab': { name: 'GitLab', category: 'tools' },
  'bitbucket': { name: 'Bitbucket', category: 'tools' },
  'jira': { name: 'Jira', category: 'tools' },
  'postman': { name: 'Postman', category: 'tools' },
  'figma': { name: 'Figma', category: 'tools' },

  // Concepts
  'oop': { name: 'OOP', category: 'concepts' },
  'rest api design': { name: 'REST API Design', category: 'concepts' },
  'api integration': { name: 'API Integration', category: 'concepts' },
  'machine learning': { name: 'Machine Learning', category: 'concepts' },
  'data structures': { name: 'Data Structures', category: 'concepts' },
  'algorithms': { name: 'Algorithms', category: 'concepts' }
};

export const normalizeSkills = (skillsSection: string | undefined): StructuredSkills => {
  const result: StructuredSkills = {
    languages: [],
    frameworks: [],
    databases: [],
    cloud: [],
    tools: [],
    concepts: []
  };

  if (!skillsSection) return result;
  
  // 1. Strip section labels like "Backend: Python" -> "Python"
  // This removes anything before a colon on the same line if it looks like a label (1-3 words).
  let cleanedText = skillsSection.replace(/^(?:[A-Za-z&\-\s]{3,30}):\s*/gm, '');
  
  // Also strip "Also Familiar With:", "Core Skills:", etc.
  cleanedText = cleanedText.replace(/also familiar with:?/gi, '');
  
  // 2. Split by common delimiters
  const rawTokens = cleanedText.split(/[,|•\/;\n]|\s{2,}/);
  
  const processed = rawTokens
    .map(t => t.trim().replace(/[()]/g, '')) // Remove parentheses like (Scikit-Learn)
    .filter(t => t.length > 1);

  // We will keep track of unmapped ones to put in 'concepts' as fallback
  const uniqueSet = new Set<string>();

  for (const t of processed) {
    const lower = t.toLowerCase();
    
    // Check if it exists in dict
    // Because some skills have multiple words, we try full match first
    let matched = false;
    
    // We check keys containing the lower string (exact match)
    if (skillDictionary[lower]) {
      const match = skillDictionary[lower];
      result[match.category].push(match.name);
      matched = true;
    } else {
      // Partial matches for long uncleaned strings
      for (const [key, value] of Object.entries(skillDictionary)) {
        if (lower === key) {
          result[value.category].push(value.name);
          matched = true;
          break;
        }
      }
    }
    
    if (!matched && t.length < 30) {
      // Fallback: add to tools or concepts if it looks legitimate
      // For now, put it in 'tools' to prevent data loss.
      result.tools.push(t);
    }
  }

  // Deduplicate and sort all arrays
  (Object.keys(result) as Array<keyof StructuredSkills>).forEach(key => {
    result[key] = Array.from(new Set(result[key])).sort((a, b) => a.localeCompare(b));
  });

  return result;
};
