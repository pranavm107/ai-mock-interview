const skillDictionary: Record<string, string> = {
  'reactjs': 'React',
  'react.js': 'React',
  'react js': 'React',
  'nodejs': 'Node.js',
  'node.js': 'Node.js',
  'node js': 'Node.js',
  'node': 'Node.js',
  'vuejs': 'Vue.js',
  'vue.js': 'Vue.js',
  'vue': 'Vue.js',
  'angularjs': 'Angular',
  'angular': 'Angular',
  'postgres': 'PostgreSQL',
  'postgresql': 'PostgreSQL',
  'ts': 'TypeScript',
  'typescript': 'TypeScript',
  'js': 'JavaScript',
  'javascript': 'JavaScript',
  'aws': 'AWS',
  'amazon web services': 'AWS',
  'gcp': 'GCP',
  'google cloud': 'GCP',
  'google cloud platform': 'GCP',
  'k8s': 'Kubernetes',
  'kubernetes': 'Kubernetes',
  'docker': 'Docker',
  'c++': 'C++',
  'cpp': 'C++',
  'c#': 'C#',
  'csharp': 'C#',
  'golang': 'Go',
  'go': 'Go',
  'python': 'Python',
  'java': 'Java',
  'ruby': 'Ruby',
  'ror': 'Ruby on Rails',
  'ruby on rails': 'Ruby on Rails',
  'html': 'HTML',
  'html5': 'HTML',
  'css': 'CSS',
  'css3': 'CSS',
  'tailwind': 'Tailwind CSS',
  'tailwindcss': 'Tailwind CSS',
  'nextjs': 'Next.js',
  'next.js': 'Next.js',
  'nuxt': 'Nuxt.js',
  'nuxtjs': 'Nuxt.js'
};

export const normalizeSkills = (skillsSection: string): string => {
  if (!skillsSection) return '';
  
  let normalized = skillsSection;

  // Since it's a string block (like bullets or comma separated), we can try to find and replace.
  // Using word boundary replacement (case insensitive)
  for (const [key, value] of Object.entries(skillDictionary)) {
    // Avoid replacing "go" if it's part of a normal word, so we need word boundaries.
    // In JavaScript regex, \b works, but for some symbols like ++ or # it's tricky.
    // For a simple normalizer without AI, we can just do our best.
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedKey}\\b`, 'gi');
    normalized = normalized.replace(regex, value);
  }

  // Handle special cases without word boundaries for C++ and C#
  normalized = normalized.replace(/(?<!\w)C\+\+(?!\w)/gi, 'C++');
  normalized = normalized.replace(/(?<!\w)C#(?!\w)/gi, 'C#');

  return normalized;
};
