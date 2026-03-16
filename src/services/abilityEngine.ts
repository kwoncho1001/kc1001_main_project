import { AbilityScore, AbilityLevel, SolvingResult, ABILITY_WEIGHTS, ProblemMetadata } from '../types/ability';
import { BehaviorCorrectionService } from './behaviorCorrection';

const K_FACTOR = 0.1;

export class AbilityEngine {
  /**
   * Calculates the final predicted ability (theta_final) for a specific problem context.
   */
  static calculateFinalTheta(
    scores: Record<string, number>, // Map of ID to score
    metadata: ProblemMetadata
  ): number {
    const { fieldId, subjectId, majorUnitId, minorUnitId, tagId } = metadata;

    const fieldScore = scores[fieldId] ?? 0.5;
    const subjectScore = scores[subjectId] ?? fieldScore;
    const majorScore = scores[majorUnitId] ?? subjectScore;
    const minorScore = scores[minorUnitId] ?? majorScore;
    const tagScore = scores[tagId] ?? minorScore;

    return (
      fieldScore * ABILITY_WEIGHTS.field +
      subjectScore * ABILITY_WEIGHTS.subject +
      majorScore * ABILITY_WEIGHTS.majorUnit +
      minorScore * ABILITY_WEIGHTS.minorUnit +
      tagScore * ABILITY_WEIGHTS.tag
    );
  }

  /**
   * Updates ability scores across the 5-level hierarchy based on a solving result.
   */
  static updateHierarchy(
    currentScores: Record<string, number>,
    result: SolvingResult
  ): Record<string, number> {
    const updatedScores = { ...currentScores };
    const { metadata, isCorrect } = result;

    // 1. Get Correction Factor from BehaviorCorrectionService
    const { correctionFactor } = BehaviorCorrectionService.analyze(result);

    // 2. Update each level (Bottom-up: Tag -> Field)
    const levels: { id: string; level: AbilityLevel }[] = [
      { id: metadata.tagId, level: 'tag' },
      { id: metadata.minorUnitId, level: 'minorUnit' },
      { id: metadata.majorUnitId, level: 'majorUnit' },
      { id: metadata.subjectId, level: 'subject' },
      { id: metadata.fieldId, level: 'field' },
    ];

    levels.forEach(({ id, level }) => {
      const oldScore = updatedScores[id] ?? 0.5;
      
      // Simplified ELO-like update
      const expected = 1 / (1 + Math.pow(10, (metadata.difficulty - oldScore)));
      const actual = isCorrect ? 1 : 0;
      
      // Level-specific learning rate (lower levels update faster)
      const levelRate = level === 'tag' ? 1.0 : level === 'minorUnit' ? 0.8 : 0.5;
      
      const delta = K_FACTOR * levelRate * correctionFactor * (actual - expected);
      updatedScores[id] = Math.max(0, Math.min(1, oldScore + delta));
    });

    return updatedScores;
  }

  /**
   * Propagates ability from top to bottom for cold-start scenarios.
   */
  static propagateDown(
    scores: Record<string, number>,
    parentId: string,
    childIds: string[]
  ): Record<string, number> {
    const updatedScores = { ...scores };
    const parentScore = scores[parentId] ?? 0.5;

    childIds.forEach(childId => {
      if (updatedScores[childId] === undefined) {
        // Initialize child with a slightly conservative parent score
        updatedScores[childId] = parentScore * 0.9;
      }
    });

    return updatedScores;
  }
}
