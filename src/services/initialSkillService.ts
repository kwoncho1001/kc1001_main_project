import { 
  InitialSkillRequest, 
  InitialSkillResponse, 
  InitializedSkill, 
  PROPAGATION_WEIGHTS,
  SubjectPath
} from '../types/ability';

export class InitialSkillService {
  /**
   * Implements Initial Skill Setting and Propagation Logic (v2.0)
   */
  static initializeSkills(
    request: InitialSkillRequest,
    currentScores: Record<string, number>
  ): InitialSkillResponse {
    const { studentId, newSubjectPath, userProvidedPerformance, selfAssessmentLevel } = request;
    const initializedSkills: InitializedSkill[] = [];

    // 1. Input Validation
    if (!studentId) {
      return { initializedSkills: [], status: 'FAILURE', message: 'Invalid student ID' };
    }
    if (!newSubjectPath.fieldId) {
      return { initializedSkills: [], status: 'FAILURE', message: 'Field ID is required' };
    }

    // 2. Determine Base Initial Score (for new users or new fields)
    let baseInitialScore: number | null = null;

    // Check if user is new (no scores at all)
    const isNewUser = Object.keys(currentScores).length === 0;

    if (isNewUser) {
      if (userProvidedPerformance) {
        if (userProvidedPerformance.percentile !== undefined) {
          baseInitialScore = userProvidedPerformance.percentile;
        } else if (
          userProvidedPerformance.rawScore !== undefined &&
          userProvidedPerformance.avgScore !== undefined &&
          userProvidedPerformance.stdDev !== undefined
        ) {
          // Z = (raw - avg) / stdDev
          const z = (userProvidedPerformance.rawScore - userProvidedPerformance.avgScore) / userProvidedPerformance.stdDev;
          // Score = 0.5 + 0.1Z (clamped to 0-1)
          baseInitialScore = Math.max(0, Math.min(1, 0.5 + 0.1 * z));
        }
      } else if (selfAssessmentLevel) {
        // Mock UserPerformancePoolDB mapping
        const levelMapping = {
          HIGH: 0.75,
          MEDIUM: 0.50,
          LOW: 0.25,
        };
        baseInitialScore = levelMapping[selfAssessmentLevel];
      }

      if (baseInitialScore === null) {
        return { 
          initializedSkills: [], 
          status: 'FAILURE', 
          message: 'New users must provide performance data or self-assessment' 
        };
      }
    }

    // 3. Propagation Logic
    const scoresToUpdate: Record<string, number> = { ...currentScores };
    
    // 3.1 Field Level
    let currentFieldScore = scoresToUpdate[newSubjectPath.fieldId];
    if (currentFieldScore === undefined) {
      currentFieldScore = baseInitialScore !== null ? baseInitialScore : 0.5; // Default 0.5 if existing user but new field
      scoresToUpdate[newSubjectPath.fieldId] = currentFieldScore;
      initializedSkills.push({ level: 'FIELD', id: newSubjectPath.fieldId, initialScore: currentFieldScore });
    }

    // 3.2 Course Level
    if (newSubjectPath.courseId) {
      let currentCourseScore = scoresToUpdate[newSubjectPath.courseId];
      if (currentCourseScore === undefined) {
        currentCourseScore = Math.max(0, Math.min(1, currentFieldScore * PROPAGATION_WEIGHTS.FIELD_TO_COURSE));
        scoresToUpdate[newSubjectPath.courseId] = currentCourseScore;
        initializedSkills.push({ level: 'COURSE', id: newSubjectPath.courseId, initialScore: currentCourseScore });
      }

      // 3.3 Major Chapter Level
      if (newSubjectPath.majorChapterId) {
        let currentMajorScore = scoresToUpdate[newSubjectPath.majorChapterId];
        if (currentMajorScore === undefined) {
          currentMajorScore = Math.max(0, Math.min(1, currentCourseScore * PROPAGATION_WEIGHTS.COURSE_TO_MAJOR_CHAPTER));
          scoresToUpdate[newSubjectPath.majorChapterId] = currentMajorScore;
          initializedSkills.push({ level: 'MAJOR_CHAPTER', id: newSubjectPath.majorChapterId, initialScore: currentMajorScore });
        }

        // 3.4 Minor Chapter Level
        if (newSubjectPath.minorChapterId) {
          let currentMinorScore = scoresToUpdate[newSubjectPath.minorChapterId];
          if (currentMinorScore === undefined) {
            currentMinorScore = Math.max(0, Math.min(1, currentMajorScore * PROPAGATION_WEIGHTS.MAJOR_CHAPTER_TO_MINOR_CHAPTER));
            scoresToUpdate[newSubjectPath.minorChapterId] = currentMinorScore;
            initializedSkills.push({ level: 'MINOR_CHAPTER', id: newSubjectPath.minorChapterId, initialScore: currentMinorScore });
          }

          // 3.5 Type Level
          if (newSubjectPath.typeId) {
            let currentTypeScore = scoresToUpdate[newSubjectPath.typeId];
            if (currentTypeScore === undefined) {
              currentTypeScore = Math.max(0, Math.min(1, currentMinorScore * PROPAGATION_WEIGHTS.MINOR_CHAPTER_TO_TYPE));
              scoresToUpdate[newSubjectPath.typeId] = currentTypeScore;
              initializedSkills.push({ level: 'TYPE', id: newSubjectPath.typeId, initialScore: currentTypeScore });
            }
          }
        }
      }
    }

    return {
      initializedSkills,
      status: initializedSkills.length > 0 ? 'SUCCESS' : 'PARTIAL_SUCCESS',
      message: initializedSkills.length > 0 ? 'Skills initialized successfully' : 'No new skills to initialize'
    };
  }
}
