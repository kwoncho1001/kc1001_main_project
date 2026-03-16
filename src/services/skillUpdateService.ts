import { 
  SkillUpdateEvent, 
  SkillUpdateResponse, 
  UpdatedSkillInfo, 
  AbilityScore,
  AbilityLevel
} from '../types/ability';

const ELO_SCALE_FACTOR = 0.2;
const K_FACTOR = 0.1;
const EXAM_WEIGHT = 0.3;
const FIELD_SOLVED_COUNT_CAP = 500;

export class SkillUpdateService {
  /**
   * Processes skill update events (PROBLEM_SOLVE or EXAM_RESULT)
   * Implementation of Real-time Skill Update Logic v2.0
   */
  static processEvent(
    studentId: string,
    event: SkillUpdateEvent,
    currentScores: Record<string, AbilityScore>,
    hierarchy: { id: string; parentId?: string; level: AbilityLevel }[]
  ): { updatedScores: Record<string, AbilityScore>; response: SkillUpdateResponse } {
    const updatedScores = { ...currentScores };
    const updatedSkills: UpdatedSkillInfo[] = [];
    const now = Date.now();

    if (event.type === 'PROBLEM_SOLVE') {
      const { data } = event;
      const { typeId } = data.hierarchy;

      // 1. Update Type Level (ELO)
      const oldTypeScore = updatedScores[typeId]?.score ?? 0.5;
      const oldSolvedCount = updatedScores[typeId]?.solvedProblemCount ?? 0;

      // Normalize difficulty (1.0-5.0 -> 0.0-1.0)
      const dNorm = (data.difficultyLevel - 1.0) / 4.0;
      
      // ELO Expected Score
      const expected = 1 / (1 + Math.pow(10, (dNorm - oldTypeScore) / ELO_SCALE_FACTOR));
      const actual = data.isCorrect ? 1 : 0;
      
      // Delta calculation with correction factor
      const delta = K_FACTOR * (actual - expected) * data.correctionFactor;
      const newTypeScore = Math.max(0, Math.min(1, oldTypeScore + delta));

      updatedScores[typeId] = {
        ...updatedScores[typeId],
        id: typeId,
        score: newTypeScore,
        solvedProblemCount: oldSolvedCount + 1,
        lastUpdated: now,
        level: 'tag'
      };

      updatedSkills.push({
        level: 'TYPE',
        id: typeId,
        oldScore: oldTypeScore,
        newScore: newTypeScore,
        timestamp: now
      });

      // 2. Propagate Upward
      this.propagate(data.hierarchy, updatedScores, updatedSkills, now, hierarchy);

    } else if (event.type === 'EXAM_RESULT') {
      const { data } = event;
      const oldCourseScore = updatedScores[data.courseId]?.score ?? 0.5;
      
      // Weighted update: S' = S * (1-w) + Score * w
      const newCourseScore = Math.max(0, Math.min(1, 
        oldCourseScore * (1 - EXAM_WEIGHT) + data.score * EXAM_WEIGHT
      ));

      updatedScores[data.courseId] = {
        ...updatedScores[data.courseId],
        id: data.courseId,
        score: newCourseScore,
        lastUpdated: now,
        level: 'subject'
      };

      updatedSkills.push({
        level: 'COURSE',
        id: data.courseId,
        oldScore: oldCourseScore,
        newScore: newCourseScore,
        timestamp: now
      });

      // Propagate from Course to Field
      const fieldId = hierarchy.find(h => h.id === data.courseId)?.parentId;
      if (fieldId) {
        this.updateParentScore(fieldId, updatedScores, updatedSkills, now, hierarchy);
      }
    }

    return {
      updatedScores,
      response: {
        studentId,
        updatedSkills,
        status: 'SUCCESS',
        message: 'Skills updated successfully'
      }
    };
  }

  private static propagate(
    path: { fieldId: string; courseId: string; majorChapterId: string; minorChapterId: string; typeId: string },
    scores: Record<string, AbilityScore>,
    updatedSkills: UpdatedSkillInfo[],
    timestamp: number,
    hierarchy: { id: string; parentId?: string; level: AbilityLevel }[]
  ) {
    // Propagate order: Type -> Minor -> Major -> Course -> Field
    const levels: { id: string; level: UpdatedSkillInfo['level'] }[] = [
      { id: path.minorChapterId, level: 'MINOR_CHAPTER' },
      { id: path.majorChapterId, level: 'MAJOR_CHAPTER' },
      { id: path.courseId, level: 'COURSE' },
      { id: path.fieldId, level: 'FIELD' },
    ];

    levels.forEach(({ id, level }) => {
      this.updateParentScore(id, scores, updatedSkills, timestamp, hierarchy, level);
    });
  }

  private static updateParentScore(
    parentId: string,
    scores: Record<string, AbilityScore>,
    updatedSkills: UpdatedSkillInfo[],
    timestamp: number,
    hierarchy: { id: string; parentId?: string; level: AbilityLevel }[],
    levelLabel?: UpdatedSkillInfo['level']
  ) {
    const children = hierarchy.filter(h => h.parentId === parentId);
    if (children.length === 0) return;

    let totalWeightedScore = 0;
    let totalWeight = 0;

    children.forEach(child => {
      const childScore = scores[child.id];
      if (childScore) {
        // Apply cap for Field level propagation if needed
        let weight = childScore.solvedProblemCount || 1;
        if (child.level === 'subject') {
          weight = Math.min(weight, FIELD_SOLVED_COUNT_CAP);
        }
        
        totalWeightedScore += childScore.score * weight;
        totalWeight += weight;
      }
    });

    if (totalWeight > 0) {
      const oldScore = scores[parentId]?.score ?? 0.5;
      const newScore = totalWeightedScore / totalWeight;

      scores[parentId] = {
        ...scores[parentId],
        id: parentId,
        score: newScore,
        lastUpdated: timestamp,
        // solvedProblemCount for parent is sum of children's counts
        solvedProblemCount: children.reduce((acc, child) => acc + (scores[child.id]?.solvedProblemCount || 0), 0)
      };

      if (levelLabel) {
        updatedSkills.push({
          level: levelLabel,
          id: parentId,
          oldScore,
          newScore,
          timestamp
        });
      }
    }
  }
}
