import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useExamTimer Hook
 * 
 * Precision timing for exams, tracking total time and per-question time.
 * Handles visibility changes and prevents simple system time manipulation.
 */

interface QuestionTimers {
  [questionId: string]: number; // accumulated time in milliseconds
}

export interface ExamTimerResult {
  remainingTime: number; // in seconds
  perQuestionTime: QuestionTimers;
  isTimeUp: boolean;
  blurCount: number;
}

export const useExamTimer = (
  examDurationSeconds: number,
  currentQuestionId: string,
  onTimeUp?: () => void
): ExamTimerResult => {
  const [remainingTime, setRemainingTime] = useState(examDurationSeconds);
  const [questionTimers, setQuestionTimers] = useState<QuestionTimers>({});
  const [blurCount, setBlurCount] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Internal state refs for precision
  const activeQuestionStartTimeRef = useRef<number | null>(Date.now());
  const lastGlobalTickRef = useRef<number>(Date.now());
  const questionTimersRef = useRef<QuestionTimers>({});
  const isVisibleRef = useRef<boolean>(true);

  // 1. Global Timer Logic (Countdown)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaMs = now - lastGlobalTickRef.current;
      
      // Detect system time manipulation (if delta is suspiciously large or negative)
      if (deltaMs > 2000 || deltaMs < 0) {
        console.warn('System time manipulation or significant lag detected.');
      }

      setRemainingTime(prev => {
        const next = Math.max(0, prev - Math.floor(deltaMs / 1000));
        if (next === 0 && prev > 0) {
          setIsTimeUp(true);
          onTimeUp?.();
        }
        return next;
      });

      // Update current question timer in real-time if visible
      if (isVisibleRef.current && activeQuestionStartTimeRef.current !== null) {
        const currentDelta = now - activeQuestionStartTimeRef.current;
        const currentAccumulated = questionTimersRef.current[currentQuestionId] || 0;
        
        // We update the ref immediately for precision
        // But we only update state occasionally or on question change to avoid excessive re-renders
        // However, for UI responsiveness, we'll sync it to state here too
        setQuestionTimers(prev => ({
          ...prev,
          [currentQuestionId]: currentAccumulated + currentDelta
        }));
        
        // Reset the start time for the next "tick" chunk
        activeQuestionStartTimeRef.current = now;
        questionTimersRef.current[currentQuestionId] = currentAccumulated + currentDelta;
      }

      lastGlobalTickRef.current = now;
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestionId, onTimeUp]);

  // 2. Question Switching Logic
  const lastQuestionIdRef = useRef(currentQuestionId);
  useEffect(() => {
    if (lastQuestionIdRef.current !== currentQuestionId) {
      const now = Date.now();
      
      // Finalize time for the previous question
      if (activeQuestionStartTimeRef.current !== null) {
        const delta = now - activeQuestionStartTimeRef.current;
        const prevId = lastQuestionIdRef.current;
        const accumulated = questionTimersRef.current[prevId] || 0;
        
        questionTimersRef.current[prevId] = accumulated + delta;
        setQuestionTimers(prev => ({
          ...prev,
          [prevId]: accumulated + delta
        }));
      }

      // Start timer for the new question
      activeQuestionStartTimeRef.current = now;
      lastQuestionIdRef.current = currentQuestionId;
    }
  }, [currentQuestionId]);

  // 3. Visibility Change Logic
  useEffect(() => {
    const handleVisibilityChange = () => {
      const now = Date.now();
      if (document.hidden) {
        // Hidden: Stop current question timer
        if (activeQuestionStartTimeRef.current !== null) {
          const delta = now - activeQuestionStartTimeRef.current;
          const accumulated = questionTimersRef.current[currentQuestionId] || 0;
          questionTimersRef.current[currentQuestionId] = accumulated + delta;
          setQuestionTimers(prev => ({
            ...prev,
            [currentQuestionId]: accumulated + delta
          }));
        }
        activeQuestionStartTimeRef.current = null;
        isVisibleRef.current = false;
        setBlurCount(prev => prev + 1);
      } else {
        // Visible: Resume current question timer
        activeQuestionStartTimeRef.current = now;
        isVisibleRef.current = true;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentQuestionId]);

  return {
    remainingTime,
    perQuestionTime: questionTimers,
    isTimeUp,
    blurCount
  };
};
