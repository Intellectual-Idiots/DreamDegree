export interface PersonalityQuestion {
  id: number;
  question: string;
  category: string;
  career_paths: string[];
}

export interface PersonalityResponse {
  questionId: number;
  rating: number; // 1-5 scale
}

export interface PersonalityProfile {
  categories: Record<string, number>;
  topCareerPaths: string[];
  strengths: string[];
  workStyle: string;
}

export interface AcademicResult {
  subject: string;
  mark: number;
  level?: 'SL' | 'HL'; // Standard or Higher Level for IB
}

export interface Degree {
  id: string;
  name: string;
  university: string;
  faculty: string;
  duration: string;
  requirements: {
    minAPS: number;
    subjects: Record<string, number>; // subject -> min mark
  };
  description: string;
  careerProspects: string[];
  personalityMatch?: number;
}

export interface GapAnalysis {
  degreeId: string;
  degreeName: string;
  university: string;
  currentMatch: number;
  missingRequirements: {
    subject: string;
    required: number;
    current: number;
  }[];
  actionPlan: string[];
  alternatives: string[];
}

export interface NavigationStep {
  id: string;
  title: string;
  icon: string;
  completed: boolean;
  disabled: boolean;
  path: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  typing?: boolean;
}