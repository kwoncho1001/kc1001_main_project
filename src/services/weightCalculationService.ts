import { 
  WeightCalculationRequest, 
  WeightCalculationResponse, 
  CalculationLogEntry,
  AbilityScore
} from '../types/ability';

const PRESETS: Record<string, number[]> = {
  DEFAULT: [0.05, 0.10, 0.15, 0.30, 0.40],
  EXAM: [0.10, 0.20, 0.20, 0.25, 0.25],
  PRACTICE: [0.02, 0.08, 0.10, 0.35, 0.45],
};

export class WeightCalculationService {
  /**
   * Multi-layered Weight Calculation Engine (v2.1)
   * Calculates final expected ability score based on hierarchical scores.
   */
  static calculateFinalTheta(
    request: WeightCalculationRequest,
    currentScores: Record<string, AbilityScore>
  ): WeightCalculationResponse {
    const { contextHierarchy, weightPreset = 'DEFAULT', reliabilityIndex = 1.0 } = request;
    
    // 1. Fetch Scores (L1 to L5)
    const hierarchyIds = [
      contextHierarchy.L1,
      contextHierarchy.L2,
      contextHierarchy.L3,
      contextHierarchy.L4,
      contextHierarchy.L5,
    ];

    const scores = hierarchyIds.map(id => currentScores[id]?.score ?? null);

    // 2. Initialize Weights
    const baseWeights = [...(PRESETS[weightPreset] || PRESETS.DEFAULT)];
    const finalWeights = [...baseWeights];
    const calculationLog: CalculationLogEntry[] = [];

    // 3. Fallback & Redistribution (Bottom-up)
    // If Si is null, add its weight to its parent.
    for (let i = 4; i > 0; i--) {
      if (scores[i] === null) {
        finalWeights[i - 1] += finalWeights[i];
        finalWeights[i] = 0;
      }
    }

    // Special case: If L1 is also null, use system default 0.5
    let effectiveScores = [...scores];
    if (effectiveScores[0] === null) {
      effectiveScores[0] = 0.5;
    }

    // 4. Final Score Calculation (Weighted Sum)
    let finalTheta = 0;
    let existingWeightSum = 0;

    for (let i = 0; i < 5; i++) {
      const score = effectiveScores[i];
      const weight = finalWeights[i];
      
      if (score !== null && weight > 0) {
        finalTheta += score * weight;
        existingWeightSum += baseWeights[i]; // Use base weights to track original data existence
      }

      calculationLog.push({
        level: i + 1,
        score: scores[i], // Log original score (null if missing)
        weight: finalWeights[i]
      });
    }

    // 5. Confidence Calculation
    // data_existence_confidence = (sum of weights of existing levels) / 1.0
    // confidence = data_existence_confidence * reliability_index
    const dataExistenceConfidence = existingWeightSum; // Since total base weight is 1.0
    const confidence = Math.max(0, Math.min(1, dataExistenceConfidence * reliabilityIndex));

    // 6. Clamping
    finalTheta = Math.max(0, Math.min(1, finalTheta));

    return {
      finalTheta,
      confidence,
      calculationLog
    };
  }
}
