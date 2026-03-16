import { SolvingResult, BehaviorCorrectionOutput, BehaviorTag } from '../types/ability';

export class BehaviorCorrectionService {
  /**
   * Analyzes learning behavior and calculates correction factors and reliability.
   * Implementation of Module Design v2.1
   */
  static analyze(result: SolvingResult): BehaviorCorrectionOutput {
    const { 
      isCorrect, 
      timeSpentMs, 
      expectedSolveTimeMs, 
      hintUsageCount, 
      studentProfile 
    } = result;

    // 1. Handle Edge Cases
    if (!expectedSolveTimeMs || expectedSolveTimeMs === 0) {
      return {
        correctionFactor: 1.0,
        reliabilityIndex: 0.8,
        behaviorTag: 'NO_EXPECTED_TIME'
      };
    }

    if (timeSpentMs > expectedSolveTimeMs * 5) {
      return {
        correctionFactor: 1.0,
        reliabilityIndex: 0.2,
        behaviorTag: 'LONG_ABSENCE'
      };
    }

    // 2. Calculate Time Efficiency
    const adjustedExpectedTime = expectedSolveTimeMs * studentProfile.avgSolveSpeedFactor;
    const timeRatio = timeSpentMs / adjustedExpectedTime;

    let correctionFactor = 1.0;
    let behaviorTag: BehaviorTag = 'NORMAL';

    // 3. Detect Behavior Cases
    if (isCorrect) {
      if (timeRatio < 0.2) {
        // Case A: LUCKY_GUESS
        correctionFactor = 0.2;
        behaviorTag = 'LUCKY_GUESS';
      } else if (hintUsageCount > 0) {
        // Case B: HINT_DEPENDENT
        const penalty = hintUsageCount * 0.15;
        correctionFactor = Math.max(0.3, 1.0 - penalty);
        behaviorTag = 'HINT_DEPENDENT';
      } else if (timeRatio >= 1.2 && timeRatio <= 2.0) {
        // Case C: STRUGGLED_SUCCESS
        correctionFactor = 1.2;
        behaviorTag = 'STRUGGLED_SUCCESS';
      }
    } else {
      if (timeRatio < 0.15) {
        // Case D: CARELESS_ERROR
        correctionFactor = 0.5;
        behaviorTag = 'CARELESS_ERROR';
      }
    }

    // 4. Calculate Reliability Index
    // reliability_index = 1.0 - (abs(1.0 - correction_factor) * 0.5)
    const reliabilityIndex = 1.0 - (Math.abs(1.0 - correctionFactor) * 0.5);

    return {
      correctionFactor,
      reliabilityIndex,
      behaviorTag
    };
  }
}
