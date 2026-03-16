import { ExamStatus, ExamConfig, ExamState } from '../types/ability';

export class ExamManagerService {
  private static currentState: ExamState = {
    status: 'ACTIVE',
    hasSubmitted: false
  };

  /**
   * Initializes the exam process
   */
  static startExam(config: ExamConfig): ExamState {
    this.currentState = {
      status: 'ACTIVE',
      startTime: Date.now(),
      hasSubmitted: false
    };
    console.log(`[ExamManager] Exam started: ${config.title}`);
    return this.currentState;
  }

  /**
   * Handles manual submission by the user
   */
  static handleSubmit(answers: any): ExamState {
    if (this.currentState.hasSubmitted) return this.currentState;

    this.currentState = {
      ...this.currentState,
      status: 'SUBMITTED',
      endTime: Date.now(),
      hasSubmitted: true
    };

    this.triggerSubmission(answers, 'MANUAL');
    return this.currentState;
  }

  /**
   * Handles automatic submission when time is up
   */
  static handleTimeout(answers: any): ExamState {
    if (this.currentState.hasSubmitted) return this.currentState;

    this.currentState = {
      ...this.currentState,
      status: 'TIMED_OUT',
      endTime: Date.now(),
      hasSubmitted: true
    };

    this.triggerSubmission(answers, 'AUTO_TIMEOUT');
    return this.currentState;
  }

  /**
   * Triggers the submission process to the server and notifies the scoring engine
   */
  private static triggerSubmission(answers: any, method: 'MANUAL' | 'AUTO_TIMEOUT') {
    console.log(`[ExamManager] Triggering submission via ${method}...`);
    
    // 1. Call Answer Submission Module (Mock)
    this.mockSubmitToServer(answers);

    // 2. Notify Scoring Engine (yfvu0jh8v)
    this.notifyScoringEngine(answers);
  }

  private static mockSubmitToServer(answers: any) {
    console.log('[ExamManager] Answers sent to server:', answers);
  }

  private static notifyScoringEngine(answers: any) {
    console.log('[ExamManager] Notifying Scoring Engine (yfvu0jh8v) to start calculation...');
    // Implementation of yfvu0jh8v would go here
  }

  static getStatus(): ExamStatus {
    return this.currentState.status;
  }

  static isInputDisabled(): boolean {
    return this.currentState.status === 'SUBMITTED' || this.currentState.status === 'TIMED_OUT';
  }
}
