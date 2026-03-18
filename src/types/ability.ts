export type AbilityLevel = 'FIELD' | 'COURSE' | 'MAJOR_CHAPTER' | 'MINOR_CHAPTER' | 'TYPE';

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
  TYPE: 0.4,
  MINOR_CHAPTER: 0.25,
  MAJOR_CHAPTER: 0.15,
  COURSE: 0.1,
  FIELD: 0.1,
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

export interface PropagationWeights {
  FIELD_TO_COURSE: number;
  COURSE_TO_MAJOR_CHAPTER: number;
  MAJOR_CHAPTER_TO_MINOR_CHAPTER: number;
  MINOR_CHAPTER_TO_TYPE: number;
}

export type HierarchyAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'GET_ALL_STRUCTURE' | 'GET_PROPAGATION_WEIGHTS';

export interface HierarchyRequest {
  action: HierarchyAction;
  level?: AbilityLevel;
  id?: string;
  parent_id?: string;
  name?: string;
  description?: string;
  propagation_weights?: Partial<PropagationWeights>;
}

export interface HierarchyResponse {
  status: 'SUCCESS' | 'FAILURE';
  message: string;
  data?: {
    structure?: any[];
    item?: any;
    propagation_weights?: PropagationWeights;
  };
}

export interface SkillUpdateResponse {
  studentId: string;
  updatedSkills: UpdatedSkillInfo[];
  status: 'SUCCESS' | 'FAILURE';
  message: string;
}

export interface WeightCalculationRequest {
  studentId: string;
  contextHierarchy: {
    L1: string; // Field
    L2: string; // Course
    L3: string; // Major Chapter
    L4: string; // Minor Chapter
    L5: string; // Type
  };
  weightPreset?: 'DEFAULT' | 'EXAM' | 'PRACTICE';
  reliabilityIndex?: number;
}

export interface CalculationLogEntry {
  level: number;
  score: number | null;
  weight: number;
}

export interface WeightCalculationResponse {
  finalTheta: number;
  confidence: number;
  calculationLog: CalculationLogEntry[];
}

export type ExamStatus = 'ACTIVE' | 'PAUSED' | 'SUBMITTED' | 'TIMED_OUT';

export interface ExamConfig {
  id: string;
  title: string;
  timeLimitMs: number;
  isAutoSubmitEnabled: boolean;
}

export interface ExamState {
  status: ExamStatus;
  startTime?: number;
  endTime?: number;
  hasSubmitted: boolean;
}

export interface DifficultyFactors {
  computationalComplexity: number; // 0.0 to 1.0
  conceptualDepth: number; // 0.0 to 1.0
  logicalReasoning: number; // 0.0 to 1.0
}

export interface QuestionDBItem {
  id: string;
  content: string; // Markdown/Latex
  metadata: ProblemMetadata;
  keywords: string[];
  concepts: string[]; // Concept IDs
  difficultyFactors: DifficultyFactors;
  aiConfidence: number;
  needsReview: boolean;
}

export interface AIMetadataAnalysisRequest {
  problemText: string;
}

export interface AIMetadataAnalysisResponse {
  metadata: Omit<ProblemMetadata, 'difficulty'>;
  keywords: string[];
  concepts: string[];
  difficultyFactors: DifficultyFactors;
  confidence: number;
}

export interface ExamScoringRequest {
  examId: string;
  userId: string;
  gradedResults: Record<string, boolean>;
}

export interface ExamScoringResponse {
  totalScore: number;
  rank: number;
  totalCandidates: number;
}

export interface ExamQuestionWeight {
  questionId: string;
  weight: number;
}

export interface ExamPaperMetadata {
  examId: string;
  questions: ExamQuestionWeight[];
}

export interface OCRCandidate {
  text: string;
  confidence: number;
}

export interface OCRResult {
  id: string;
  type: 'text' | 'formula' | 'image';
  boundingBox: { x: number; y: number; width: number; height: number };
  content: string; // Recognized text or LaTeX
  candidates?: OCRCandidate[];
  isUncertain: boolean;
}

export interface ExtractedProblem {
  id: string;
  problemNumber: string;
  content: string;
  options?: string[];
  answer?: string;
  explanation?: string;
  rawElements: OCRResult[];
  analysis?: AIMetadataAnalysisResponse;
}

export interface OCRProcessingState {
  status: 'IDLE' | 'UPLOADING' | 'PREPROCESSING' | 'EXTRACTING' | 'ANALYZING' | 'VALIDATING' | 'REVIEW_REQUIRED' | 'COMPLETED';
  progress: number;
  message: string;
}

export interface GamificationStats {
  solvedCount: number;
  avgDifficulty: number;
  accuracy: number;
  streakDays: number;
  totalPoints: number;
  level: number;
  treeGrowth: number; // 0 to 100
}

export interface HeatmapData {
  date: string;
  intensity: number; // 0 to 1
}

export interface LearningReport {
  points: number;
  level: number;
  heatmap: HeatmapData[];
  timelapseUrl?: string;
}

export interface TransactionLog {
  id: string;
  studentId: string;
  problemId: string;
  isCorrect: boolean;
  timeSpentMs: number;
  difficulty: number; // 1 to 5
  timestamp: number;
  hierarchyPath: string; // e.g., "f1/s1/m1/n1/t1"
}

export interface ProgressMaster {
  studentId: string;
  hierarchyId: string;
  level: AbilityLevel;
  currentScore: number;
  totalAttempts: number;
  correctAttempts: number;
  lastAttemptTimestamp: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

export interface AnalysisResult {
  studentId: string;
  weakPoints: string[]; // Hierarchy IDs
  strongPoints: string[]; // Hierarchy IDs
  recommendedProblems: string[]; // Problem IDs
  overallProgress: number; // 0 to 1
  aiFeedback?: string;
  recommendations?: string[];
}
