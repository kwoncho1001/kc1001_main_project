import { AbilityLevel } from './types/ability';

export const APP_NAME = 'APEX NETWORK';
export const APP_DESCRIPTION = 'AI-Powered Math Learning Analysis System';

export const DIFFICULTY_LEVELS = [
  { id: 1, label: '기초 (Lv.1)', weight: 0.1 },
  { id: 2, label: '기본 (Lv.2)', weight: 0.2 },
  { id: 3, label: '응용 (Lv.3)', weight: 0.3 },
  { id: 4, label: '심화 (Lv.4)', weight: 0.25 },
  { id: 5, label: '킬러 (Lv.5)', weight: 0.15 }
];

export const ABILITY_LEVEL_LABELS: Record<AbilityLevel, string> = {
  FIELD: '영역',
  COURSE: '과목',
  MAJOR_CHAPTER: '대단원',
  MINOR_CHAPTER: '소단원',
  TYPE: '유형'
};

export const DEFAULT_EXAM_DURATION = 60 * 30; // 30 minutes in seconds

export const API_ENDPOINTS = {
  SAVE_SCORE: '/api/scores/save',
  GET_ANALYSIS: '/api/analysis/get',
  UPLOAD_FILE: '/api/files/upload'
};

export const COLORS = {
  PRIMARY: '#10b981', // apex-accent
  SECONDARY: '#0a0a0a', // apex-black
  SUCCESS: '#10b981',
  ERROR: '#ef4444',
  WARNING: '#f59e0b',
  INFO: '#3b82f6'
};
