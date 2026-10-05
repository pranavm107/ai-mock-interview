export type ReadinessLevel = 'Needs Significant Preparation' | 'Developing' | 'Good Progress' | 'Interview Ready' | 'Highly Ready';
export type ConfidenceLevel = 'Low' | 'Medium' | 'High';
export type TrendDirection = 'Improving' | 'Stable' | 'Declining' | 'Not Enough Data';

export interface ReadinessScoreComponent {
  label: string; // e.g. "Technical Readiness", "Communication"
  score: number;
}

export interface WeaknessCard {
  topic: string;
  performance: number; // 0-100 percentage
  evidenceCount: {
    interviews: number;
    assessments: number;
    questions: number;
  };
  trend: TrendDirection;
}

export interface StrengthCard {
  topic: string;
  performance: number; // 0-100 percentage
  evidenceCount: {
    interviews: number;
    assessments: number;
    questions: number;
  };
  trend: TrendDirection;
}

export interface PriorityAction {
  priority: number;
  title: string;
  topic: string;
}

export interface ReadinessProfile {
  readinessScore: number;
  readinessState: ReadinessLevel;
  confidence: ConfidenceLevel;

  evidence: {
    interviews: number;
    assessments: number;
    evaluatedResponses: number;
  };
  
  components: ReadinessScoreComponent[];
  
  weaknesses: WeaknessCard[];
  strengths: StrengthCard[];
  
  priorities: PriorityAction[];
  
  trendHistory: {
    date: string;
    score: number;
    label: string; // e.g. "Interview 1"
  }[];

  aiExplanation?: string;
  lastUpdated: string;
  hasInsufficientData: boolean;
}
