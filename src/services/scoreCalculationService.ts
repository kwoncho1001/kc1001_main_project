import { 
  ExamScoringRequest, 
  ExamScoringResponse, 
  ExamPaperMetadata 
} from '../types/ability';

export class ScoreCalculationService {
  // Mock database for exam paper metadata
  private static examPapers: Record<string, ExamPaperMetadata> = {
    'exam-1': {
      examId: 'exam-1',
      questions: [
        { questionId: 'p1', weight: 5 },
        { questionId: 'p2', weight: 3 },
        { questionId: 'p3', weight: 4 },
        { questionId: 'p4', weight: 2 },
        { questionId: 'p5', weight: 1 },
        { questionId: 'p6', weight: 5 },
        { questionId: 'p7', weight: 3 },
        { questionId: 'p8', weight: 2 },
        { questionId: 'p9', weight: 4 },
        { questionId: 'p10', weight: 1 },
      ]
    }
  };

  // Mock database for candidate scores (examId -> Array of scores)
  private static candidateScores: Record<string, number[]> = {
    'exam-1': [95.5, 88.0, 82.3, 75.0, 75.0, 68.4, 62.1, 55.0, 42.0, 30.5]
  };

  /**
   * Calculates the final score and rank for a student.
   */
  static processExamResult(request: ExamScoringRequest): ExamScoringResponse {
    const { examId, gradedResults } = request;
    const paper = this.examPapers[examId];

    if (!paper) {
      throw new Error(`Exam paper ${examId} not found`);
    }

    // 1. Calculate total weight (excluding weight 0)
    const activeQuestions = paper.questions.filter(q => q.weight > 0);
    const totalWeight = activeQuestions.reduce((sum, q) => sum + q.weight, 0);

    if (totalWeight === 0) {
      return { totalScore: 0, rank: 1, totalCandidates: 1 };
    }

    // 2 & 3. Calculate score
    let rawScore = 0;
    activeQuestions.forEach(q => {
      if (gradedResults[q.questionId]) {
        const points = (q.weight / totalWeight) * 100;
        rawScore += points;
      }
    });

    // Round to 1 decimal place
    const finalScore = Math.round(rawScore * 10) / 10;

    // 4. Calculate rank
    const scores = [...(this.candidateScores[examId] || [])];
    scores.push(finalScore);
    
    // Sort descending
    scores.sort((a, b) => b - a);

    // Find rank (handle ties: standard competition ranking)
    // Example: 100, 90, 90, 80 -> ranks 1, 2, 2, 4
    const rank = scores.indexOf(finalScore) + 1;
    const totalCandidates = scores.length;

    // Persist score for future ranking (mock)
    if (!this.candidateScores[examId]) {
      this.candidateScores[examId] = [];
    }
    this.candidateScores[examId].push(finalScore);

    return {
      totalScore: finalScore,
      rank,
      totalCandidates
    };
  }

  /**
   * Helper to get total weight for a paper
   */
  static getTotalWeight(examId: string): number {
    const paper = this.examPapers[examId];
    return paper ? paper.questions.reduce((sum, q) => sum + q.weight, 0) : 0;
  }
}
