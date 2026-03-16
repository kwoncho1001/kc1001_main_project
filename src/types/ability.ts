export type AbilityLevel = 'field' | 'subject' | 'majorUnit' | 'minorUnit' | 'tag';

export interface Problem {
  id: string;
  type: 'multiple' | 'subjective';
  options?: string[];
  title?: string;
}

export interface AbilityScore {
  id: string;
  name: string;
  level: AbilityLevel;
  score: number; // 0.0 to 1.0
  parentId?: string;
  lastUpdated: number;
  solvedProblemCount: number;
}

export interface ProblemMetadata {
  fieldId: string;
  subjectId: string;
  majorUnitId: string;
  minorUnitId: string;
  tagId: string;
  difficulty: number; // 0.0 to 1.0
}

export type BehaviorTag = 
  | 'LUCKY_GUESS' 
  | 'STRUGGLED_SUCCESS' 
  | 'NORMAL' 
  | 'HINT_DEPENDENT' 
  | 'CARELESS_ERROR' 
  | 'LONG_ABSENCE' 
  | 'NO_EXPECTED_TIME';

export interface StudentProfile {
  avgSolveSpeedFactor: number;
  recentHintFrequency: number;
}

export interface BehaviorCorrectionOutput {
  correctionFactor: number;
  reliabilityIndex: number;
  behaviorTag: BehaviorTag;
}

export interface SolvingResult {
  studentId: string;
  isCorrect: boolean;
  timeSpentMs: number;
  expectedSolveTimeMs: number;
  hintUsageCount: number;
  metadata: ProblemMetadata;
  studentProfile: StudentProfile;
}

export const ABILITY_WEIGHTS: Record<AbilityLevel, number> = {
  tag: 0.4,
  minorUnit: 0.25,
  majorUnit: 0.15,
  subject: 0.1,
  field: 0.1,
};

export interface UserPerformance {
  percentile?: number;
  rawScore?: number;
  maxScore?: number;
  stdDev?: number;
  avgScore?: number;
}

export type SelfAssessmentLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface SubjectPath {
  fieldId: string;
  courseId?: string;
  majorChapterId?: string;
  minorChapterId?: string;
  typeId?: string;
}

export interface InitialSkillRequest {
  studentId: string;
  newSubjectPath: SubjectPath;
  userProvidedPerformance?: UserPerformance;
  selfAssessmentLevel?: SelfAssessmentLevel;
}

export interface InitializedSkill {
  level: 'FIELD' | 'COURSE' | 'MAJOR_CHAPTER' | 'MINOR_CHAPTER' | 'TYPE';
  id: string;
  initialScore: number;
}

export interface InitialSkillResponse {
  initializedSkills: InitializedSkill[];
  status: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILURE';
  message: string;
}

export const PROPAGATION_WEIGHTS = {
  FIELD_TO_COURSE: 0.9,
  COURSE_TO_MAJOR_CHAPTER: 0.85,
  MAJOR_CHAPTER_TO_MINOR_CHAPTER: 0.8,
  MINOR_CHAPTER_TO_TYPE: 0.75,
};

export interface ProblemSolveData {
  problemId: string;
  hierarchy: {
    fieldId: string;
    courseId: string;
    majorChapterId: string;
    minorChapterId: string;
    typeId: string;
  };
  isCorrect: boolean;
  difficultyLevel: number; // 1.0 to 5.0
  correctionFactor: number; // 0.1 to 1.5
}

export interface ExamResultData {
  examId: string;
  courseId: string;
  score: number; // 0.0 to 1.0
}

export type SkillUpdateEvent = 
  | { type: 'PROBLEM_SOLVE'; data: ProblemSolveData }
  | { type: 'EXAM_RESULT'; data: ExamResultData };

export interface UpdatedSkillInfo {
  level: 'FIELD' | 'COURSE' | 'MAJOR_CHAPTER' | 'MINOR_CHAPTER' | 'TYPE';
  id: string;
  oldScore: number;
  newScore: number;
  timestamp: number;
}

export interface SkillUpdateResponse {
  studentId: string;
  updatedSkills: UpdatedSkillInfo[];
  status: 'SUCCESS' | 'FAILURE';
  message: string;
}
