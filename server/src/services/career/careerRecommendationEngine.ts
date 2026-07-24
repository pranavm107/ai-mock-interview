import { InterviewSession } from './careerAggregationService';

export interface WeeklyFocus {
  id: string;
  topic: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
}

export interface DailyGoal {
  id: string;
  title: string;
  completed: boolean;
}

export interface RecommendationSummary {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
}

export const generateWeeklyFocus = (
  skills: Record<string, number>, 
  sessions: InterviewSession[]
): WeeklyFocus[] => {
  const priorities: WeeklyFocus[] = [];
  
  // Filter out mastered skills (>= 85)
  const availableSkills = Object.entries(skills).filter(([, score]) => score < 85);
  
  if (availableSkills.length === 0) {
    if (Object.keys(skills).length === 0) {
      return [
        { id: 'w1', topic: 'Fundamentals', description: 'Complete your first mock interview to identify weaknesses.', status: 'pending' },
        { id: 'w2', topic: 'Resume Review', description: 'Ensure your resume is tailored to your target roles.', status: 'pending' }
      ];
    } else {
      return [
        { id: 'w1', topic: 'Mastery', description: 'You are performing excellently across the board. Maintain consistency.', status: 'pending' }
      ];
    }
  }

  // Sort by weakest first
  const sortedSkills = availableSkills.sort(([, scoreA], [, scoreB]) => scoreA - scoreB);

  sortedSkills.slice(0, 3).forEach(([skill, score], index) => {
    let desc = '';
    if (score < 70) {
      desc = `Priority: Improve your ${skill} score (currently ${score}/100) by focusing on targeted mock interviews.`;
    } else {
      desc = `Maintain: Your ${skill} is at ${score}/100. Keep practicing to reach Mastery (85+).`;
    }
    priorities.push({
      id: `w${index + 1}`,
      topic: skill,
      description: desc,
      status: 'pending'
    });
  });

  return priorities;
};

export const generateLearningRoadmap = (skills: Record<string, number>): RoadmapItem[] => {
  const availableSkills = Object.entries(skills).filter(([, score]) => score < 85);
  const sortedSkills = availableSkills.sort(([, scoreA], [, scoreB]) => scoreA - scoreB);
    
  if (sortedSkills.length === 0) {
    if (Object.keys(skills).length === 0) {
      return [
        { id: 'r1', title: 'Start Practicing', description: 'Complete interviews to unlock a personalized learning path.', duration: '1 week', status: 'available' }
      ];
    } else {
      return [
        { id: 'r1', title: 'Explore Advanced Topics', description: 'You have mastered core skills. Explore advanced concepts.', duration: '4 weeks', status: 'available' }
      ];
    }
  }

  const weakest = sortedSkills[0][0];
  const roadmap: RoadmapItem[] = [];

  if (weakest === 'System Design') {
    roadmap.push({ id: 'r1', title: 'System Design Basics', description: 'Learn CAP Theorem and basic scaling concepts.', duration: '1 week', status: 'available' });
    roadmap.push({ id: 'r2', title: 'Caching & Load Balancing', description: 'Understand distributed caching and proxies.', duration: '2 weeks', status: 'locked' });
    roadmap.push({ id: 'r3', title: 'Database Sharding', description: 'Scale relational and NoSQL databases.', duration: '1 week', status: 'locked' });
  } else if (weakest === 'Algorithms' || weakest === 'Problem Solving') {
    roadmap.push({ id: 'r1', title: 'Data Structures Refresher', description: 'Review HashMaps, Trees, and Graphs.', duration: '1 week', status: 'available' });
    roadmap.push({ id: 'r2', title: 'Dynamic Programming', description: 'Practice memoization and tabulation.', duration: '2 weeks', status: 'locked' });
    roadmap.push({ id: 'r3', title: 'Graph Traversal', description: 'Master BFS, DFS, and topological sort.', duration: '1 week', status: 'locked' });
  } else if (weakest === 'Communication' || weakest === 'Leadership') {
    roadmap.push({ id: 'r1', title: 'STAR Method', description: 'Structure your behavioral answers properly.', duration: '1 week', status: 'available' });
    roadmap.push({ id: 'r2', title: 'Leadership Scenarios', description: 'Practice conflict resolution questions.', duration: '1 week', status: 'locked' });
    roadmap.push({ id: 'r3', title: 'Cross-functional Collaboration', description: 'Learn to answer teamwork questions effectively.', duration: '1 week', status: 'locked' });
  } else {
    roadmap.push({ id: 'r1', title: `Improve ${weakest}`, description: `Focus on fundamentals of ${weakest}.`, duration: '1 week', status: 'available' });
    roadmap.push({ id: 'r2', title: `Advanced ${weakest}`, description: `Deep dive into complex ${weakest} problems.`, duration: '2 weeks', status: 'locked' });
  }

  return roadmap;
};

export const generateDailyGoals = (sessions: InterviewSession[], weakestSkill: string): DailyGoal[] => {
  const goals: DailyGoal[] = [];
  
  const incompleteCount = sessions.filter(s => s.status === 'In Progress' || s.status === 'Draft').length;
  
  if (incompleteCount > 0) {
    goals.push({ id: 'g1', title: 'Resume your pending interview', completed: false });
  } else if (sessions.length === 0) {
    goals.push({ id: 'g1', title: 'Start your first mock interview', completed: false });
  } else {
    goals.push({ id: 'g1', title: `Complete a ${weakestSkill || 'general'} mock interview`, completed: false });
  }

  goals.push({ id: 'g2', title: 'Review your lowest scoring answers', completed: false });
  goals.push({ id: 'g3', title: 'Practice for 15 minutes', completed: false });

  return goals;
};

export const generateRecommendationSummary = (skills: Record<string, number>): RecommendationSummary => {
  const sorted = Object.entries(skills).sort(([, a], [, b]) => b - a);
  
  if (sorted.length === 0) {
    return { strengths: [], weaknesses: [], opportunities: ['Start practicing to receive insights!'] };
  }

  const strengths = sorted.filter(([, score]) => score >= 85).map(([k]) => k);
  // If no strengths >= 85, take top 2 relative strengths if score > 50
  if (strengths.length === 0) {
    strengths.push(...sorted.filter(([, score]) => score > 50).slice(0, 2).map(([k]) => k));
  }

  const weaknesses = sorted.filter(([, score]) => score < 85).reverse().slice(0, 2).map(([k]) => k);

  const opportunities = [];
  if (weaknesses.length > 0) {
    opportunities.push(`Focus on improving your ${weaknesses[0]} score to boost your overall readiness.`);
  } else {
    opportunities.push('You are showing mastery across all tracked skills.');
  }

  return {
    strengths,
    weaknesses,
    opportunities
  };
};
