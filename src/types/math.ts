export type SubtopicId = 
  | '18.1' 
  | '18.2' 
  | '18.3' 
  | '18.4' 
  | '18.5' 
  | '18.6' 
  | '18.7';

export type DifficultyLevel = 'Simple' | 'Middle' | 'Hard';

export type QuestionCategory =
  | 'Theory'
  | 'Graph to Equation'
  | 'Equation to Graph'
  | 'Turning Points'
  | 'Roots'
  | 'y-Intercept'
  | 'Inflection Point'
  | 'Asymptote'
  | 'Gradient of Tangent'
  | 'Calculus Derivative'
  | 'Equation of Tangent'
  | 'Line of Symmetry'
  | 'Solving Quadratics with Graph';

export interface GraphPoint {
  x: number;
  y: number;
  label?: string;
  color?: string;
}

export interface GraphSpec {
  xRange: [number, number];
  yRange: [number, number];
  functions: Array<{
    type: 'quadratic' | 'reciprocal' | 'cubic' | 'exponential' | 'linear';
    params: Record<string, number>;
    color?: string;
    label?: string;
    dashed?: boolean;
  }>;
  points?: GraphPoint[];
  asymptotes?: {
    x?: number[];
    y?: number[];
  };
  lineOfSymmetry?: number;
  tangentAt?: {
    x: number;
    y: number;
    gradient: number;
    xSpan?: [number, number];
  };
  highlightInterval?: [number, number];
}

export interface IGCSEQuestion {
  id: number;
  subtopic: SubtopicId;
  subtopicTitle: string;
  difficulty: DifficultyLevel;
  category: QuestionCategory;
  questionText: string;
  diagram?: GraphSpec;
  options: [string, string, string, string]; // A, B, C, D
  correctIndex: 0 | 1 | 2 | 3;
  correctLetter: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  markingGuide: string;
}

export interface SubtopicMeta {
  id: SubtopicId;
  title: string;
  description: string;
  totalQuestions: number;
}

export interface QuestionAttemptState {
  questionId: number;
  selectedOption: number | null;
  attemptsCount: number; // 0, 1, 2, 3, 4
  status: 'unanswered' | 'correct' | 'incorrect' | 'exhausted';
  score: number; // 0, 2.0, or 2.5
  history: number[];
}

export interface StudentProgress {
  studentName: string;
  className: string;
  candidateNumber: string;
  centreNumber: string;
  attempts: Record<number, QuestionAttemptState>;
  lastSavedAt: string;
  timeSpentSeconds: number;
}
