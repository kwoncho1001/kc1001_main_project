import { ExamScoringRequest, ExamScoringResponse, ExamPaperMetadata } from '../types/ability';

export interface QuestionStat {
  questionId: string;
  errorRate: number; // 0.0 to 1.0
  totalAttempts: number;
}

export interface ExamStatistics {
  averageScore: number;
  medianScore: number;
  questionStats: QuestionStat[];
}

export class ExamScorerService {
  /**
   * Calculates the score for a single student's exam submission.
   */
  static calculateScore(request: ExamScoringRequest, metadata: ExamPaperMetadata): number {
    let totalScore = 0;
    let maxPossibleScore = 0;

    metadata.questions.forEach((q) => {
      const isCorrect = request.gradedResults[q.questionId] || false;
      if (isCorrect) {
        totalScore += q.weight;
      }
      maxPossibleScore += q.weight;
    });

    // Return normalized score (0-100)
    return maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
  }

  /**
   * Calculates the rank of a student among a list of scores.
   */
  static calculateRank(studentScore: number, allScores: number[]): { rank: number; total: number } {
    const sortedScores = [...allScores].sort((a, b) => b - a);
    const rank = sortedScores.findIndex(s => s <= studentScore) + 1;
    return {
      rank: rank > 0 ? rank : sortedScores.length + 1,
      total: sortedScores.length
    };
  }

  /**
   * Generates statistics for an exam based on multiple student results.
   */
  static generateStats(results: Record<string, boolean>[], metadata: ExamPaperMetadata): ExamStatistics {
    const totalStudents = results.length;
    if (totalStudents === 0) {
      return { averageScore: 0, medianScore: 0, questionStats: [] };
    }

    const questionStats: QuestionStat[] = metadata.questions.map(q => {
      const incorrectCount = results.filter(r => !r[q.questionId]).length;
      return {
        questionId: q.questionId,
        errorRate: incorrectCount / totalStudents,
        totalAttempts: totalStudents
      };
    });

    const scores = results.map(r => {
      let s = 0;
      let m = 0;
      metadata.questions.forEach(q => {
        if (r[q.questionId]) s += q.weight;
        m += q.weight;
      });
      return (s / m) * 100;
    });

    const averageScore = scores.reduce((a, b) => a + b, 0) / totalStudents;
    const sortedScores = [...scores].sort((a, b) => a - b);
    const medianScore = sortedScores[Math.floor(totalStudents / 2)];

    return {
      averageScore,
      medianScore,
      questionStats
    };
  }

  /**
   * Mock rank data for demonstration if no backend is available.
   */
  static getMockRank(score: number): ExamScoringResponse {
    // Simulate 100 candidates with scores around 70
    const mockScores = Array.from({ length: 99 }, () => Math.random() * 40 + 50);
    const { rank, total } = this.calculateRank(score, [...mockScores, score]);
    return {
      totalScore: score,
      rank,
      totalCandidates: total
    };
  }
}
