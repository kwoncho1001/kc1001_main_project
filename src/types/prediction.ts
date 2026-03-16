export interface GradePredictionData {
  subject: string;
  currentScore: number;
  predictedScore: number;
  targetScore: number;
  currentGrade: number;
  predictedGrade: number;
  targetGrade: number;
  confidenceInterval: [number, number];
  weakTypes: {
    type: string;
    impact: number; // how much score can be improved
    recommendation: string;
  }[];
  studyGuide: string;
}

export interface UserLearningStats {
  totalQuestions: number;
  accuracy: number;
  avgTimePerQuestion: number;
  streak: number;
  weeklyStudyHours: number;
}
